#import "NacreRuntime.h"

#import <UIKit/UIKit.h>
#import <os/log.h>

#include <memory>
#include <mutex>
#include <string>

#include "Engine/Engine.h"

namespace {

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

// application 的数据快照：主线程写，JS 线程读。
// UIKit 只能在主线程访问，所以这里缓存值，JS 线程上的回调只读缓存，绝不碰 UIKit。
struct AppSnapshot {
  std::string infoJSON;                 // 启动时抓一次，之后不变
  std::mutex mutex;                     // 保护下面这个
  std::string environmentJSON = "{}";   // 主线程在相关通知到达时重建
};

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

// 属性分发表。加一个属性只要在这里加一行，不用动 C++ 的桥。
// 这是手写方案，撑得过 scene / window 这几个类；到 UIView 那一层
// （成百上千个属性）就必须换成通用的能力暴露方案了。
std::string ReadNativeProperty(id object, const std::string& name) {
  NSString* key = @(name.c_str());
  id value = nil;
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"activationState"]) {
      value = SceneActivationName(scene.activationState);
    } else if ([key isEqualToString:@"title"]) {
      value = scene.title;
    } else if ([key isEqualToString:@"subtitle"]) {
      value = scene.subtitle;
    } else if ([key isEqualToString:@"isFullScreen"] &&
               [scene isKindOfClass:UIWindowScene.class]) {
      value = @(((UIWindowScene*)scene).isFullScreen);
    }
  } else if ([object isKindOfClass:UISceneSession.class]) {
    UISceneSession* session = (UISceneSession*)object;
    if ([key isEqualToString:@"role"]) {
      value = session.role;
    } else if ([key isEqualToString:@"persistentIdentifier"]) {
      value = session.persistentIdentifier;
    } else if ([key isEqualToString:@"userInfo"]) {
      value = session.userInfo;
    }
  }
  return EncodeJSON(value);
}

void WriteNativeProperty(id object, const std::string& name, const std::string& json) {
  NSString* key = @(name.c_str());
  id value = DecodeJSON(json);
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"title"]) {
      scene.title = [value isKindOfClass:NSString.class] ? value : nil;
    } else if ([key isEqualToString:@"subtitle"]) {
      scene.subtitle = [value isKindOfClass:NSString.class] ? value : @"";
    }
  } else if ([object isKindOfClass:UISceneSession.class]) {
    if ([key isEqualToString:@"userInfo"]) {
      ((UISceneSession*)object).userInfo = [value isKindOfClass:NSDictionary.class] ? value : nil;
    }
  }
}

nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIScene.class] && name == "session") {
    return {(__bridge void*)((UIScene*)object).session, "UISceneSession"};
  }
  return {};
}

std::string InfoDictionaryJSON() {
  NSDictionary* info = NSBundle.mainBundle.infoDictionary ?: @{};
  id safe = SanitizeForJSON(info);
  NSError* error = nil;
  NSData* data = [NSJSONSerialization dataWithJSONObject:safe options:0 error:&error];
  if (!data) {
    WriteRuntimeLog([NSString stringWithFormat:@"Info.plist 序列化失败: %@", error.localizedDescription]);
    return "{}";
  }
  return std::string(static_cast<const char*>(data.bytes), data.length);
}

}  // namespace

@implementation NacreRuntime {
  BOOL _started;
  // JS 跑在主线程，所以这些都只在主线程上创建、使用和销毁
  std::shared_ptr<std::unique_ptr<nacre::Engine>> _engine;
  std::shared_ptr<AppSnapshot> _snapshot;
  NSMutableArray* _observers;
  // 主线程即将空闲时把时间交给 V8 做增量 GC
  CFRunLoopObserverRef _idleObserver;
}

- (instancetype)init {
  if ((self = [super init])) {
    _engine = std::make_shared<std::unique_ptr<nacre::Engine>>();
    _snapshot = std::make_shared<AppSnapshot>();
    _observers = [NSMutableArray array];
  }
  return self;
}

- (void)startWithScriptsDirectory:(NSURL *)directory {
  if (_started) return;
  _started = YES;

  // 环境快照。JS 现在和 UIKit 同线程，本可以直接读，
  // 但保留快照能让 environmentJSON 一次拿齐，少几次 UIKit 往返。
  _snapshot->infoJSON = InfoDictionaryJSON();
  RebuildEnvironment(_snapshot);

  auto engine = _engine;
  auto snapshot = _snapshot;
  NSURL* dir = [directory copy];
  __weak NacreRuntime* weakSelf = self;

  // 1. 初始化 V8、创建 Isolate / Context、准备全局对象
  [self postToJS:^{
    double t0 = NowMs();
    nacre::Engine::InitializeV8Once();
    double t1 = NowMs();

    nacre::EngineHost host;
    host.log = WriteJSLog;
    host.app_info_json = [snapshot]() { return snapshot->infoJSON; };
    host.app_environment_json = [snapshot]() {
      std::lock_guard<std::mutex> lock(snapshot->mutex);
      return snapshot->environmentJSON;
    };
    // 系统要用 completionHandler 回答，所以这个天然是异步的，返回 Promise
    host.open_url = [weakSelf](const std::string& url, int callId) {
      NSString* text = [NSString stringWithUTF8String:url.c_str()];
      NSURL* target = text.length ? [NSURL URLWithString:text] : nil;
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      if (!target) {
        [strongSelf settleCall:callId with:NO];
        return;
      }
      [UIApplication.sharedApplication openURL:target
                                       options:@{}
                             completionHandler:^(BOOL success) {
                               [strongSelf settleCall:callId with:success];
                             }];
    };
    // JS 和 UIKit 同线程，直接写就行，不用再切线程
    host.set_idle_timer_disabled = [snapshot](bool disabled) {
      UIApplication.sharedApplication.idleTimerDisabled = disabled;
      RebuildEnvironment(snapshot);
    };

    // 原生对象的引用计数。统一强引用：JS 包装活着时原生对象就不会被释放，
    // 这样不会有悬空指针。最坏情况只是数据过期（比如场景已断开）。
    host.retain_native = [](void* ptr) {
      if (ptr) CFRetain((CFTypeRef)ptr);
    };
    host.release_native = [](void* ptr) {
      if (ptr) CFRelease((CFTypeRef)ptr);
    };
    host.app_scenes = []() {
      std::vector<nacre::NativeObjectRef> refs;
      for (UIScene* scene in UIApplication.sharedApplication.connectedScenes) {
        if (![scene isKindOfClass:UIWindowScene.class]) continue;
        refs.push_back({(__bridge void*)scene, "UIWindowScene"});
      }
      return refs;
    };
    host.read_property = [](void* ptr, const std::string& name) {
      return ReadNativeProperty((__bridge id)ptr, name);
    };
    host.write_property = [](void* ptr, const std::string& name, const std::string& json) {
      WriteNativeProperty((__bridge id)ptr, name, json);
    };
    host.read_object_property = [](void* ptr, const std::string& name) {
      return ReadNativeObjectProperty((__bridge id)ptr, name);
    };
    host.call_async = [weakSelf](void* ptr, const std::string& name,
                                 const std::string& argsJSON, int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      id object = (__bridge id)ptr;
      if ([object isKindOfClass:UIScene.class] && name == "openURL") {
        NSArray* args = DecodeJSON(argsJSON);
        NSString* text = [args isKindOfClass:NSArray.class] ? args.firstObject : nil;
        NSURL* url = [text isKindOfClass:NSString.class] ? [NSURL URLWithString:text] : nil;
        if (!url) {
          [strongSelf settleCall:callId with:NO];
          return;
        }
        [(UIScene*)object openURL:url
                          options:nil
                completionHandler:^(BOOL success) {
                  [strongSelf settleCall:callId with:success];
                }];
        return;
      }
      [strongSelf settleCall:callId with:NO];
    };
    *engine = std::make_unique<nacre::Engine>(std::move(host));
    double t2 = NowMs();

    WriteRuntimeLog([NSString stringWithFormat:@"V8 %s initialized in %.1f ms, context ready in %.1f ms",
                                               nacre::Engine::V8Version(), t1 - t0, t2 - t1]);
  }];

  // 2. 执行内置脚本，装上 EventTarget / Event / Application / application
  [self postToJS:^{
    if (!*engine) return;
    NSURL* url = [NSBundle.mainBundle URLForResource:@"nacre" withExtension:@"js" subdirectory:@"Builtin"];
    NSString* source = url ? [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil] : nil;
    if (!source) {
      WriteRuntimeLog(@"内置脚本 Builtin/nacre.js 缺失，上层 API 不可用");
      return;
    }
    // 脚本名用 nacre:internal/ 前缀而不是文件路径：调用栈里一眼能看出是运行时内部，
    // 和 Node 的 node:internal/... 同样的做法
    double t0 = NowMs();
    bool ok = (*engine)->Evaluate({"nacre:internal/nacre.js", source.UTF8String});
    WriteRuntimeLog([NSString stringWithFormat:@"内置脚本 %@ in %.1f ms", ok ? @"ready" : @"failed", NowMs() - t0]);
  }];

  // 3. 加载并执行 main.js
  [self postToJS:^{
    if (!*engine) return;
    NSURL* url = [dir URLByAppendingPathComponent:@"main.js"];
    NSError* error = nil;
    NSString* source = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:&error];
    if (!source) {
      WriteRuntimeLog([NSString stringWithFormat:@"cannot read main.js: %@", error.localizedDescription]);
      return;
    }
    double t0 = NowMs();
    bool ok = (*engine)->Evaluate({"main.js", source.UTF8String});
    WriteRuntimeLog([NSString stringWithFormat:@"main.js %@ in %.1f ms", ok ? @"finished" : @"failed", NowMs() - t0]);
  }];

  [self installIdleObserver];
  [self installNotificationObservers];
}

// 主线程 run loop 即将进入等待（没事可做了）时，把这段空闲交给 V8。
// Chrome 就是这样在帧间隙做增量 GC 的——没有空闲任务时这个调用几乎零成本。
- (void)installIdleObserver {
  auto engine = _engine;
  _idleObserver = CFRunLoopObserverCreateWithHandler(
      kCFAllocatorDefault, kCFRunLoopBeforeWaiting, /*repeats=*/true, /*order=*/0,
      ^(CFRunLoopObserverRef observer, CFRunLoopActivity activity) {
        if (*engine) (*engine)->RunIdleTasks(0.005);
      });
  CFRunLoopAddObserver(CFRunLoopGetMain(), _idleObserver, kCFRunLoopCommonModes);
}

// 原生通知在主线程到达 → 投递到 JS 线程的任务队列 → 在 JS 线程上派发给 application。
// 这是单向的：原生不等待 JS 的结果，所以事件都是 cancelable: false。
- (void)installNotificationObservers {
  auto engine = _engine;
  auto snapshot = _snapshot;
  __weak NacreRuntime* weakSelf = self;

  // 通知 → JS 事件名。
  // 原则：暴露出去的状态必须同时给「读」和「变化通知」，否则 JS 只能轮询，
  // 而我们连定时器都没有，等于完全不可观测。
  //
  // 前后台这四个是 App 级的聚合状态，走 UIApplication 的通知——Apple 废弃的是
  // delegate 方法，通知形式没废弃。等 scene 对象做好后，scene 级管「这个窗口」，
  // 这里管「所有场景的聚合」，两者并存。
  NSDictionary<NSNotificationName, NSString*>* map = @{
    UIApplicationDidReceiveMemoryWarningNotification : @"memorywarning",
    UIApplicationUserDidTakeScreenshotNotification : @"screenshot",
    UIApplicationSignificantTimeChangeNotification : @"significanttimechange",
    UIApplicationWillTerminateNotification : @"willterminate",
    UIContentSizeCategoryDidChangeNotification : @"contentsizecategorychange",
    UIApplicationProtectedDataDidBecomeAvailable : @"protecteddataavailable",
    UIApplicationProtectedDataWillBecomeUnavailable : @"protecteddataunavailable",
    UIApplicationBackgroundRefreshStatusDidChangeNotification : @"backgroundrefreshstatuschange",
    UIApplicationDidBecomeActiveNotification : @"active",
    UIApplicationWillResignActiveNotification : @"inactive",
    UIApplicationDidEnterBackgroundNotification : @"background",
    UIApplicationWillEnterForegroundNotification : @"foreground",
  };

  [map enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* _) {
                  // 这里在主线程，可以安全读 UIKit
                  RebuildEnvironment(snapshot);
                  if (type.length == 0) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (*engine) (*engine)->EmitAppEvent(eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 场景接入和断开。事件带着 scene 对象——这是 JS 拿到场景的唯一入口，
  // 因为启动时 application.scenes 是空的。
  NSDictionary<NSNotificationName, NSString*>* sceneEvents = @{
    UISceneWillConnectNotification : @"sceneconnect",
    UISceneDidDisconnectNotification : @"scenedisconnect",
  };
  [sceneEvents enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* note) {
                  UIScene* scene = note.object;
                  if (![scene isKindOfClass:UIWindowScene.class]) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  // 块强引用 scene，保证投递到下一轮时它还活着
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitAppEventWithObject(
                        eventType, "scene", {(__bridge void*)scene, "UIWindowScene"});
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 场景自己的前后台状态变化。派发给 scene 对象本身，不是 application——
  // application 上同名的四个是「所有场景的聚合状态」，语义不同。
  // 按第 10 条完备性原则：activationState 可读，就必须有变化通知。
  NSDictionary<NSNotificationName, NSString*>* sceneLifecycle = @{
    UISceneDidActivateNotification : @"active",
    UISceneWillDeactivateNotification : @"inactive",
    UISceneWillEnterForegroundNotification : @"foreground",
    UISceneDidEnterBackgroundNotification : @"background",
  };
  [sceneLifecycle enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* note) {
                  UIScene* scene = note.object;
                  if (![scene isKindOfClass:UIWindowScene.class]) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitObjectEvent({(__bridge void*)scene, "UIWindowScene"},
                                               eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 这个通知 iOS 27 才有，但对应的属性已经暴露了，不接上就不完备
  if (@available(iOS 27.0, *)) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:UIApplicationSystemPrefersReducedResourceUsageDidChangeNotification
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* _) {
                  RebuildEnvironment(snapshot);
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  [strongSelf postToJS:^{
                    if (*engine) (*engine)->EmitAppEvent("reducedresourceusagechange");
                  }];
                }];
    [_observers addObject:token];
  }
}

// 把一次 JS 发起的异步调用的结果投回 JS 线程
- (void)settleCall:(int)callId with:(BOOL)value {
  auto engine = _engine;
  [self postToJS:^{
    if (*engine) (*engine)->SettleBool(callId, value ? true : false);
  }];
}

// JS 现在就在主线程上跑。仍然用 dispatch_async 而不是直接调用：
// 保证每轮 JS 执行都是独立的一轮，不会在 UIKit 操作中途重入。
- (void)postToJS:(dispatch_block_t)block {
  auto engine = _engine;
  dispatch_async(dispatch_get_main_queue(), ^{
    block();
    // 每轮任务结束后处理 V8 平台投递的任务（微任务由 kAuto 自动排空）
    if (*engine) (*engine)->PumpMessageLoop();
  });
}

- (void)dealloc {
  for (id token in _observers) [NSNotificationCenter.defaultCenter removeObserver:token];
  [_observers removeAllObjects];
  if (_idleObserver) {
    CFRunLoopRemoveObserver(CFRunLoopGetMain(), _idleObserver, kCFRunLoopCommonModes);
    CFRelease(_idleObserver);
    _idleObserver = NULL;
  }
  // Engine 和 JS 在同一个线程（主线程），dealloc 也在主线程，直接销毁
  _engine->reset();
}

@end
