// 日志、JSON 编解码、结构体 ↔ JSON、环境快照。
// 桥上所有别的文件都用它，自己不依赖任何别的桥文件。

#import "NacreBridge.h"

#import <os/log.h>

@implementation NacreBlob
@end

namespace nacre_bridge {

os_log_t JSLog() {
  static os_log_t log = os_log_create("com.orbitlabs.nacre", "js");
  return log;
}

os_log_t RuntimeLog() {
  static os_log_t log = os_log_create("com.orbitlabs.nacre", "runtime");
  return log;
}

const char* LevelName(nacre::LogLevel level) {
  switch (level) {
    case nacre::LogLevel::Debug: return "debug";
    case nacre::LogLevel::Log: return "log";
    case nacre::LogLevel::Info: return "info";
    case nacre::LogLevel::Warn: return "warn";
    case nacre::LogLevel::Error: return "error";
  }
  return "log";
}

// console.* 同时输出到 stdout（终端 / simctl --console-pty 可见）和系统日志（Xcode 控制台可见）
void WriteJSLog(nacre::LogLevel level, const std::string& message) {
  fprintf(stdout, "[JS][%s] %s\n", LevelName(level), message.c_str());
  fflush(stdout);
  os_log_type_t type = OS_LOG_TYPE_DEFAULT;
  if (level == nacre::LogLevel::Error) type = OS_LOG_TYPE_ERROR;
  if (level == nacre::LogLevel::Debug) type = OS_LOG_TYPE_DEBUG;
  os_log_with_type(JSLog(), type, "[%{public}s] %{public}s", LevelName(level), message.c_str());
}

void WriteRuntimeLog(NSString* message) {
  fprintf(stdout, "[nacre] %s\n", message.UTF8String);
  fflush(stdout);
  os_log(RuntimeLog(), "%{public}@", message);
}

double NowMs() { return [NSDate date].timeIntervalSince1970 * 1000.0; }

NSString* BackgroundRefreshName(UIBackgroundRefreshStatus status) {
  switch (status) {
    case UIBackgroundRefreshStatusRestricted: return @"restricted";
    case UIBackgroundRefreshStatusDenied: return @"denied";
    case UIBackgroundRefreshStatusAvailable: return @"available";
  }
  return @"unknown";
}

NSString* SceneActivationName(UISceneActivationState state) {
  switch (state) {
    case UISceneActivationStateUnattached: return @"unattached";
    case UISceneActivationStateForegroundActive: return @"foregroundActive";
    case UISceneActivationStateForegroundInactive: return @"foregroundInactive";
    case UISceneActivationStateBackground: return @"background";
  }
  return @"unknown";
}

const char* StateName(int state) {
  switch (state) {
    case UIApplicationStateActive: return "active";
    case UIApplicationStateInactive: return "inactive";
    case UIApplicationStateBackground: return "background";
  }
  return "unknown";
}

// Info.plist 里绝大多数是字符串/数字/布尔/数组/字典，但不保证全都能 JSON 序列化
// （NSDate、NSData 就不行）。这里递归过一遍，不认识的转成字符串，避免整个序列化失败。
id SanitizeForJSON(id value) {
  // NSNull 本来就是合法的 JSON null，必须原样放行。
  // 漏掉它会落到最后那行 [value description]，把 null 变成字符串 "<null>"。
  if ([value isKindOfClass:NSString.class] || [value isKindOfClass:NSNumber.class] ||
      value == NSNull.null) {
    return value;
  }
  if ([value isKindOfClass:NSArray.class]) {
    NSMutableArray* out = [NSMutableArray arrayWithCapacity:[value count]];
    for (id item in (NSArray*)value) [out addObject:SanitizeForJSON(item)];
    return out;
  }
  if ([value isKindOfClass:NSDictionary.class]) {
    NSMutableDictionary* out = [NSMutableDictionary dictionaryWithCapacity:[value count]];
    for (id key in (NSDictionary*)value) {
      out[[key description]] = SanitizeForJSON(((NSDictionary*)value)[key]);
    }
    return out;
  }
  return [value description];
}

// 只能在主线程调用：下面每一项都是 UIKit 属性。
// backgroundTimeRemaining 不收进来——它是连续变化的值，快照没有意义，
// 而「主线程永远不同步等待 JS」又不允许实时读，等有了别的机制再说。
void RebuildEnvironment(const std::shared_ptr<AppSnapshot>& snapshot) {
  UIApplication* app = UIApplication.sharedApplication;
  NSMutableDictionary* env = [@{
    @"state" : @(StateName((int)app.applicationState)),
    @"supportsMultipleScenes" : @(app.supportsMultipleScenes),
    @"protectedDataAvailable" : @(app.isProtectedDataAvailable),
    @"layoutDirection" : app.userInterfaceLayoutDirection ==
                                 UIUserInterfaceLayoutDirectionRightToLeft
                             ? @"rtl"
                             : @"ltr",
    @"contentSizeCategory" : app.preferredContentSizeCategory ?: @"",
    @"backgroundRefreshStatus" : BackgroundRefreshName(app.backgroundRefreshStatus),
    @"idleTimerDisabled" : @(app.isIdleTimerDisabled),
  } mutableCopy];
  if (@available(iOS 27.0, *)) {
    env[@"prefersReducedResourceUsage"] = @(app.systemPrefersReducedResourceUsage);
  }

  NSData* data = [NSJSONSerialization dataWithJSONObject:env options:0 error:nil];
  std::string json = data ? std::string(static_cast<const char*>(data.bytes), data.length)
                          : std::string("{}");
  std::lock_guard<std::mutex> lock(snapshot->mutex);
  snapshot->environmentJSON = std::move(json);
}

// 值和 JS 之间走 JSON。FragmentsAllowed 让顶层可以是字符串/数字/布尔，
// 不用为标量再包一层数组。
std::string EncodeJSON(id value) {
  id safe = SanitizeForJSON(value ?: NSNull.null);
  NSData* data = [NSJSONSerialization dataWithJSONObject:safe
                                                 options:NSJSONWritingFragmentsAllowed
                                                   error:nil];
  if (!data) return "null";
  return std::string(static_cast<const char*>(data.bytes), data.length);
}

id DecodeJSON(const std::string& json) {
  NSData* data = [NSData dataWithBytes:json.data() length:json.size()];
  id value = [NSJSONSerialization JSONObjectWithData:data
                                             options:NSJSONReadingFragmentsAllowed
                                               error:nil];
  return (value == nil || value == NSNull.null) ? nil : value;
}

// 结构体和 JSON 的互转。线上格式是扁平的（CGRect 是 x/y/width/height，
// 不是嵌套的 origin/size）——JS 侧的 CGRect 类负责提供嵌套视图，
// 线上格式是内部约定，以后换编码不影响 JS。
NSDictionary* PointToJSON(CGPoint p) { return @{@"x": @(p.x), @"y": @(p.y)}; }
NSDictionary* SizeToJSON(CGSize z) { return @{@"width": @(z.width), @"height": @(z.height)}; }
NSDictionary* InsetsToJSON(UIEdgeInsets i) {
  return @{@"top": @(i.top), @"left": @(i.left),
           @"bottom": @(i.bottom), @"right": @(i.right)};
}
NSDictionary* RectToJSON(CGRect r) {
  return @{@"x": @(r.origin.x), @"y": @(r.origin.y),
           @"width": @(r.size.width), @"height": @(r.size.height)};
}
CGPoint JSONToPoint(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGPointMake([d[@"x"] doubleValue], [d[@"y"] doubleValue]);
}
CGSize JSONToSize(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGSizeMake([d[@"width"] doubleValue], [d[@"height"] doubleValue]);
}
CGRect JSONToRect(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGRectMake([d[@"x"] doubleValue], [d[@"y"] doubleValue],
                    [d[@"width"] doubleValue], [d[@"height"] doubleValue]);
}
NSDictionary* TransformToJSON(CGAffineTransform t) {
  return @{@"a": @(t.a), @"b": @(t.b), @"c": @(t.c),
           @"d": @(t.d), @"tx": @(t.tx), @"ty": @(t.ty)};
}
CGAffineTransform JSONToTransform(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGAffineTransformMake([d[@"a"] doubleValue], [d[@"b"] doubleValue],
                               [d[@"c"] doubleValue], [d[@"d"] doubleValue],
                               [d[@"tx"] doubleValue], [d[@"ty"] doubleValue]);
}
UIEdgeInsets JSONToInsets(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return UIEdgeInsetsMake([d[@"top"] doubleValue], [d[@"left"] doubleValue],
                          [d[@"bottom"] doubleValue], [d[@"right"] doubleValue]);
}

// 枚举：JS 侧一律用字符串。名字是我们定的（去掉类型前缀、首字母小写），
// 数值由 SDK 决定——NSTextAlignment 的值随 ABI 变（iOS 上 Center 是 1，
// macOS 上是 2），所以这张表只能放在原生层，JS 里写死索引会错。
//
// 查不到名字时返回 NO，调用方据此让 JS 抛异常。
//
// 错误信息里的可选值列表和真正用来查的表必须是同一份，否则两边会慢慢
// 漂开。所以 NamesForXxx 从同一张表派生，JS 侧不再抄一份。
//
// 名字按枚举数值排序，顺序才稳定——NSDictionary 的遍历顺序是不保证的。

std::string InfoDictionaryJSON() {
  NSDictionary* info = NSBundle.mainBundle.infoDictionary ?: @{};
  id safe = SanitizeForJSON(info);
  NSError* error = nil;
  NSData* data = [NSJSONSerialization dataWithJSONObject:safe options:0 error:&error];
  if (!data) {
    WriteRuntimeLog([NSString stringWithFormat:@"failed to serialize Info.plist: %@", error.localizedDescription]);
    return "{}";
  }
  return std::string(static_cast<const char*>(data.bytes), data.length);
}

}  // namespace nacre_bridge
