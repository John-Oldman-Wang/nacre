// 一个域：网页的自定义协议。session.protocol.serveDirectory(scheme, directory)。
//
// file:// 下的网页没有正常的来源，模块脚本和 fetch 都不通（见 internals/web-view.md）。
// 换成 app://local/… 这样的地址，由我们自己给文件，网页就有了来源 app://local。
//
// WebKit 的做法是 WKURLSchemeHandler：建网页时在 WKWebViewConfiguration 上挂好，
// 建好之后改不了。所以这里分两半：
//
//   注册表   分区 → { 协议名 → 目录 }。JS 的 serveDirectory / unhandle /
//            isProtocolHandled 改的、读的都是它，走 Session 的方法通道
//   建网页时  WebViewConstruct（NacreWebView.mm）调 WebProtocolInstall，把这个
//            分区此刻的注册表抄进配置，一个协议一个处理对象。之后注册表再变，
//            已经建好的网页不受影响
//
// 一个请求：只认 GET 和 HEAD（别的给 405）；路径按目录拼出来，规整之后跑出目录
// 的给 404；是目录就给里面的 index.html；找不到给 404。读文件在后台队列上做，
// 回到主线程交给 WebKit。WebKit 叫停（stopURLSchemeTask:）之后不能再碰那个
// 任务，碰了会抛异常，所以记着哪些还活着。
//
// 不支持分段请求（Range）：一律给整个文件和 200。
#import "NacreBridge.h"
#import <WebKit/WebKit.h>

// 按扩展名定 Content-Type。网页常用的写成一张表（模块脚本要求 JavaScript 的类型，
// wasm 的流式编译要求 application/wasm），表里没有的给 octet-stream。没有去问
// 系统（UTType）：那要多链一个框架，而网页用得到的都在表里
static NSString* WebProtocolMIMEType(NSString* path) {
  NSString* ext = path.pathExtension.lowercaseString;
  static NSDictionary<NSString*, NSString*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"html": @"text/html", @"htm": @"text/html",
      @"js": @"text/javascript", @"mjs": @"text/javascript",
      @"css": @"text/css", @"json": @"application/json", @"map": @"application/json",
      @"wasm": @"application/wasm", @"svg": @"image/svg+xml",
      @"png": @"image/png", @"jpg": @"image/jpeg", @"jpeg": @"image/jpeg",
      @"gif": @"image/gif", @"webp": @"image/webp", @"ico": @"image/x-icon",
      @"woff": @"font/woff", @"woff2": @"font/woff2", @"ttf": @"font/ttf", @"otf": @"font/otf",
      @"txt": @"text/plain", @"xml": @"application/xml",
      @"mp4": @"video/mp4", @"mp3": @"audio/mpeg", @"wav": @"audio/wav",
    };
  });
  return table[ext] ?: @"application/octet-stream";
}

@interface NacreSchemeDirectoryHandler : NSObject <WKURLSchemeHandler>
- (instancetype)initWithDirectory:(NSString*)directory;
@end

@implementation NacreSchemeDirectoryHandler {
  NSString* _directory;
  // 还活着的任务（WebKit 还没叫停、我们还没交完）。只在主线程上碰
  NSHashTable<id<WKURLSchemeTask>>* _live;
}

- (instancetype)initWithDirectory:(NSString*)directory {
  if ((self = [super init])) {
    _directory = [directory copy];
    _live = [NSHashTable hashTableWithOptions:NSPointerFunctionsObjectPointerPersonality];
  }
  return self;
}

// 出错的回答：404、405。带一句纯文本：没有内容类型的话，主页面的这种回答被
// 网页判成「不能显示」，loadURL 就拒绝了（实测）；有了它，主页面照 https 的
// 404 那样显示出来、loadURL 兑现
- (void)answer:(id<WKURLSchemeTask>)task status:(NSInteger)status {
  NSData* body = [(status == 404 ? @"Not Found" : @"Method Not Allowed")
      dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary* headers = @{
    @"Content-Type": @"text/plain; charset=utf-8",
    @"Content-Length": [NSString stringWithFormat:@"%lu", (unsigned long)body.length],
  };
  NSHTTPURLResponse* response = [[NSHTTPURLResponse alloc] initWithURL:task.request.URL
                                                            statusCode:status
                                                           HTTPVersion:@"HTTP/1.1"
                                                          headerFields:headers];
  [task didReceiveResponse:response];
  if (![task.request.HTTPMethod.uppercaseString isEqualToString:@"HEAD"]) [task didReceiveData:body];
  [task didFinish];
  [_live removeObject:task];
}

// 请求的路径 → 目录里的文件。跑出目录返回 nil
- (NSString*)fileForURL:(NSURL*)url {
  // NSURL.path 已经把百分号编码解开了，%2e%2e 在这里是 ..
  NSString* relative = url.path ?: @"/";
  NSString* joined = [[_directory stringByAppendingPathComponent:relative] stringByStandardizingPath];
  if (![joined isEqualToString:_directory] &&
      ![joined hasPrefix:[_directory stringByAppendingString:@"/"]]) {
    return nil;
  }
  return joined;
}

- (void)webView:(WKWebView*)webView startURLSchemeTask:(id<WKURLSchemeTask>)task {
  [_live addObject:task];
  NSString* method = task.request.HTTPMethod.uppercaseString ?: @"GET";
  if (![method isEqualToString:@"GET"] && ![method isEqualToString:@"HEAD"]) {
    [self answer:task status:405];
    return;
  }
  const BOOL head = [method isEqualToString:@"HEAD"];
  NSString* file = [self fileForURL:task.request.URL];
  if (file == nil) {
    [self answer:task status:404];
    return;
  }
  __weak NacreSchemeDirectoryHandler* weakSelf = self;
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    NSString* path = file;
    BOOL isDirectory = NO;
    if ([NSFileManager.defaultManager fileExistsAtPath:path isDirectory:&isDirectory] && isDirectory) {
      path = [path stringByAppendingPathComponent:@"index.html"];
    }
    NSData* data = [NSData dataWithContentsOfFile:path options:NSDataReadingMappedIfSafe error:nil];
    dispatch_async(dispatch_get_main_queue(), ^{
      NacreSchemeDirectoryHandler* me = weakSelf;
      // 叫停过的任务不能再碰
      if (me == nil || ![me->_live containsObject:task]) return;
      if (data == nil) {
        [me answer:task status:404];
        return;
      }
      NSDictionary* headers = @{
        @"Content-Type": WebProtocolMIMEType(path),
        @"Content-Length": [NSString stringWithFormat:@"%lu", (unsigned long)data.length],
      };
      NSHTTPURLResponse* response = [[NSHTTPURLResponse alloc] initWithURL:task.request.URL
                                                                statusCode:200
                                                               HTTPVersion:@"HTTP/1.1"
                                                              headerFields:headers];
      [task didReceiveResponse:response];
      if (!head && data.length > 0) [task didReceiveData:data];
      [task didFinish];
      [me->_live removeObject:task];
    });
  });
}

- (void)webView:(WKWebView*)webView stopURLSchemeTask:(id<WKURLSchemeTask>)task {
  [_live removeObject:task];
}

@end

namespace nacre_bridge {

// 分区 → { 协议名 → 目录的绝对路径 }。只在主线程上用
static NSMutableDictionary<NSString*, NSMutableDictionary<NSString*, NSString*>*>* WebProtocolTable(void) {
  static NSMutableDictionary* table = [NSMutableDictionary dictionary];
  return table;
}

static NSMutableDictionary<NSString*, NSString*>* WebProtocolsOf(NSString* partition) {
  NSMutableDictionary* schemes = WebProtocolTable()[partition];
  if (schemes == nil) {
    schemes = [NSMutableDictionary dictionary];
    WebProtocolTable()[partition] = schemes;
  }
  return schemes;
}

// 建网页时调（NacreWebView.mm 的 WebViewConstruct）：把这个分区此刻注册的协议
// 挂到配置上
void WebProtocolInstall(WKWebViewConfiguration* config, NSString* partition) {
  NSDictionary<NSString*, NSString*>* schemes = WebProtocolTable()[partition ?: @""];
  [schemes enumerateKeysAndObjectsUsingBlock:^(NSString* scheme, NSString* directory, BOOL*) {
    [config setURLSchemeHandler:[[NacreSchemeDirectoryHandler alloc] initWithDirectory:directory]
                   forURLScheme:scheme];
  }];
}

static bool ValidScheme(NSString* scheme) {
  static NSRegularExpression* pattern =
      [NSRegularExpression regularExpressionWithPattern:@"^[a-z][a-z0-9+.-]*$" options:0 error:nil];
  return [pattern numberOfMatchesInString:scheme options:0 range:NSMakeRange(0, scheme.length)] == 1;
}

static bool WebProtocolCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                            std::string* error) {
  if (![sel hasPrefix:@"nacre:"]) return false;
  id partitionValue = [object valueForKey:@"partition"];
  NSString* partition = [partitionValue isKindOfClass:NSString.class] ? partitionValue : @"";
  id scheme = args.value(0);
  if (![scheme isKindOfClass:NSString.class]) {
    *error = "the scheme must be a string";
    return true;
  }
  if ([sel isEqualToString:@"nacre:isProtocolHandled"]) {
    *out = WebProtocolsOf(partition)[scheme] != nil ? "true" : "false";
    return true;
  }
  if ([sel isEqualToString:@"nacre:unhandle"]) {
    [WebProtocolsOf(partition) removeObjectForKey:scheme];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"nacre:serveDirectory"]) {
    if (!ValidScheme(scheme)) {
      *error = std::string("serveDirectory: \"") + [scheme UTF8String] +
               "\" is not a valid scheme; use lowercase letters, digits, +, - and ., "
               "starting with a letter";
      return true;
    }
    if ([WKWebView handlesURLScheme:scheme]) {
      *error = std::string("serveDirectory: \"") + [scheme UTF8String] +
               "\" is handled by WebKit itself; pick another scheme, like app";
      return true;
    }
    id directory = args.value(1);
    if (![directory isKindOfClass:NSString.class] || [directory length] == 0) {
      *error = "serveDirectory: the directory must be a non-empty string";
      return true;
    }
    // 相对路径相对 App 包，和 loadFile、preload 一样
    NSString* path = directory;
    if (![path hasPrefix:@"/"]) {
      path = [NSBundle.mainBundle.bundlePath stringByAppendingPathComponent:path];
    }
    path = [path stringByStandardizingPath];
    BOOL isDirectory = NO;
    if (![NSFileManager.defaultManager fileExistsAtPath:path isDirectory:&isDirectory] || !isDirectory) {
      *error = std::string("serveDirectory: \"") + [directory UTF8String] + "\" is not a directory";
      return true;
    }
    WebProtocolsOf(partition)[scheme] = path;
    *out = "null";
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreWebProtocolDomain : NSObject
@end
@implementation NacreWebProtocolDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "web-protocol";
  // Session 的原生类定义在 NacreWebSession.mm 的实现文件里，这里看不到它的声明
  Class session = NSClassFromString(@"NacreWebSession");
  if (session != Nil) d.classes = {session};
  d.call = nacre_bridge::WebProtocolCall;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
