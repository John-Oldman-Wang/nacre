// URL 解析。NSURLComponents + standardizedURL，和 UIKit 没关系，
// 所以单独一个文件。

#import "NacreBridge.h"

#import <os/log.h>

namespace nacre_bridge {

std::string ParseURL(const std::string& text, const std::string& base) {
  NSString* input = @(text.c_str());
  NSURL* url = nil;
  if (base.empty()) {
    url = [NSURL URLWithString:input];
    // 没有 base 时必须是绝对 URL——我们没有 location，相对路径无依可循
    if (url.scheme.length == 0) return "";
  } else {
    NSURL* baseURL = [NSURL URLWithString:@(base.c_str())];
    if (baseURL == nil || baseURL.scheme.length == 0) return "";
    url = [NSURL URLWithString:input relativeToURL:baseURL];
  }
  if (url == nil) return "";

  // 点段规范化交给系统：实测 standardizedURL 和 WHATWG 的结果一致，
  // 连 '//double' 保留双斜杠、'/../x' 越界不穿透这些边角都对得上。
  // 自己在 JS 里写这个循环既慢又容易错（'//double' 很容易被吞成 '/double'）。
  // 必须先 absoluteURL 再 standardizedURL：对一个相对 URL 直接标准化，
  // NSURL 会先把相对部分自己收干净（'../y' → 'y'）再和 base 组合，
  // 结果是 /a/b/y 而不是 /a/y。
  NSURL* absolute = url.absoluteURL ?: url;
  NSURL* standardized = absolute.standardizedURL ?: absolute;
  NSURLComponents* c = [NSURLComponents componentsWithURL:standardized
                                  resolvingAgainstBaseURL:YES];
  if (c == nil || c.scheme.length == 0) return "";

  // 规范化全在这一层做完，JS 侧只做薄包装：
  //   1. scheme 和 host 小写化
  //   2. 默认端口移除
  //   3. 点段（上面的 standardizedURL）
  NSString* scheme = c.scheme.lowercaseString;
  NSString* host = (c.percentEncodedHost ?: @"").lowercaseString;
  NSString* port = c.port != nil ? c.port.stringValue : @"";
  static NSDictionary<NSString*, NSString*>* defaultPorts = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    defaultPorts = @{@"http" : @"80", @"https" : @"443", @"ws" : @"80",
                     @"wss" : @"443", @"ftp" : @"21"};
  });
  if (port.length > 0 && [defaultPorts[scheme] isEqualToString:port]) port = @"";

  NSString* path = c.percentEncodedPath ?: @"";
  // WHATWG：有 host 的 URL，pathname 至少是 "/"。
  // standardizedURL 把 '/a/..' 收成空串，这里一并补上。
  if (path.length == 0 && host.length > 0) path = @"/";

  NSMutableString* hostPort = [host mutableCopy];
  if (port.length > 0) [hostPort appendFormat:@":%@", port];

  // origin 只对 http(s) 有意义，其余一律 "null"（和 WHATWG 一致）
  NSString* origin = @"null";
  if (([scheme isEqualToString:@"http"] || [scheme isEqualToString:@"https"]) &&
      host.length > 0) {
    origin = [NSString stringWithFormat:@"%@://%@", scheme, hostPort];
  }

  NSDictionary* parts = @{
    @"protocol" : [scheme stringByAppendingString:@":"],
    @"username" : c.percentEncodedUser ?: @"",
    @"password" : c.percentEncodedPassword ?: @"",
    @"hostname" : host,
    @"host" : hostPort,
    @"port" : port,
    @"pathname" : path,
    @"search" : c.percentEncodedQuery.length > 0
                    ? [@"?" stringByAppendingString:c.percentEncodedQuery]
                    : @"",
    @"hash" : c.percentEncodedFragment.length > 0
                  ? [@"#" stringByAppendingString:c.percentEncodedFragment]
                  : @"",
    @"origin" : origin,
  };
  return EncodeJSON(parts);
}

// 带参数的类方法。和实例方法一样，name 是完整的 ObjC selector。

}  // namespace nacre_bridge
