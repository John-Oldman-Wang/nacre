// WebView 的脚本这一半：在网页里执行代码、读预加载脚本的源码。
//
// 从 NacreWebView.mm 拆出来的（那个文件过了 800 行）。那边管视图、加载、
// 导航和消息通道；这边是两个不依赖网页状态的函数。
#import "NacreBridge.h"
#import <WebKit/WebKit.h>

namespace nacre_bridge {

// 把系统交回来的执行结果变成 JSON 装得下的东西。
//   NSDate      JSON.stringify(new Date()) 给的那种写法（ISO 8601，带毫秒）
//   NaN、无穷   null。JSON 里没有它们；不处理的话 NSJSONSerialization 直接抛
static id JSONSafeResult(id value) {
  if (value == nil || value == NSNull.null || [value isKindOfClass:NSString.class]) {
    return value;
  }
  if ([value isKindOfClass:NSNumber.class]) {
    // 这个数是系统从网页带回来的执行结果，不是 JS 传给原生的参数
    NSNumber* number = (NSNumber*)value;
    return isfinite(number.doubleValue) ? number : NSNull.null;
  }
  if ([value isKindOfClass:NSDate.class]) {
    static NSISO8601DateFormatter* formatter;
    static dispatch_once_t once;
    dispatch_once(&once, ^{
      formatter = [NSISO8601DateFormatter new];
      formatter.formatOptions =
          NSISO8601DateFormatWithInternetDateTime | NSISO8601DateFormatWithFractionalSeconds;
    });
    return [formatter stringFromDate:value];
  }
  if ([value isKindOfClass:NSArray.class]) {
    NSMutableArray* out = [NSMutableArray arrayWithCapacity:[value count]];
    for (id item in (NSArray*)value) [out addObject:JSONSafeResult(item) ?: NSNull.null];
    return out;
  }
  if ([value isKindOfClass:NSDictionary.class]) {
    NSMutableDictionary* out = [NSMutableDictionary dictionaryWithCapacity:[value count]];
    for (id key in (NSDictionary*)value) {
      out[[key description]] = JSONSafeResult(((NSDictionary*)value)[key]) ?: NSNull.null;
    }
    return out;
  }
  return [value description];
}

// executeJavaScript(code, isExpression)
//
// Electron 的语义有两条：结果是代码里最后一个表达式的值；结果是 Promise
// 就等它。系统的两个接口各占一条，没有一个两条都占：
//
//   evaluateJavaScript:     给最后一个表达式的值，但结果是 Promise 就报
//                           「不支持的类型」
//   callAsyncJavaScript:    等 Promise，但代码是一个函数体，要自己写 return
//
// 两条都要只能在网页里 eval，而有内容安全策略的网页会拦 eval（实测）。
// 所以分两种：代码整个是一个表达式时，包成 return (…) 走后一个接口，
// Promise 会等；是多条语句时走前一个，取最后的值，不等 Promise。
// 「是不是表达式」由 JS 那边在运行时自己的引擎里判断，网页不参与
void WebExecuteJavaScript(WKWebView* webView, NSString* code, BOOL isExpression,
                          NacreAsyncDone done) {
  void (^finish)(id, NSError*) = ^(id result, NSError* error) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    if (error == nil) {
      // 包一层：没有值（undefined）时不带 value 这个键，JS 那边读出来就是
      // undefined，和 null 分得开
      id safe = JSONSafeResult(result);
      r.json = safe == nil ? @{} : @{@"value" : safe};
      done(r);
      return;
    }
    r.isError = YES;
    r.errorCode = error.code;
    r.errorDomain = error.domain;
    id thrown = error.userInfo[@"WKJavaScriptExceptionMessage"];
    if ([error.domain isEqualToString:WKErrorDomain] &&
        error.code == WKErrorJavaScriptResultTypeIsUnsupported) {
      r.errorName = @"TypeError";
      r.errorMessage = @"executeJavaScript: the result cannot be passed back; it is a "
                       @"function, a DOM node, or a Promise produced by multi-statement code";
    } else if ([thrown isKindOfClass:NSString.class]) {
      // 网页里抛出来的。原文是 "Error: boom" 这种，类名已经在里面
      r.errorName = @"Error";
      r.errorMessage = thrown;
    } else {
      r.errorName = @"Error";
      r.errorMessage = error.localizedDescription ?: @"executeJavaScript failed";
    }
    done(r);
  };
  if (isExpression) {
    // 换行是为了代码结尾有行注释（// …）时，右括号不被注释掉
    [webView callAsyncJavaScript:[NSString stringWithFormat:@"return (%@\n)", code]
                       arguments:nil
                         inFrame:nil
                  inContentWorld:WKContentWorld.pageWorld
               completionHandler:finish];
  } else {
    [webView evaluateJavaScript:code completionHandler:finish];
  }
}

// WebView.readPreload(path)：把预加载脚本的源码读出来。同步——new WebView
// 是同步的，而脚本要在建网页的那一刻就配好；文件很小。路径的规矩和
// loadFile 一样：相对路径相对 App 包，绝对路径原样用
bool WebViewCallClassMethod(const std::string& className, NSString* sel,
                            const NacreArgs& args, std::string* out, std::string* error) {
  if (className != "WebView" || ![sel isEqualToString:@"readPreload:"]) return false;
  id text = args.value(0);
  if (![text isKindOfClass:NSString.class] || [text length] == 0) {
    *error = "preload: the path is empty";
    return true;
  }
  NSString* path = text;
  if (![path hasPrefix:@"/"]) {
    path = [NSBundle.mainBundle.bundlePath stringByAppendingPathComponent:path];
  }
  NSString* source = [NSString stringWithContentsOfFile:path
                                               encoding:NSUTF8StringEncoding
                                                  error:nil];
  if (source == nil) {
    *error = [NSString stringWithFormat:@"preload: cannot read %@ as UTF-8 text", text]
                 .UTF8String;
    return true;
  }
  *out = EncodeJSON(source);
  return true;
}

}  // namespace nacre_bridge
