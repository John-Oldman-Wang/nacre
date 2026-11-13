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
#import <WebKit/WebKit.h>

static NacreWebContentsEmit g_webContentsEmit = nil;
static NacreWebContentsAsk g_webContentsAsk = nil;

// will-navigate 带的 navigationType。Electron 没有这个字段，iOS 有这个事实
// 就给。枚举的规矩照旧：去前缀、首字母小写
namespace nacre_bridge {
NACRE_ENUM_MAP(WebNavigationType, NSInteger,
               @"linkActivated": @(WKNavigationTypeLinkActivated),
               @"formSubmitted": @(WKNavigationTypeFormSubmitted),
               @"backForward": @(WKNavigationTypeBackForward),
               @"reload": @(WKNavigationTypeReload),
               @"formResubmitted": @(WKNavigationTypeFormResubmitted),
               @"other": @(WKNavigationTypeOther))

}  // namespace nacre_bridge


// 事件名照搬 Electron 的 webContents。check-api.sh 拿这张表和 d.ts 的
// WebContentsEventType 对
static NSArray<NSString*>* WebContentsEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[
      @"will-navigate", @"did-start-loading", @"did-stop-loading", @"did-finish-load",
      @"did-fail-load", @"did-navigate", @"page-title-updated", @"ipc-message",
      @"preload-error", @"render-process-gone", @"destroyed"
    ];
  });
  return names;
}

static void* kNacreWebContentsKVO = &kNacreWebContentsKVO;

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

// 网页和 App 之间那条消息通道在网页里的名字：
// window.webkit.messageHandlers.nacreIPC。只有配了预加载脚本才注册
static NSString* const kNacreIPCName = @"nacreIPC";

// 系统的 userContentController **强持有**它的消息处理者，而它自己又被
// WKWebView 的配置拿着。让 NacreWebContents 直接当处理者就成了环，所以隔
// 一个只有弱引用的小对象
@class NacreWebContents;
@interface NacreWebMessageRelay : NSObject <WKScriptMessageHandlerWithReply>
@property(nonatomic, weak) NacreWebContents* contents;
@end

@interface NacreWebContents : NSObject <WKNavigationDelegate>
// close() 之后是 nil。别的方法都先看它
@property(nonatomic, strong, nullable) WKWebView* webView;
@property(nonatomic, copy) NSString* partition;
// 网页的进程没了。下一次导航开始时清掉
@property(nonatomic) BOOL crashed;
// 这一次导航的主文档拿到的 HTTP 状态码。不是 HTTP 的是 -1
@property(nonatomic) NSInteger responseCode;
// App 这边刚调过 loadRequest / reload / goBack / goForward，系统还没来问
// 「放不放行」。用来认出「这一次询问是我们自己发起的导航」
@property(nonatomic) BOOL apiNavigationPending;
// 主文档的一次导航已经开始、还没落地。这期间系统再来问同一个地址，
// 就是服务器重定向
@property(nonatomic) BOOL provisional;
// loadURL 发起、还没有结果的导航 → 兑现它的块。按导航对象的**身份**认，
// 不按「下一个 finish 事件」认：同一张网页上可以连着发起几次加载，后一次
// 会把前一次顶掉，两者的结果不能串
@property(nonatomic, strong) NSMapTable<WKNavigation*, NacreAsyncDone>* pending;
// ipcRenderer.invoke 发来的、还没答复的请求：编号 → 系统给的答复回调
@property(nonatomic, strong) NSMutableDictionary<NSNumber*, void (^)(id, NSString*)>* replies;
@property(nonatomic) NSInteger nextReplyId;
- (instancetype)initWithWebView:(WKWebView*)webView;
- (void)close;
- (void)installPreloadScript:(NSString*)script;
- (void)receiveMessage:(WKScriptMessage*)message reply:(void (^)(id, NSString*))reply;
- (void)answerInvoke:(NSInteger)replyId ok:(BOOL)ok payload:(id)payload;
@end

@implementation NacreWebMessageRelay
- (void)userContentController:(WKUserContentController*)controller
      didReceiveScriptMessage:(WKScriptMessage*)message
                 replyHandler:(void (^)(id, NSString*))replyHandler {
  NacreWebContents* contents = self.contents;
  if (contents == nil) {
    replyHandler(nil, @"the WebContents is gone");
    return;
  }
  [contents receiveMessage:message reply:replyHandler];
}
@end

@implementation NacreWebContents

- (instancetype)initWithWebView:(WKWebView*)webView {
  if ((self = [super init])) {
    _webView = webView;
    _partition = @"";
    _responseCode = -1;
    _replies = [NSMutableDictionary dictionary];
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
  [webView.configuration.userContentController removeAllScriptMessageHandlers];
  self.webView = nil;
  [self rejectPendingExcept:nil name:@"AbortError" message:@"the WebContents was closed"];
  [self failAllInvokes:@"the WebContents was closed"];
  [self emit:@"destroyed" payload:nil];
}

// ---- 预加载脚本和消息 ----

// script 是 JS 那边拼好的一整段：通道的两头（ipcRenderer、contextBridge）
// 加上包在函数里的预加载脚本。文档一开始就注入，只进主文档
- (void)installPreloadScript:(NSString*)script {
  WKUserContentController* controller = self.webView.configuration.userContentController;
  [controller addUserScript:[[WKUserScript alloc]
                                  initWithSource:script
                                   injectionTime:WKUserScriptInjectionTimeAtDocumentStart
                                forMainFrameOnly:YES]];
  NacreWebMessageRelay* relay = [NacreWebMessageRelay new];
  relay.contents = self;
  [controller addScriptMessageHandlerWithReply:relay
                                  contentWorld:WKContentWorld.pageWorld
                                          name:kNacreIPCName];
}

// 网页那头发来一条。内容是一段 JSON 文本：{ kind, channel, args }
//
//   send           转成 ipc-message 事件，当场答复（没有返回值）
//   invoke         记下答复回调，转成内部事件交给 JS；JS 的处理函数有了
//                  结果再调 answerInvoke
//   preload-error  预加载脚本执行时抛了，转成 preload-error 事件
//
// 通道本身在每个框架里都够得着（系统是这么注册的），但通道的两头只注入了
// 主文档。<iframe> 里的脚本直接往通道里塞的消息不收——那里面常常是别人的
// 内容
- (void)receiveMessage:(WKScriptMessage*)message reply:(void (^)(id, NSString*))reply {
  if (!message.frameInfo.isMainFrame) {
    reply(nil, @"messages from subframes are not accepted");
    return;
  }
  id body = message.body;
  id decoded = [body isKindOfClass:NSString.class]
                   ? nacre_bridge::DecodeJSON(((NSString*)body).UTF8String ?: "")
                   : nil;
  NSDictionary* envelope = [decoded isKindOfClass:NSDictionary.class] ? decoded : nil;
  id kind = envelope[@"kind"];
  id channel = envelope[@"channel"];
  id args = envelope[@"args"];
  if (![kind isKindOfClass:NSString.class] || ![channel isKindOfClass:NSString.class] ||
      ![args isKindOfClass:NSArray.class]) {
    reply(nil, @"malformed message");
    return;
  }
  if ([kind isEqualToString:@"send"]) {
    [self emit:@"ipc-message" payload:@{@"channel" : channel, @"args" : args}];
    reply(nil, nil);
  } else if ([kind isEqualToString:@"invoke"]) {
    NSInteger replyId = ++self.nextReplyId;
    self.replies[@(replyId)] = [reply copy];
    [self emit:@"@ipc-invoke"
        payload:@{@"id" : @(replyId), @"channel" : channel, @"args" : args}];
  } else if ([kind isEqualToString:@"preload-error"]) {
    id text = ((NSArray*)args).firstObject;
    [self emit:@"preload-error"
        payload:@{@"message" : [text isKindOfClass:NSString.class] ? text : @""}];
    reply(nil, nil);
  } else {
    reply(nil, @"malformed message");
  }
}

// JS 的处理函数有结果了。payload：成功时是结果的 JSON 文本（没有返回值是
// NSNull），失败时是错误的说明
- (void)answerInvoke:(NSInteger)replyId ok:(BOOL)ok payload:(id)payload {
  void (^reply)(id, NSString*) = self.replies[@(replyId)];
  if (reply == nil) return;   // 已经答过，或者网页已经销毁
  [self.replies removeObjectForKey:@(replyId)];
  if (ok) {
    reply([payload isKindOfClass:NSString.class] ? payload : NSNull.null, nil);
  } else {
    reply(nil, [payload isKindOfClass:NSString.class] ? payload : @"the handler failed");
  }
}

- (void)failAllInvokes:(NSString*)reason {
  NSArray* waiting = self.replies.allValues;
  [self.replies removeAllObjects];
  for (void (^reply)(id, NSString*) in waiting) reply(nil, reason);
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
  self.apiNavigationPending = NO;
  self.provisional = YES;
}

// 去掉 # 和它后面的部分
static NSString* WithoutFragment(NSString* url) {
  NSRange hash = [url rangeOfString:@"#"];
  return hash.location == NSNotFound ? url : [url substringToIndex:hash.location];
}

// 两个地址是不是只有 # 后面不一样（同一个文档里跳锚点，不换文档）
static BOOL OnlyFragmentDiffers(NSString* target, NSString* current) {
  if ([target rangeOfString:@"#"].location != NSNotFound) {
    return [WithoutFragment(target) isEqualToString:WithoutFragment(current)];
  }
  // 实测 iOS 26.0：data: 的网页改锚点，系统交过来的地址里 # 被编码成了
  // %23（NSURL 在这个版本上不认 data: 地址里的锚点，fragment 读出来是
  // nil；iOS 27.2 上是正常的 #）。所以对 data: 多认一种形状：要去的地址
  // 等于当前地址后面接一段 %23 开头的东西。
  // 只盖住「第一次加锚点」。从 %23a 改到 %23b 认不出来，会多派发一次
  // will-navigate——那种跳转系统本来也不让拦，多的只是一个事件
  if ([target hasPrefix:@"data:"] && target.length > current.length &&
      [target hasPrefix:current]) {
    return [[target substringFromIndex:current.length] hasPrefix:@"%23"];
  }
  return NO;
}

// 系统每次要导航之前都来问一句「放不放行」。**原生不做这个决定**：网页
// 自己要跳的时候派发 will-navigate，监听器调了 preventDefault() 就不放，
// 否则放。没人监听就是放行，和不实现这个方法时一样。
//
// 这个回调可以晚点再答（实测晚 2 秒都正常），所以能等 JS 跑完一轮。
//
// 照 Electron，只有**网页自己发起的、主文档的、会换文档的**导航才派发。
// 其余的当场放行。怎么认出「其余的」，靠的是实测（iOS 26.0 和 27.2 一致）：
// 系统来问的那一刻，
//
//   App 发起的（loadRequest / reload / goBack / goForward）
//       webView.URL **已经**等于要去的地址
//   服务器重定向
//       同上，而且前面那次导航已经开始（didStartProvisional 来过）
//   网页发起的（点链接、改 location、提交表单、history.back()）
//       webView.URL 还是当前这一页的地址
//
// 例外是网页自己 location.reload()：要去的地址本来就等于当前地址。所以
// 再配一个标记 apiNavigationPending，只有我们自己调过加载接口才认作
// 「App 发起的」。
- (void)webView:(WKWebView*)webView
    decidePolicyForNavigationAction:(WKNavigationAction*)action
                    decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
  // 新窗口（target="_blank"、window.open，这时 targetFrame 是 nil）和
  // <iframe> 里的导航：不归 will-navigate 管
  if (action.targetFrame == nil || !action.targetFrame.isMainFrame) {
    decisionHandler(WKNavigationActionPolicyAllow);
    return;
  }
  NSString* target = action.request.URL.absoluteString ?: @"";
  NSString* current = webView.URL.absoluteString ?: @"";
  BOOL hasFragment = [target rangeOfString:@"#"].location != NSNotFound;
  if ([target isEqualToString:current]) {
    if (self.apiNavigationPending) {   // App 发起的
      self.apiNavigationPending = NO;
      decisionHandler(WKNavigationActionPolicyAllow);
      return;
    }
    if (self.provisional) {            // 服务器重定向
      decisionHandler(WKNavigationActionPolicyAllow);
      return;
    }
    // 网页把自己导航到带 # 的同一个地址：只是滚到锚点，不换文档
    if (hasFragment && action.navigationType != WKNavigationTypeReload) {
      decisionHandler(WKNavigationActionPolicyAllow);
      return;
    }
    // 剩下的是网页导航到自己（location.reload() 之类），往下派发
  } else if (OnlyFragmentDiffers(target, current)) {
    // 只有 # 后面不一样：同一个文档里跳锚点
    decisionHandler(WKNavigationActionPolicyAllow);
    return;
  }

  if (g_webContentsAsk == nil) {
    decisionHandler(WKNavigationActionPolicyAllow);
    return;
  }
  NSString* json = @(nacre_bridge::EncodeJSON(@{
    @"url" : target,
    @"isMainFrame" : @YES,
    @"navigationType" : nacre_bridge::NameForWebNavigationType(action.navigationType) ?: @"other"
  }).c_str());
  g_webContentsAsk(self, @"will-navigate", json, ^(BOOL prevented) {
    decisionHandler(prevented ? WKNavigationActionPolicyCancel
                              : WKNavigationActionPolicyAllow);
  });
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
  self.provisional = NO;
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
  self.provisional = NO;
  self.apiNavigationPending = NO;
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
  [self failAllInvokes:@"the page's process is gone"];
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
void WebViewSetAsker(NacreWebContentsAsk ask) { g_webContentsAsk = [ask copy]; }

// new WebView({ webPreferences: { partition, preload } })
//
// 到这里的是 webPreferences 那一层，值已经在 JS 侧转过类型。类型不对就
// 建不出来（返回空），不猜
nacre::NativeObjectRef WebViewConstruct(id options) {
  NSDictionary* prefs = [options isKindOfClass:NSDictionary.class] ? options : @{};
  id partitionValue = prefs[@"partition"];
  if (partitionValue != nil && ![partitionValue isKindOfClass:NSString.class]) return {};
  NSString* partition = partitionValue ?: @"";

  WKWebViewConfiguration* config = [WKWebViewConfiguration new];
  // 分区名 → 数据存储的换算在 NacreWebSession.mm，Session 用的是同一个
  config.websiteDataStore = WebStoreForPartition(partition);
  WKWebView* webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:config];
  NacreWebContents* contents = [[NacreWebContents alloc] initWithWebView:webView];
  contents.partition = partition;
  // preloadScript 是 JS 那边读了文件、查过语法、拼好的一整段
  id preloadScript = prefs[@"preloadScript"];
  if (preloadScript != nil && ![preloadScript isKindOfClass:NSString.class]) return {};
  if ([preloadScript length] > 0) [contents installPreloadScript:preloadScript];
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
  // 这张网页用的是哪个分区。contents.session 靠它找到对应的 Session
  if ([sel isEqualToString:@"getPartition"]) {
    *out = EncodeJSON(contents.partition ?: @"");
    return true;
  }
  // 答复网页的 invoke。网页已经销毁时什么都不做（那些请求在销毁时已经
  // 统一答过失败了），所以放在「销毁之后也能调」的这一组
  if ([sel isEqualToString:@"ipcReply"]) {
    NSInteger replyId = NACRE_INT(args.value(0), @"id");
    BOOL ok = NACRE_BOOL(args.value(1), @"ok");
    [contents answerInvoke:replyId ok:ok payload:args.value(2)];
    *out = "null";
    return true;
  }

  static NSSet<NSString*>* known;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    known = [NSSet setWithArray:@[
      @"getURL", @"getTitle", @"isLoading", @"stop", @"reload", @"isCrashed",
      @"canGoBack", @"canGoForward", @"goBack", @"goForward", @"send"
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
  } else if ([sel isEqualToString:@"send"]) {
    // contents.send(channel, ...args)。参数已经是 JSON 文本，交给网页里
    // 那一头去分发。用带参数的调用而不是拼一段代码：频道名和内容都不会
    // 被当成代码执行。网页里没有那一头（没配预加载脚本，或者文档还没
    // 开始）时这条消息就丢了，和 Electron 一样
    id channel = args.value(0);
    id text = args.value(1);
    if (![channel isKindOfClass:NSString.class] || ![text isKindOfClass:NSString.class]) {
      *error = "send needs a channel name and JSON text";
      return true;
    }
    [webView callAsyncJavaScript:@"if (window.__nacreIPCDeliver) window.__nacreIPCDeliver(channel, args);"
                       arguments:@{@"channel" : channel, @"args" : text}
                         inFrame:nil
                  inContentWorld:WKContentWorld.pageWorld
               completionHandler:nil];
  } else if ([sel isEqualToString:@"stop"]) {
    [webView stopLoading];
    contents.apiNavigationPending = NO;
    // 实测：loadURL 之后马上 stop()，那次导航还没真正开始，系统**不会**报
    // 它失败——一个回调都没有，等它的 Promise 会永远挂着。所以这里自己拒掉
    [contents rejectPendingExcept:nil name:@"AbortError" message:@"the load was stopped"];
  } else if ([sel isEqualToString:@"reload"]) {
    // 返回了导航对象才算真的发起了一次导航（空白页上 reload 什么都不做）
    if ([webView reload] != nil) contents.apiNavigationPending = YES;
  } else if ([sel isEqualToString:@"goBack"]) {
    if ([webView goBack] != nil) contents.apiNavigationPending = YES;
  } else if ([sel isEqualToString:@"goForward"]) {
    if ([webView goForward] != nil) contents.apiNavigationPending = YES;
  }
  return true;
}

// 本地网页能读哪个目录。系统要求加载本地文件时说清楚这一点
// （loadFileURL:allowingReadAccessToURL:），不在这个目录下面的文件，网页
// 引用了也加载不出来。
//
//   App 包里的文件      整个 App 包。包是 App 自己的东西，没有要防的
//   别处的文件          文件所在的目录。下载下来的网页只碰得到自己那一包
//
// 模拟器**不执行**这条限制（实测只给了文件所在目录，上一级的图片照样加载
// 出来），所以这个范围定得对不对只有真机上看得出来
static NSURL* ReadAccessRootFor(NSURL* fileURL) {
  NSString* path = fileURL.path.stringByStandardizingPath;
  NSString* bundle = NSBundle.mainBundle.bundlePath.stringByStandardizingPath;
  if ([path isEqualToString:bundle] || [path hasPrefix:[bundle stringByAppendingString:@"/"]]) {
    return NSBundle.mainBundle.bundleURL;
  }
  return fileURL.URLByDeletingLastPathComponent;
}

// loadURL / loadFile：一次性的请求-响应，所以是 Promise（原则 5）。加载完
// 兑现，失败、被停掉、被别的导航顶掉都拒绝
bool WebViewCallAsync(id object, const std::string& name, const std::string& argsJSON,
                      const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacreWebContents.class]) return false;
  if (name != "loadURL" && name != "loadFile" && name != "executeJavaScript") return false;
  NacreWebContents* contents = (NacreWebContents*)object;
  WKWebView* webView = contents.webView;
  if (webView == nil) {
    RejectLoad(done, @"TypeError", @"Object has been destroyed", 0, @"");
    return true;
  }
  id decoded = DecodeJSON(argsJSON);
  NSArray* values = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id text = values.count > 0 ? values[0] : nil;

  if (name == "executeJavaScript") {
    id flag = values.count > 1 ? values[1] : nil;
    if (![text isKindOfClass:NSString.class] || ![flag isKindOfClass:NSNumber.class]) {
      RejectLoad(done, @"TypeError", @"executeJavaScript needs the code as a string", 0, @"");
      return true;
    }
    WebExecuteJavaScript(webView, text, [flag boolValue], done);
    return true;
  }

  NSURL* url = nil;
  if (name == "loadFile") {
    // loadFile(path, suffix)。相对路径相对 App 包（和 UIImage.imageNamed 的
    // 'JS/assets/…' 一个起点），绝对路径原样用。suffix 是 JS 那边拼好的
    // ?… 和 #…，可以是空串
    if (![text isKindOfClass:NSString.class] || [text length] == 0) {
      RejectLoad(done, @"TypeError", @"loadFile: the path is empty", 0, @"");
      return true;
    }
    NSString* path = text;
    if (![path hasPrefix:@"/"]) {
      path = [NSBundle.mainBundle.bundlePath stringByAppendingPathComponent:path];
    }
    NSURL* fileURL = [NSURL fileURLWithPath:path];
    id suffix = values.count > 1 ? values[1] : nil;
    if ([suffix isKindOfClass:NSString.class] && [suffix length] > 0) {
      url = [NSURL URLWithString:[fileURL.absoluteString stringByAppendingString:suffix]];
      if (url == nil || !url.isFileURL) {
        RejectLoad(done, @"TypeError", @"loadFile: the search or hash is not valid in a URL",
                   0, @"");
        return true;
      }
    } else {
      url = fileURL;
    }
  } else {
    url = [text isKindOfClass:NSString.class] && [text length] > 0
              ? [NSURL URLWithString:text]
              : nil;
    if (url == nil || url.scheme.length == 0) {
      RejectLoad(done, @"TypeError",
                 @"loadURL: invalid URL; it must include the scheme, like https://", 0, @"");
      return true;
    }
  }

  // file: 的地址不管从哪个入口来，都走专门加载本地文件的那个接口——
  // 它带着「能读哪个目录」。用普通的 loadRequest: 加载本地文件，真机上
  // 读不到页面引用的别的文件
  WKNavigation* navigation =
      url.isFileURL ? [webView loadFileURL:url allowingReadAccessToURL:ReadAccessRootFor(url)]
                    : [webView loadRequest:[NSURLRequest requestWithURL:url]];
  if (navigation == nil) {
    RejectLoad(done, @"Error", @"the page refused to start loading", 0, @"");
    return true;
  }
  contents.apiNavigationPending = YES;
  [contents.pending setObject:[done copy] forKey:navigation];
  return true;
}

}  // namespace nacre_bridge
