// WebView：把网页放进界面。
//
// 上层标准，形状照 Electron 的 BrowserWindow / WebContentsView 那一套：
//
//   WebView       一个视图，摆放、大小、显示隐藏都用视图自己的写法
//   webContents   里面那张网页：加载、导航、事件
//
// 底下是 WKWebView，但那个类不暴露——和 fetch 之于 NSURLSession 一个分工。
//
// 两个原生对象，对应 JS 的两个类：
//
//   NacreWebView      UIView 的子类，是个壳：里面只放一个铺满的 WKWebView
//   NacreWebContents  拿着 WKWebView，当它的 delegate，记加载的状态
//
// 为什么要套一层壳，而不是让 JS 的 WebView 直接对着 WKWebView：**销毁**。
// 一张网页背后是一个独立的进程（模拟器上实测每张 62–68 MB），而公开接口里
// 让这个进程退出的办法只有一个——WKWebView 自己被释放。JS 包装拿着的是壳，
// 所以 close() 可以把里面的 WKWebView 放掉，壳照常是一个能用的（空的）视图。
//
// 这个文件**不认识 NacreRuntime**：事件通过启动时塞进来的 emit 块出去，
// 和 NacreWebSocket.mm 同一个路子。
#import "NacreBridge.h"
#import <CommonCrypto/CommonDigest.h>
#import <WebKit/WebKit.h>

static NacreWebContentsEmit g_webContentsEmit = nil;

// 事件名照搬 Electron 的 webContents。check-api.sh 拿这张表和 d.ts 的
// WebContentsEventType 对
static NSArray<NSString*>* WebContentsEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[
      @"did-start-loading", @"did-stop-loading", @"did-finish-load", @"did-fail-load",
      @"did-navigate", @"page-title-updated", @"render-process-gone", @"destroyed"
    ];
  });
  return names;
}

static void* kNacreWebContentsKVO = &kNacreWebContentsKVO;

// ---- 存储分区 ----
//
// partition 的三种写法照 Electron：
//   不写 / 空串        默认的存储，落盘
//   'persist:名字'     落盘，同名的网页共用一份
//   '名字'             只在内存里，同名的网页共用一份，进程退出就没了
//
// 落盘的分区用 dataStoreForIdentifier:，它要一个 UUID 而不是名字。所以从
// 名字**算**出一个固定的 UUID——同一个名字每次启动都得到同一个，数据才
// 接得上。不能随机生成再存起来：那就多了一份要自己管的映射表
static NSUUID* UUIDForPartitionName(NSString* name) {
  NSData* data = [[@"nacre.partition:" stringByAppendingString:name]
      dataUsingEncoding:NSUTF8StringEncoding];
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(data.bytes, (CC_LONG)data.length, digest);
  // UUID 的版本位和变体位。标成第 5 版（由名字派生）
  digest[6] = (digest[6] & 0x0F) | 0x50;
  digest[8] = (digest[8] & 0x3F) | 0x80;
  return [[NSUUID alloc] initWithUUIDBytes:digest];
}

static WKWebsiteDataStore* StoreForPartition(NSString* partition) {
  if (partition.length == 0) return WKWebsiteDataStore.defaultDataStore;
  if ([partition hasPrefix:@"persist:"]) {
    NSString* name = [partition substringFromIndex:8];
    if (name.length == 0) return WKWebsiteDataStore.defaultDataStore;
    return [WKWebsiteDataStore dataStoreForIdentifier:UUIDForPartitionName(name)];
  }
  // 内存分区：系统每次给的都是一份新的，「同名共用」要自己记。记到进程
  // 结束为止——和 Electron 的内存 session 一样长
  static NSMutableDictionary<NSString*, WKWebsiteDataStore*>* memory;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ memory = [NSMutableDictionary dictionary]; });
  WKWebsiteDataStore* store = memory[partition];
  if (store == nil) {
    store = WKWebsiteDataStore.nonPersistentDataStore;
    memory[partition] = store;
  }
  return store;
}

// ---- 兑现 loadURL 的 Promise ----
static void ResolveLoad(NacreAsyncDone done) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.boolValue = YES;
  done(r);
}

static void RejectLoad(NacreAsyncDone done, NSString* name, NSString* message,
                       NSInteger code, NSString* domain) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = name;
  r.errorMessage = message;
  r.errorCode = code;
  r.errorDomain = domain;
  done(r);
}

// 系统给的错误怎么归类：被停掉或被顶掉的是 AbortError（和 fetch 的取消
// 同名），网络层的是 NetworkError，其余不归类。事实（code / domain）原样带着
static void RejectLoadWithError(NacreAsyncDone done, NSError* error) {
  BOOL network = [error.domain isEqualToString:NSURLErrorDomain];
  NSString* name = (network && error.code == NSURLErrorCancelled) ? @"AbortError"
                   : network                                      ? @"NetworkError"
                                                                  : @"Error";
  RejectLoad(done, name, error.localizedDescription ?: @"the page failed to load",
             error.code, error.domain);
}

@interface NacreWebContents : NSObject <WKNavigationDelegate>
// close() 之后是 nil。别的方法都先看它
@property(nonatomic, strong, nullable) WKWebView* webView;
@property(nonatomic, copy) NSString* partition;
// 网页的进程没了。下一次导航开始时清掉
@property(nonatomic) BOOL crashed;
// 这一次导航的主文档拿到的 HTTP 状态码。不是 HTTP 的是 -1
@property(nonatomic) NSInteger responseCode;
// loadURL 发起、还没有结果的导航 → 兑现它的块。按导航对象的**身份**认，
// 不按「下一个 finish 事件」认：同一张网页上可以连着发起几次加载，后一次
// 会把前一次顶掉，两者的结果不能串
@property(nonatomic, strong) NSMapTable<WKNavigation*, NacreAsyncDone>* pending;
- (instancetype)initWithWebView:(WKWebView*)webView;
- (void)close;
@end

@implementation NacreWebContents

- (instancetype)initWithWebView:(WKWebView*)webView {
  if ((self = [super init])) {
    _webView = webView;
    _partition = @"";
    _responseCode = -1;
    _pending = [NSMapTable
        mapTableWithKeyOptions:NSPointerFunctionsStrongMemory |
                               NSPointerFunctionsObjectPointerPersonality
                  valueOptions:NSPointerFunctionsStrongMemory];
    webView.navigationDelegate = self;
    // 「在不在加载」和标题没有 delegate 回调，只能 KVO
    [webView addObserver:self
              forKeyPath:@"loading"
                 options:NSKeyValueObservingOptionNew
                 context:kNacreWebContentsKVO];
    [webView addObserver:self
              forKeyPath:@"title"
                 options:NSKeyValueObservingOptionNew
                 context:kNacreWebContentsKVO];
  }
  return self;
}

- (void)stopObserving:(WKWebView*)webView {
  [webView removeObserver:self forKeyPath:@"loading" context:kNacreWebContentsKVO];
  [webView removeObserver:self forKeyPath:@"title" context:kNacreWebContentsKVO];
  webView.navigationDelegate = nil;
}

- (void)dealloc {
  if (_webView != nil) [self stopObserving:_webView];
}

- (void)emit:(NSString*)type payload:(id)payload {
  if (g_webContentsEmit == nil) return;
  NSString* json =
      payload == nil ? nil : @(nacre_bridge::EncodeJSON(payload).c_str());
  g_webContentsEmit(self, type, json);
}

// 把还挂着的加载都拒掉，keep 那一个除外（nil 就是全部）
- (void)rejectPendingExcept:(WKNavigation*)keep
                       name:(NSString*)name
                    message:(NSString*)message {
  NSMutableArray<NacreAsyncDone>* dropped = [NSMutableArray array];
  // ObjC++ 里三目的两支不能一边是 nil 一边是 block，所以分两句
  NacreAsyncDone kept = nil;
  if (keep != nil) kept = [self.pending objectForKey:keep];
  for (WKNavigation* navigation in self.pending) {
    if (navigation != keep) [dropped addObject:[self.pending objectForKey:navigation]];
  }
  [self.pending removeAllObjects];
  if (kept != nil) [self.pending setObject:kept forKey:keep];
  for (NacreAsyncDone done in dropped) {
    RejectLoad(done, name, message, NSURLErrorCancelled, NSURLErrorDomain);
  }
}

// 销毁：放掉里面的 WKWebView，它的进程跟着退出。壳还在，是个空视图
- (void)close {
  WKWebView* webView = self.webView;
  if (webView == nil) return;
  [self stopObserving:webView];
  [webView stopLoading];
  [webView removeFromSuperview];
  self.webView = nil;
  [self rejectPendingExcept:nil name:@"AbortError" message:@"the WebContents was closed"];
  [self emit:@"destroyed" payload:nil];
}

- (void)observeValueForKeyPath:(NSString*)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id>*)change
                       context:(void*)context {
  if (context != kNacreWebContentsKVO) {
    [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    return;
  }
  WKWebView* webView = self.webView;
  if (webView == nil || object != webView) return;
  if ([keyPath isEqualToString:@"loading"]) {
    [self emit:webView.isLoading ? @"did-start-loading" : @"did-stop-loading" payload:nil];
  } else if ([keyPath isEqualToString:@"title"]) {
    [self emit:@"page-title-updated" payload:@{@"title" : webView.title ?: @""}];
  }
}

// ---- WKNavigationDelegate ----

- (void)webView:(WKWebView*)webView
    didStartProvisionalNavigation:(WKNavigation*)navigation {
  self.crashed = NO;
  self.responseCode = -1;
}

// 实现这个方法只为了**读状态码**——那个数在别处拿不到。放不放行照系统
// 不实现这个方法时的做法：能显示的就放行，不能显示的取消。不在这里做决定
- (void)webView:(WKWebView*)webView
    decidePolicyForNavigationResponse:(WKNavigationResponse*)navigationResponse
                      decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler {
  if (navigationResponse.isForMainFrame) {
    NSURLResponse* response = navigationResponse.response;
    self.responseCode = [response isKindOfClass:NSHTTPURLResponse.class]
                            ? ((NSHTTPURLResponse*)response).statusCode
                            : -1;
  }
  decisionHandler(navigationResponse.canShowMIMEType ? WKNavigationResponsePolicyAllow
                                                     : WKNavigationResponsePolicyCancel);
}

- (void)webView:(WKWebView*)webView didCommitNavigation:(WKNavigation*)navigation {
  // 这一次导航落地了，别的还挂着的加载就是被它顶掉的
  [self rejectPendingExcept:navigation
                       name:@"AbortError"
                    message:@"the load was superseded by another navigation"];
  [self emit:@"did-navigate"
      payload:@{
        @"url" : webView.URL.absoluteString ?: @"",
        @"httpResponseCode" : @(self.responseCode)
      }];
}

- (void)webView:(WKWebView*)webView didFinishNavigation:(WKNavigation*)navigation {
  [self emit:@"did-finish-load" payload:nil];
  NacreAsyncDone done = nil;
  if (navigation != nil) done = [self.pending objectForKey:navigation];
  if (done != nil) {
    [self.pending removeObjectForKey:navigation];
    ResolveLoad(done);
  }
}

- (void)navigation:(WKNavigation*)navigation failedWithError:(NSError*)error {
  // 失败的地址。实测网页这边的错误里只有 NSURL 的那个键，没有字符串的那个
  // （NSURLSession 的错误两个都有）。两个都认
  id failing = error.userInfo[NSURLErrorFailingURLErrorKey];
  if ([failing isKindOfClass:NSURL.class]) failing = ((NSURL*)failing).absoluteString;
  if (![failing isKindOfClass:NSString.class]) {
    failing = error.userInfo[NSURLErrorFailingURLStringErrorKey];
  }
  [self emit:@"did-fail-load"
      payload:@{
        @"errorCode" : @(error.code),
        @"errorDescription" : error.localizedDescription ?: @"",
        @"validatedURL" : [failing isKindOfClass:NSString.class] ? failing : @"",
        // 这个 delegate 只报主文档的导航，子框架的失败到不了这里
        @"isMainFrame" : @YES
      }];
  NacreAsyncDone done = nil;
  if (navigation != nil) done = [self.pending objectForKey:navigation];
  if (done != nil) {
    [self.pending removeObjectForKey:navigation];
    RejectLoadWithError(done, error);
  }
}

- (void)webView:(WKWebView*)webView
    didFailProvisionalNavigation:(WKNavigation*)navigation
                       withError:(NSError*)error {
  [self navigation:navigation failedWithError:error];
}

- (void)webView:(WKWebView*)webView
    didFailNavigation:(WKNavigation*)navigation
            withError:(NSError*)error {
  [self navigation:navigation failedWithError:error];
}

// 网页的进程没了（崩了，或者系统内存紧张把它杀了——公开接口不说是哪种）
- (void)webViewWebContentProcessDidTerminate:(WKWebView*)webView {
  self.crashed = YES;
  [self rejectPendingExcept:nil
                       name:@"Error"
                    message:@"the page's process is gone"];
  [self emit:@"render-process-gone" payload:nil];
}

@end

// 壳。里面只有一个铺满的 WKWebView，跟着壳的大小走
@interface NacreWebView : UIView
@property(nonatomic, strong, readonly) NacreWebContents* contents;
- (instancetype)initWithContents:(NacreWebContents*)contents;
@end

@implementation NacreWebView

- (instancetype)initWithContents:(NacreWebContents*)contents {
  if ((self = [super initWithFrame:CGRectZero])) {
    _contents = contents;
    WKWebView* webView = contents.webView;
    webView.frame = self.bounds;
    webView.autoresizingMask =
        UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self addSubview:webView];
  }
  return self;
}

@end

namespace nacre_bridge {

void WebViewSetEmitter(NacreWebContentsEmit emit) { g_webContentsEmit = [emit copy]; }

// new WebView({ webPreferences: { partition } })
//
// 到这里的是 webPreferences 那一层，值已经在 JS 侧转过类型。类型不对就
// 建不出来（返回空），不猜
nacre::NativeObjectRef WebViewConstruct(id options) {
  NSDictionary* prefs = [options isKindOfClass:NSDictionary.class] ? options : @{};
  id partitionValue = prefs[@"partition"];
  if (partitionValue != nil && ![partitionValue isKindOfClass:NSString.class]) return {};
  NSString* partition = partitionValue ?: @"";

  WKWebViewConfiguration* config = [WKWebViewConfiguration new];
  config.websiteDataStore = StoreForPartition(partition);
  WKWebView* webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:config];
  NacreWebContents* contents = [[NacreWebContents alloc] initWithWebView:webView];
  contents.partition = partition;
  NacreWebView* view = [[NacreWebView alloc] initWithContents:contents];
  return {(void*)CFAutorelease(CFBridgingRetain(view)), "WebView"};
}

nacre::NativeObjectRef ReadWebViewObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:NacreWebView.class] && name == "webContents") {
    return {(__bridge void*)((NacreWebView*)object).contents, "WebContents"};
  }
  return {};
}

// 只校验名字。delegate 一直在发，没人听时派发自然是空操作
bool WebContentsSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:NacreWebContents.class]) return false;
  NSArray<NSString*>* names = WebContentsEventNamesList();
  if (![names containsObject:type]) {
    *error = EnumError(@"addEventListener", type, [names componentsJoinedByString:@" / "]);
  }
  return true;
}

bool WebViewCallMethod(id object, NSString* sel, const NacreArgs& args,
                       std::string* out, std::string* error) {
  if (![object isKindOfClass:NacreWebContents.class]) return false;
  NacreWebContents* contents = (NacreWebContents*)object;
  WKWebView* webView = contents.webView;

  // 这两个销毁之后也能调
  if ([sel isEqualToString:@"isDestroyed"]) {
    *out = webView == nil ? "true" : "false";
    return true;
  }
  if ([sel isEqualToString:@"close"]) {
    [contents close];
    *out = "null";
    return true;
  }

  static NSSet<NSString*>* known;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    known = [NSSet setWithArray:@[
      @"getURL", @"getTitle", @"isLoading", @"stop", @"reload", @"isCrashed",
      @"canGoBack", @"canGoForward", @"goBack", @"goForward"
    ]];
  });
  if (![known containsObject:sel]) return false;
  if (webView == nil) {
    // 和 Electron 同一句
    *error = "Object has been destroyed";
    return true;
  }

  *out = "null";
  if ([sel isEqualToString:@"getURL"]) {
    *out = EncodeJSON(webView.URL.absoluteString ?: @"");
  } else if ([sel isEqualToString:@"getTitle"]) {
    *out = EncodeJSON(webView.title ?: @"");
  } else if ([sel isEqualToString:@"isLoading"]) {
    *out = webView.isLoading ? "true" : "false";
  } else if ([sel isEqualToString:@"isCrashed"]) {
    *out = contents.crashed ? "true" : "false";
  } else if ([sel isEqualToString:@"canGoBack"]) {
    *out = webView.canGoBack ? "true" : "false";
  } else if ([sel isEqualToString:@"canGoForward"]) {
    *out = webView.canGoForward ? "true" : "false";
  } else if ([sel isEqualToString:@"stop"]) {
    [webView stopLoading];
    // 实测：loadURL 之后马上 stop()，那次导航还没真正开始，系统**不会**报
    // 它失败——一个回调都没有，等它的 Promise 会永远挂着。所以这里自己拒掉
    [contents rejectPendingExcept:nil name:@"AbortError" message:@"the load was stopped"];
  } else if ([sel isEqualToString:@"reload"]) {
    [webView reload];
  } else if ([sel isEqualToString:@"goBack"]) {
    [webView goBack];
  } else if ([sel isEqualToString:@"goForward"]) {
    [webView goForward];
  }
  return true;
}

// loadURL：一次性的请求-响应，所以是 Promise（原则 5）。加载完兑现，
// 失败、被停掉、被别的导航顶掉都拒绝
bool WebViewCallAsync(id object, const std::string& name, const std::string& argsJSON,
                      const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacreWebContents.class]) return false;
  if (name != "loadURL") return false;
  NacreWebContents* contents = (NacreWebContents*)object;
  WKWebView* webView = contents.webView;
  if (webView == nil) {
    RejectLoad(done, @"TypeError", @"Object has been destroyed", 0, @"");
    return true;
  }
  id decoded = DecodeJSON(argsJSON);
  NSArray* values = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id text = values.count > 0 ? values[0] : nil;
  NSURL* url = [text isKindOfClass:NSString.class] && [text length] > 0
                   ? [NSURL URLWithString:text]
                   : nil;
  if (url == nil || url.scheme.length == 0) {
    RejectLoad(done, @"TypeError",
               @"loadURL: invalid URL; it must include the scheme, like https://", 0, @"");
    return true;
  }
  WKNavigation* navigation = [webView loadRequest:[NSURLRequest requestWithURL:url]];
  if (navigation == nil) {
    RejectLoad(done, @"Error", @"loadURL: the page refused to start loading", 0, @"");
    return true;
  }
  [contents.pending setObject:[done copy] forKey:navigation];
  return true;
}

}  // namespace nacre_bridge
