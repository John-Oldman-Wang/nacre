#import "NacreRuntime.h"
#import "NacreRuntimeInternal.h"
#import "NacreFetchService.h"

#import <UIKit/UIKit.h>
#import <os/log.h>
#import <objc/runtime.h>

#include <memory>
#include <mutex>
#include <string>

#include "Engine.h"   // core/engine/

#include "Bridge/NacreBridge.h"

using namespace nacre_bridge;


// ---- 入口保底：ObjC 异常不许穿过宿主接口 ----
//
// 引擎调原生的每个入口都包一层。参数类型的问题已经由 NACRE_NUM 那几个宏
// 在更早的地方拦掉了；这里接的是剩下的——UIKit 自己抛的（把视图加成自己
// 的子视图、越界的下标……）。接住之后变成 JS 能 catch 的 TypeError，进程
// 不退。
//
// 代价写在明处：异常是 UIKit 内部抛出来的时候，它的状态可能已经不一致了。
// 所以这是保底，不是修法。每次走到这里都打一行运行时日志，值得回头把那个
// 调用点单独处理（先查再调，或者像 insertSublayer、pushViewController
// 那样就地接住并给一句说人话的报错）。
static std::string DescribeException(const char* where, NSException* e) {
  NSString* text = [NSString stringWithFormat:@"%s raised %@: %@", where, e.name,
                                              e.reason ?: @"(no reason)"];
  WriteRuntimeLog([@"native exception caught, " stringByAppendingString:text]);
  return text.UTF8String;
}

// where 只用来写进报错和日志。error 可以是 nullptr（那个入口没有报错出口，
// 比如读属性），这时只打日志、返回空值。
template <class Fn>
static auto Guarded(const char* where, std::string* error, Fn&& fn) -> decltype(fn()) {
  @try {
    return fn();
  } @catch (NSException* e) {
    std::string text = DescribeException(where, e);
    if (error != nullptr && error->empty()) *error = text;
    return decltype(fn())();
  }
}


// 这个场景该不该交给 JS。只认**公开角色**的窗口场景：App 自己的，和外接
// 显示器的。
//
// 系统还会接入一些内部场景，它们也是 UIWindowScene，也发同样的通知。
// iOS 26 上实测到一个：键盘第一次弹出时接入 _UIKeyboardWindowScene，会话
// 角色是 _UIScreenBasedSceneSession。原来只判断「是不是 UIWindowScene」，
// 它就被当成 sceneconnect 转给了 JS——main.js 通常在那个事件里建窗口和
// 页面，于是在键盘的场景上又建了一套。iOS 27 上没有出现这个场景。
static BOOL IsAppFacingScene(UIScene* scene) {
  if (![scene isKindOfClass:UIWindowScene.class]) return NO;
  UISceneSessionRole role = scene.session.role;
  return [role isEqualToString:UIWindowSceneSessionRoleApplication] ||
         [role isEqualToString:UIWindowSceneSessionRoleExternalDisplayNonInteractive];
}

@implementation NacreRuntime {
  BOOL _started;
  // JS 跑在主线程，所以这些都只在主线程上创建、使用和销毁
  std::shared_ptr<std::unique_ptr<nacre::Engine>> _engine;
  std::shared_ptr<AppSnapshot> _snapshot;
  NSMutableArray* _observers;
  // 主线程即将空闲时把时间交给 V8 做增量 GC
  CFRunLoopObserverRef _idleObserver;
  // 网络请求的状态和逻辑都在它里面（NacreFetchService.mm）
  NacreFetchService* _fetch;
  // 并发，干解码这类重活。网络和读 Blob 的内容共用这一条
  dispatch_queue_t _fetchWorkQueue;

  // 定时器唤醒的「代数」。到期顺序由 Engine 的堆决定，这里只管「叫醒」。
  //
  // 为什么不用 dispatch_source 复用一个 timer：FireDueTimers 整个跑在唤醒的
  // 回调里，而它结尾要安排下一次唤醒——那就是在 dispatch_source 的 handler
  // 内部重设这个 source 自己，实测会把这次约定丢掉，于是定时器只触发一次。
  //
  // 改成每次 dispatch_after 一个新 block，用代数作废旧的约定。代价是被作废
  // 的 block 还要等到原定时刻才空转一次，但它只做一次整数比较。
  //
  // dispatch_after 和 postToJS: 的 dispatch_async 都提交到主队列，按入队时刻
  // FIFO——实测验证过，所以定时器和原生事件的先后顺序是确定的。
  uint64_t _wakeupGeneration;
}

- (instancetype)init {
  if ((self = [super init])) {
    _engine = std::make_shared<std::unique_ptr<nacre::Engine>>();
    _snapshot = std::make_shared<AppSnapshot>();
    _observers = [NSMutableArray array];
    _fetchWorkQueue = dispatch_queue_create(
        "nacre.fetch.work", DISPATCH_QUEUE_CONCURRENT);
    _fetch = [[NacreFetchService alloc] initWithEngine:_engine workQueue:_fetchWorkQueue];
  }
  return self;
}

// ---- Blob ----

- (void)readObjectAsync:(id)object kind:(const std::string&)kindText callId:(int)callId {
  auto engine = _engine;
  NSString* kind = @(kindText.c_str());
  if (![object isKindOfClass:NacreBlob.class]) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (*engine) (*engine)->RejectCall(callId, "TypeError", "这个对象读不出内容");
    });
    return;
  }
  NSData* data = ((NacreBlob*)object).data;
  // 解码派到并发队列：大 Blob 的 UTF-8 解码是实打实的 CPU 活，
  // 在主线程做会掉帧。arrayBuffer 要拷一份（见下），同样放在后台。
  dispatch_async(_fetchWorkQueue, ^{
    if ([kind isEqualToString:@"text"]) {
      NSString* text =
          [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"";
      const std::string json = EncodeJSON(text);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->SettleJSON(callId, json);
      });
    } else {
      // **拷一份**再交给 V8。Blob 是不可变的，而交出去的 ArrayBuffer 是可写的：
      // 以前直接把 Blob 自己那块内存交出去（零拷贝），JS 改了读出来的缓冲区，
      // Blob 的内容就跟着变，两次读出来的还是同一块内存。
      //
      // 网络响应直接读字节的那条路（fetchReadBody）和读文件的那条路仍然
      // 零拷贝：它们交出去的那块内存只有这一个使用者，读完就不再有人碰。
      // 拷贝在这个后台队列上做，不占主线程
      const size_t length = data.length;
      void* copy = length > 0 ? malloc(length) : nullptr;
      const bool failed = length > 0 && copy == nullptr;
      if (copy != nullptr) memcpy(copy, data.bytes, length);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) {
          free(copy);
          return;
        }
        if (failed) {
          (*engine)->RejectCall(callId, "RangeError",
                                "not enough memory to copy the Blob's bytes");
          return;
        }
        (*engine)->SettleBytes(
            callId, copy, length,
            [](void* d, size_t len, void* info) { free(d); }, nullptr);
      });
    }
  });
}

// 一段段字节按顺序拼起来。字符串段已经由内置脚本编成 UTF-8 字节，这里只有字节
nacre::NativeObjectRef CreateBlob(
    const std::vector<std::pair<const void*, size_t>>& parts,
    const std::string& type) {
  NSMutableData* out = [NSMutableData data];
  for (const auto& part : parts) {
    // 长度是 0 的段指针可能是空的
    if (part.second > 0) [out appendBytes:part.first length:part.second];
  }
  NacreBlob* blob = [NacreBlob new];
  blob.data = out;
  blob.type = @(type.c_str());
  return {(void*)CFAutorelease(CFBridgingRetain(blob)), "Blob"};
}


- (void)startWithScriptsDirectory:(NSURL *)directory {
  if (_started) return;
  _started = YES;
  NacreSetScriptsDirectory(directory);

  // 环境快照。JS 现在和 UIKit 同线程，本可以直接读，
  // 但保留快照能让 environmentJSON 一次拿齐，少几次 UIKit 往返。
  _snapshot->infoJSON = InfoDictionaryJSON();
  RebuildEnvironment(_snapshot);

  // 别的 App 或者一条链接打开我们时，系统只告诉场景的委托。现在就把委托的类
  // 补好：这里是 didFinishLaunching，场景还没接入，冷启动带着的链接赶得上
  InstallOpenURLForwarding();

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
        if (!IsAppFacingScene(scene)) continue;
        refs.push_back({NacreKeep(scene), "UIWindowScene"});
      }
      return refs;
    };
    host.read_property = [](void* ptr, const std::string& name) {
      return Guarded(name.c_str(), nullptr, [&] {
        return ReadNativeProperty((__bridge id)ptr, name);
      });
    };
    host.write_property = [](void* ptr, const std::string& name,
                             const std::string& json, std::string* error,
                             std::string* warning) {
      Guarded(name.c_str(), error, [&] {
        WriteNativeProperty((__bridge id)ptr, name, json, error, warning);
      });
    };
    host.read_object_property = [](void* ptr, const std::string& name) {
      return Guarded(name.c_str(), nullptr, [&] {
        return ReadNativeObjectProperty((__bridge id)ptr, name);
      });
    };
    host.write_object_property = [](void* ptr, const std::string& name, void* value,
                                    std::string* error) {
      Guarded(name.c_str(), error, [&] {
        WriteNativeObjectProperty((__bridge id)ptr, name, value, error);
      });
    };
    host.construct_native = [](const std::string& className,
                              const std::string& argsJSON,
                              const std::vector<void*>& args, std::string* error) {
      return Guarded(className.c_str(), error, [&] {
        return ConstructNative(className, argsJSON, args, error);
      });
    };
    host.call_method = [](void* ptr, const std::string& name,
                          const std::string& argsJSON,
                          const std::vector<void*>& argPtrs, std::string* error) {
      return Guarded(name.c_str(), error, [&] {
        return CallMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
      });
    };
    host.call_object_method = [](void* ptr, const std::string& name,
                                 const std::string& argsJSON,
                                 const std::vector<void*>& argPtrs,
                                 std::string* error) {
      return Guarded(name.c_str(), error, [&] {
        return CallObjectMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
      });
    };
    host.read_object_array_property = [](void* ptr, const std::string& name) {
      return Guarded(name.c_str(), nullptr, [&] {
        return ReadNativeObjectArrayProperty((__bridge id)ptr, name);
      });
    };
    host.write_object_array_property = [](void* ptr, const std::string& name,
                                          const std::vector<void*>& values,
                                          std::string* error) {
      Guarded(name.c_str(), error, [&] {
        WriteNativeObjectArrayProperty((__bridge id)ptr, name, values, error);
      });
    };
    host.set_event_subscription = [weakSelf](void* ptr, const std::string& type,
                                             bool on, std::string* error) {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      // 回答有三种（见 NacreSubscribed）。「这个事件名不认识」不是出错：它当
      // 自定义事件，和浏览器里的 EventTarget 一样（2026-11-17 定；在这之前是抛
      // TypeError）。这时原生什么都不做，JS 那边只登记监听器。真的出错（系统
      // 抛的异常、对象已经没有了）会填 error，照常报。@ 开头的保留名字在 JS
      // 那一侧就拦了
      Guarded("addEventListener", error, [&] {
        [strongSelf setSubscription:(__bridge id)ptr type:type on:on error:error];
      });
    };
    host.call_object_array_method = [](void* ptr, const std::string& name,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& argPtrs,
                                       std::string* error) {
      return Guarded(name.c_str(), error, [&] {
        return CallObjectArrayMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
      });
    };
    host.call_class_object_method = [](const std::string& className,
                                       const std::string& name,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& argPtrs,
                                       std::string* error) {
      return Guarded(name.c_str(), error, [&] {
        return CallClassObjectMethod(className, name, argsJSON, argPtrs, error);
      });
    };
    host.call_class_method = [](const std::string& className, const std::string& name,
                                const std::string& argsJSON,
                                const std::vector<void*>& argPtrs,
                                std::string* error) {
      return Guarded(name.c_str(), error, [&] {
        return CallClassMethod(className, name, argsJSON, argPtrs, error);
      });
    };
    // 登记进来的域的事件出口（NacreEmitEvent…）。三种负载对上三个 emitEvent
    NacreSetEventSink(^(id object, const char* className, NSString* type, NSString* json,
                        id payload, const char* payloadClass, const char* eventClass) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) return;
      if (json != nil) {
        [strongSelf emitEvent:type
                         from:object
                    className:className
                         json:json.UTF8String
                   eventClass:eventClass];
      } else if (payloadClass != nullptr) {
        [strongSelf emitEvent:type
                         from:object
                    className:className
                         with:payload
                 payloadClass:payloadClass
                   eventClass:eventClass];
      } else {
        [strongSelf emitEvent:type from:object className:className then:nil];
      }
    });
    // 同步回调（NacreEmitEventSync / NacreCallBlock…）：系统在等答案，所以
    // **不排队**，当场进 JS。别的事件一律延后一轮，是为了不在 UIKit 的调用
    // 中途进 JS；这里是 UIKit 自己要求当场给答复，没有别的办法。
    //
    // 两种时机：JS 没在跑（系统从 run loop 里来问），或者 JS 正在调原生、
    // 原生回头问（嵌套）。平台投递的任务只在最外层处理——嵌套时外面那一层
    // 回去之后自己会处理
    NacreSetSyncSinks(
        ^BOOL(id object, const char* className, NSString* type, NSString* json, BOOL cancelable,
              const char* eventClass) {
          NacreRuntime* strongSelf = weakSelf;
          if (strongSelf == nil) return NO;
          auto engine = strongSelf->_engine;
          if (!*engine) return NO;
          const bool nested = (*engine)->IsInJS();
          const bool prevented = (*engine)->EmitObjectEventWithJSON(
              {NacreKeep(object), className}, type.UTF8String,
              json != nil ? json.UTF8String : "null", cancelable == YES,
              eventClass != nullptr ? eventClass : "");
          if (!nested) (*engine)->PumpMessageLoop();
          return prevented ? YES : NO;
        },
        ^(NSInteger blockId, NSString* argsJSON, BOOL later) {
          NacreRuntime* strongSelf = weakSelf;
          if (strongSelf == nil) return;
          auto engine = strongSelf->_engine;
          const int block = (int)blockId;
          std::string args = argsJSON.UTF8String ?: "[]";
          if (later) {
            [strongSelf postToJS:^{
              if (*engine) (*engine)->CallBlock(block, args);
            }];
            return;
          }
          if (!*engine) return;
          const bool nested = (*engine)->IsInJS();
          (*engine)->CallBlock(block, args);
          if (!nested) (*engine)->PumpMessageLoop();
        });
    // 「当场要一个值」：和上面的 ask 一样当场进 JS，只是交回来的是事件上一个字段的值
    NacreSetAnswerSink(^NSString*(id object, const char* className, NSString* type,
                                  NSString* json, NSString* field, const char* eventClass) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) return nil;
      auto engine = strongSelf->_engine;
      if (!*engine) return nil;
      const bool nested = (*engine)->IsInJS();
      const std::string answer = (*engine)->EmitObjectEventForAnswer(
          {NacreKeep(object), className}, type.UTF8String,
          json != nil ? json.UTF8String : "null", field.UTF8String,
          eventClass != nullptr ? eventClass : "");
      if (!nested) (*engine)->PumpMessageLoop();
      return answer.empty() ? nil : @(answer.c_str());
    });
    // WebSocket 的事件出口。那个文件不认识 NacreRuntime，所以在这里塞进去
    WebSocketSetEmitter(^(id task, NSString* type, NSString* json, NacreBlob* blob,
                          const char* eventClass) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) return;
      if (blob != nil) {
        [strongSelf emitEvent:type
                         from:task
                    className:"WebSocket"
                         with:blob
                 payloadClass:"Blob"
                   eventClass:eventClass];
      } else if (json != nil) {
        [strongSelf emitEvent:type
                         from:task
                    className:"WebSocket"
                         json:json.UTF8String
                   eventClass:eventClass];
      } else {
        [strongSelf emitEvent:type from:task className:"WebSocket" then:nil];
      }
    });
    // 网页的事件出口，同上
    WebViewSetEmitter(^(id contents, NSString* type, NSString* json, const char* eventClass) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) return;
      if (json != nil) {
        [strongSelf emitEvent:type
                         from:contents
                    className:"WebContents"
                         json:json.UTF8String
                   eventClass:eventClass];
      } else {
        [strongSelf emitEvent:type from:contents className:"WebContents" then:nil];
      }
    });
    // Session 的事件出口（cookie 变了）。同一个路子
    WebSessionSetEmitter(^(id session, NSString* type, NSString* json, const char* eventClass) {
      [weakSelf emitEvent:type from:session className:"Session" then:nil];
    });
    // 能被取消的那一个（will-navigate）：派发完把「取消了没有」交回去。
    // 走 postToJS，所以 answer 一定会被调到；引擎不在了就按没取消算
    WebViewSetAsker(^(id contents, NSString* type, NSString* json, const char* eventClass,
                      void (^answer)(BOOL prevented)) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) {
        answer(NO);
        return;
      }
      auto engine = strongSelf->_engine;
      std::string t = type.UTF8String;
      std::string payload = json.UTF8String ?: "null";
      std::string eventCls = eventClass != nullptr ? eventClass : "";
      [strongSelf postToJS:^{
        BOOL prevented = NO;
        if (*engine) {
          prevented = (*engine)->EmitObjectEventWithJSON(
              {NacreKeep(contents), "WebContents"}, t, payload, false, eventCls);
        }
        answer(prevented);
      }];
    });
    host.read_class_object_property = [](const std::string& className,
                                         const std::string& name) {
      return Guarded(name.c_str(), nullptr, [&] {
        return ReadClassObjectProperty(className, name);
      });
    };
    host.fetch_start = [weakSelf](const std::string& url, const std::string& options,
                                  void* body, int callId) -> int {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return 0;
      return [strongSelf->_fetch fetchStart:url options:options body:(__bridge id)body callId:callId];
    };
    host.fetch_read_body = [weakSelf](int requestId, const std::string& kind,
                                      int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf->_fetch fetchReadBody:requestId kind:kind callId:callId];
    };
    host.fetch_cancel = [weakSelf](int requestId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf->_fetch fetchCancel:requestId];
    };
    host.fetch_release = [weakSelf](int requestId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf->_fetch fetchRelease:requestId];
    };
    host.read_object_async = [weakSelf](void* ptr, const std::string& kind,
                                        int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf readObjectAsync:(__bridge id)ptr kind:kind callId:callId];
    };
    host.create_blob = [](const std::vector<std::pair<const void*, size_t>>& parts,
                          const std::string& type) {
      return Guarded("new Blob", nullptr, [&] {
        return CreateBlob(parts, type);
      });
    };
    host.parse_url = [](const std::string& url, const std::string& base) {
      return ParseURL(url, base);
    };
    host.fill_random = [](void* bytes, size_t length) { return FillRandom(bytes, length); };
    // 「delay_ms 之后叫我」。每次覆盖上一次的约定，负数表示撤销。
    host.schedule_wakeup = [weakSelf](double delayMs) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf scheduleWakeupAfter:delayMs];
    };
    // 把任务排到主队列尾部。未处理拒绝的延后结算走这条。
    host.post_task = [weakSelf](std::function<void()> task) {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      auto engine = strongSelf->_engine;
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) task();
      });
    };
    host.call_void_method = [](void* ptr, const std::string& name, std::string* error) {
      Guarded(name.c_str(), error, [&] { CallVoidMethod((__bridge id)ptr, name); });
    };
    auto callAsync = [weakSelf](void* ptr, const std::string& name,
                                 const std::string& argsJSON,
                                 const std::vector<void*>& argPtrs, int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      id object = (__bridge id)ptr;
      // 文件读写。NacreFileSystem.mm 自己派到后台队列做，做完在**后台线程**
      // 调 done；回主线程兑现是这里的事——那个文件不认识 NacreRuntime。
      {
        auto engine = strongSelf->_engine;
        // 文件和 Keychain 共用这一段兑现：两边都是「派到后台做完再回主线程」
        NacreAsyncDone settle = ^(NacreAsyncResult* r) {
              if (r.isError) {
                std::string errName = r.errorName.length ? r.errorName.UTF8String : "Error";
                std::string errMessage = r.errorMessage.length ? r.errorMessage.UTF8String : "";
                // 名字映射盖不住的那部分事实原样交出去，当逃生口
                std::string detail = EncodeJSON(@{@"code": @(r.errorCode),
                                                  @"domain": r.errorDomain ?: @""});
                [strongSelf postToJS:^{
                  if (*engine) (*engine)->RejectCall(callId, errName, errMessage, detail);
                }];
              } else if (r.bytes != nil) {
                // 零拷贝，和 fetch 的 arrayBuffer 同一条路
                NSData* data = r.bytes;
                const void* bytes = data.bytes;
                const size_t length = data.length;
                void* owned = (void*)CFBridgingRetain(data);
                [strongSelf postToJS:^{
                  if (!*engine) {
                    CFRelease(owned);
                    return;
                  }
                  (*engine)->SettleBytes(
                      callId, (void*)bytes, length,
                      [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
                }];
              } else if (r.json != nil) {
                std::string json = EncodeJSON(r.json);
                [strongSelf postToJS:^{
                  if (*engine) (*engine)->SettleJSON(callId, json);
                }];
              } else {
                BOOL value = r.boolValue;
                [strongSelf postToJS:^{
                  if (*engine) (*engine)->SettleBool(callId, value);
                }];
              }
        };
        // 注册进来的能力域先问一轮。它们在自己的 +load 里登记，核心不认识
        // 它们的名字——能力要能拆成独立的 framework，就不能再写死在这里。
        // 下面那几条还是写死的，谁下次碰到哪个域就顺手把它改成注册。
        if (NacreDispatchAsyncMethod(object, name, argsJSON, argPtrs, settle)) return;
        if (FileSystemCallAsync(object, name, argsJSON, argPtrs, settle)) return;
        // WebSocket 的 send / ping。它们在**主线程**就完成了调用，
        // 回音在 NSURLSession 的队列上来，所以同样要回主线程兑现
        if (WebSocketCallAsync(object, name, argsJSON, argPtrs, settle)) return;
        // 网页的 loadURL。结果在主线程上来，兑现走的是同一段
        if (WebViewCallAsync(object, name, argsJSON, argPtrs, settle)) return;
        // Session 的 cookie 读写和清数据
        if (WebSessionCallAsync(object, name, argsJSON, argPtrs, settle)) return;
      }
      if ([object isKindOfClass:UIViewController.class] &&
          name == "presentViewController") {
        NSArray* args = DecodeJSON(argsJSON);
        BOOL animated = [args isKindOfClass:NSArray.class] && args.count > 1
                            ? [args[1] isEqual:@YES] : NO;
        UIViewController* host = (UIViewController*)object;
        id first = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
        UIViewController* modal =
            [first isKindOfClass:UIViewController.class] ? (UIViewController*)first : nil;
        if (modal == nil) {
          [strongSelf settleCall:callId with:NO];
          return;
        }
        // 订阅可能在 present 之前就挂上了，这会儿 presentationController 才有
        [host presentViewController:modal
                           animated:animated
                         completion:^{
                           [strongSelf installPresentationDelegate:modal];
                           [strongSelf settleCall:callId with:YES];
                         }];
        // 呈现一开始 presentationController 就有了，不用等动画跑完
        [strongSelf installPresentationDelegate:modal];
        return;
      }
      if ([object isKindOfClass:UIViewController.class] &&
          name == "dismissViewController") {
        NSArray* args = DecodeJSON(argsJSON);
        BOOL animated = [args isKindOfClass:NSArray.class] && args.count > 0
                            ? [args[0] isEqual:@YES] : NO;
        [(UIViewController*)object dismissViewControllerAnimated:animated
                                                      completion:^{
          [strongSelf settleCall:callId with:YES];
        }];
        return;
      }
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
      // 图片解码默认发生在**绘制时**，也就是主线程。这两个方法把解码挪到
      // 后台，解完再把准备好的那张图交回来。JS 本来就在主线程抢时间，
      // 大图不走这条就会掉帧。
      if ([object isKindOfClass:UIImage.class]) {
        UIImage* image = (UIImage*)object;
        if (name == "prepareForDisplay") {
          // 动图要把每一帧都解了，不然第一次显示时所有帧在主线程上解
          if (NacreFramesOfImage(image) != nil) {
            NacrePrepareFramesForDisplay(image, ^(UIImage* ready) {
              [strongSelf settleCall:callId withObject:ready className:"UIImage"];
            });
            return;
          }
          [image prepareForDisplayWithCompletionHandler:^(UIImage* ready) {
            [strongSelf settleCall:callId withObject:ready className:"UIImage"];
          }];
          return;
        }
        if (name == "prepareThumbnailOfSize:") {
          id decoded = DecodeJSON(argsJSON);
          NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
          [image prepareThumbnailOfSize:JSONToSize(args.firstObject)
                      completionHandler:^(UIImage* ready) {
                        [strongSelf settleCall:callId
                                    withObject:ready
                                     className:"UIImage"];
                      }];
          return;
        }
      }
      [strongSelf settleCall:callId with:NO];
    };
    // 异步入口同样不许让异常穿出去。接住之后把那个 Promise 拒掉——
    // 不然它会永远挂着，JS 那边连超时都等不到
    host.call_async = [weakSelf, callAsync](void* ptr, const std::string& name,
                                            const std::string& argsJSON,
                                            const std::vector<void*>& argPtrs,
                                            int callId) {
      @try {
        callAsync(ptr, name, argsJSON, argPtrs, callId);
      } @catch (NSException* e) {
        std::string text = DescribeException(name.c_str(), e);
        NacreRuntime* strongSelf = weakSelf;
        if (!strongSelf) return;
        auto engine = strongSelf->_engine;
        [strongSelf postToJS:^{
          if (*engine) (*engine)->RejectCall(callId, "Error", text, "null");
        }];
      }
    };
    *engine = std::make_unique<nacre::Engine>(std::move(host));
    double t2 = NowMs();

    // 第一行带上 Nacre 自己的版本：看日志、接崩溃上报时要知道跑的是哪一版。
    // NACRE_VERSION 是编译时从 project.yml 定义进来的；别的工程引这个文件没定义时
    // 写 unknown，不让编译失败
#ifndef NACRE_VERSION
#define NACRE_VERSION "unknown"
#endif
    WriteRuntimeLog([NSString stringWithFormat:@"Nacre %s, V8 %s initialized in %.1f ms, context ready in %.1f ms",
                                               NACRE_VERSION, nacre::Engine::V8Version(), t1 - t0, t2 - t1]);
  }];

  // 内置脚本装没装好。第 2 步失败时置上，第 3 步看它决定跑不跑 main.js。
  // 两个任务都在主队列上，先后是确定的，所以一个普通的共享布尔量就够
  auto builtinFailed = std::make_shared<bool>(false);

  // 2. 执行内置脚本，装上 EventTarget / Event / Application / application
  [self postToJS:^{
    if (!*engine) return;
    // 内置脚本在**运行时自己的包**里，不在 App 的包里：运行时做成了
    // framework，Builtin/parts/ 跟着它走
    NSBundle* runtimeBundle = [NSBundle bundleForClass:NacreRuntime.class];
    // 内置脚本拆成了 Builtin/parts/ 下的若干个 part，每个是一个函数表达式。
    //
    // 先跑核心自己的，再跑各能力包登记进来的（Keychain 之类，各自在
    // <能力>.framework/Builtin/parts/ 下）。它们用同一个 ctx，所以能力包拿得到
    // 核心导出的东西；顺序反过来就不行——能力要往 Application 上挂属性，
    // 那时 Application 得已经定义出来。
    //
    // 每一组 = (脚本名的前缀, 包)。脚本名用 nacre:… 前缀而不是文件路径：调用
    // 栈里一眼能看出是运行时内部、又是哪个包，和 Node 的 node:internal/… 同理。
    NSMutableArray<NSArray*>* groups = [NSMutableArray array];
    [groups addObject:@[@"nacre:internal/parts/", runtimeBundle]];
    for (NSBundle* bundle in NacreRegisteredPartBundles()) {
      NSString* label = bundle.bundlePath.lastPathComponent.stringByDeletingPathExtension;
      [groups addObject:@[[NSString stringWithFormat:@"nacre:%@/parts/", label], bundle]];
    }

    double t0 = NowMs();
    NSMutableArray<NSString*>* counts = [NSMutableArray array];
    for (NSArray* group in groups) {
      NSString* prefix = group[0];
      NSBundle* bundle = group[1];
      // **顺序由文件名决定**（00-、01-…），所以必须排序：
      // URLsForResourcesWithExtension: 不保证顺序。
      //
      // 核心的脚本分在两处：iOS 自己的在 Builtin/parts/，两端共用的（仓库的
      // core/builtin/parts/，Web 标准那批）打进包里是根上的 parts/。两处合在
      // 一起排序，所以拆开之后执行顺序和脚本名都没变
      NSMutableArray<NSURL*>* found = [NSMutableArray array];
      [found addObjectsFromArray:
          [bundle URLsForResourcesWithExtension:@"js" subdirectory:@"Builtin/parts"] ?: @[]];
      if (groups.firstObject == group) {
        [found addObjectsFromArray:
            [bundle URLsForResourcesWithExtension:@"js" subdirectory:@"parts"] ?: @[]];
      }
      NSArray<NSURL*>* parts =
          [found sortedArrayUsingComparator:^NSComparisonResult(NSURL* a, NSURL* b) {
            return [a.lastPathComponent compare:b.lastPathComponent];
          }];
      // 一个 part 都没有同样是致命的：核心缺了就什么 API 都没有；能力包登记了
      // 却没带脚本，是打包出了错，装一半比不装更难查
      if (parts.count == 0) {
        (*engine)->FinishBuiltinParts();
        *builtinFailed = true;
        WriteRuntimeLog([NSString stringWithFormat:
            @"builtin scripts %@*.js are missing; the upper-layer API is incomplete", prefix]);
        return;
      }
      for (NSURL* url in parts) {
        NSString* source = [NSString stringWithContentsOfURL:url
                                                    encoding:NSUTF8StringEncoding
                                                       error:nil];
        NSString* name = [prefix stringByAppendingString:url.lastPathComponent];
        // 任何一个 part 失败都当致命错误并**点名是哪个文件**：后面的 part 会在
        // 一个半装好的状态上继续跑，错得更远也更难查
        if (!source || !(*engine)->RunBuiltinPart({name.UTF8String, source.UTF8String})) {
          (*engine)->FinishBuiltinParts();
          *builtinFailed = true;
          WriteRuntimeLog([NSString stringWithFormat:
              @"builtin script %@ failed; the upper-layer API is incomplete", name]);
          return;
        }
      }
      [counts addObject:groups.firstObject == group
          ? [NSString stringWithFormat:@"%lu parts", (unsigned long)parts.count]
          : [NSString stringWithFormat:@"%lu from %@", (unsigned long)parts.count,
                 bundle.bundlePath.lastPathComponent.stringByDeletingPathExtension]];
    }
    (*engine)->FinishBuiltinParts();
    WriteRuntimeLog([NSString stringWithFormat:@"builtin script ready in %.1f ms (%@)",
                                               NowMs() - t0,
                                               [counts componentsJoinedByString:@" + "]]);
  }];

  // 3. 加载并执行 main.js
  [self postToJS:^{
    if (!*engine) return;
    // 内置脚本没装好就不跑业务脚本。上面那一步失败时只是从它自己的任务里
    // 返回，这个任务是早就排好的，不拦的话 main.js 会在一个装了一半的环境里
    // 跑起来，报的错离真正的原因很远
    if (*builtinFailed) {
      WriteRuntimeLog(@"main.js was not loaded because the builtin scripts failed to load");
      return;
    }
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
// Engine 说「delay_ms 之后叫我」。重设唯一的那个 dispatch_source。
- (void)scheduleWakeupAfter:(double)delayMs {
  // 每次都让旧约定失效：代数变了，之前排的 block 醒来会发现自己过期，直接返回。
  const uint64_t generation = ++_wakeupGeneration;
  if (delayMs < 0) return;  // 堆空了，只作废不排新的

  auto engine = _engine;
  __weak NacreRuntime* weakSelf = self;
  dispatch_block_t wake = ^{
    NacreRuntime* strongSelf = weakSelf;
    if (!strongSelf || strongSelf->_wakeupGeneration != generation) return;
    if (*engine) (*engine)->FireDueTimers();
  };
  // 0 延迟走 dispatch_async，不走 dispatch_after。
  //
  // 这两个不等价：dispatch_after 即使延迟为 0 也要过一次内核 timer，排进
  // 队列的时刻比当场 dispatch_async 晚。实测的后果是 setTimeout(fn, 0) 会
  // 落到之后才排队的任务后面——未处理拒绝的延后结算就撞上了这个：补在
  // timer 里的 handler 本该抑制上报，结果上报先跑了。
  if (delayMs <= 0) {
    dispatch_async(dispatch_get_main_queue(), wake);
  } else {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayMs * NSEC_PER_MSEC)),
                   dispatch_get_main_queue(), wake);
  }
}

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
    UIApplicationWillTerminateNotification : @"beforeterminate",
    UIContentSizeCategoryDidChangeNotification : @"contentsizecategorychange",
    NSCurrentLocaleDidChangeNotification : @"localechange",
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
                    if (!*engine) return;
                    (*engine)->EmitAppEvent(eventType);
                    // 内存警告：JS 的监听器先执行、扔掉自己的缓存，再让 V8 回收，
                    // 监听器刚放掉的对象这一次就收掉。反过来的话要等下一次 GC
                    if (eventType == "memorywarning") (*engine)->NotifyMemoryPressure();
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
                  if (!IsAppFacingScene(scene)) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  // 块强引用 scene，保证投递到下一轮时它还活着
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitAppEventWithObject(
                        eventType, "scene", {NacreKeep(scene), "UIWindowScene"});
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
                  if (!IsAppFacingScene(scene)) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitObjectEvent({NacreKeep(scene), "UIWindowScene"},
                                               eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 窗口的 key 和可见性变化。按第 10 条完备性原则：isKeyWindow 和
  // isHidden 都可读，就必须有变化通知，否则 JS 只能轮询——而我们连
  // 定时器都没有，等于完全不可观测。
  //
  // 事件名没有照搬场景那边的「状态名」风格（active / foreground…）：
  // 场景的 activationState 是一个枚举，状态名就是现成的；窗口这边
  // key 和 visible 是两个独立的布尔，没有状态名可用，所以用动作名。
  NSDictionary<NSNotificationName, NSString*>* windowEvents = @{
    UIWindowDidBecomeKeyNotification : @"becomekey",
    UIWindowDidResignKeyNotification : @"resignkey",
    UIWindowDidBecomeVisibleNotification : @"becomevisible",
    UIWindowDidBecomeHiddenNotification : @"becomehidden",
  };
  [windowEvents enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* note) {
                  UIWindow* window = note.object;
                  if (![window isKindOfClass:UIWindow.class]) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitObjectEvent({NacreKeep(window), "UIWindow"},
                                               eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 这个通知 iOS 27 才有，但对应的属性已经暴露了，不接上就不完备。
  //
  // #if 管编译期（Xcode 26 的 SDK 里没有这个符号，只写 @available 会
  // 编译不过），@available 管运行期。用低 SDK 编出来的包里这条事件
  // 永远不发，属性恒为 false——见 NacreConvert.mm 里的同一处处理。
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && __IPHONE_OS_VERSION_MAX_ALLOWED >= 270000
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
#endif
}

// 控件事件：延后一轮再进 JS，和别的原生通知一致。
// 这里捕获的是 control 的强引用，保证 block 跑起来时它还活着。
- (void)emitControlEvent:(NSString*)type from:(UIControl*)control event:(UIEvent*)event {
  // 只有触摸类事件带负载，JS 那边「收到负载就挂上」，不用镜像这张表。
  //
  // **位置必须在这里取**：事件延后一轮才进 JS，那时 UIEvent 已经没了。
  // 和动画的 stop 带 finished 是同一条判据——那个信息回头读不到。
  if (!IsTouchControlEvent(type)) {
    [self emitEvent:type from:control className:"UIControl" then:nil];
    return;
  }
  UITouch* touch = [event touchesForView:control].anyObject;
  NSString* json;
  if (touch == nil) {
    // sendActionsForControlEvents 那条路上压根没有 UIEvent。
    // 给 null 不给 (0,0)——(0,0) 是个合法坐标，和「没有触点」分不开
    json = @"{\"location\":null,\"tapCount\":0}";
  } else {
    CGPoint p = [touch locationInView:control];
    json = [NSString stringWithFormat:
                @"{\"location\":{\"x\":%.6f,\"y\":%.6f},\"tapCount\":%ld}",
                p.x, p.y, (long)touch.tapCount];
  }
  [self emitEvent:type
             from:control
        className:"UIControl"
             json:json.UTF8String
       eventClass:"UIControlTouchEvent"];
}

// 通用的「原生发生了什么，告诉 JS」。延后一轮，completion 在派发之后跑，
// 用来清合并标志——清在派发之后，这样派发前又发生的同类事件会被合并掉。
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             then:(dispatch_block_t)completion {
  auto engine = _engine;
  std::string t = type.UTF8String;
  std::string cls = className;
  [self postToJS:^{
    if (*engine) (*engine)->EmitObjectEvent({NacreKeep(object), cls}, t);
    if (completion) completion();
  }];
}

// 带一个原生对象作为负载的事件。延后一轮，和别的一致。
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             with:(id)payload
    payloadClass:(const char*)payloadClass
      eventClass:(const char*)eventClass {
  auto engine = _engine;
  std::string t = type.UTF8String;
  std::string cls = className;
  std::string payloadCls = payloadClass;
  std::string eventCls = eventClass != nullptr ? eventClass : "";
  [self postToJS:^{
    if (*engine) {
      (*engine)->EmitObjectEventWith({NacreKeep(object), cls}, t,
                                     {NacreKeep(payload), payloadCls}, eventCls);
    }
  }];
}

// 带一个 JSON 值作为负载的事件。动画的 stop 要带 finished，而那个事实
// 在动画对象上**读不出来**——事件带不带数据的判据就是这个。
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             json:(const std::string&)json
       eventClass:(const char*)eventClass {
  auto engine = _engine;
  std::string t = type.UTF8String;
  std::string cls = className;
  std::string payload = json;
  std::string eventCls = eventClass != nullptr ? eventClass : "";
  [self postToJS:^{
    if (*engine) {
      (*engine)->EmitObjectEventWithJSON({NacreKeep(object), cls}, t, payload, false, eventCls);
    }
  }];
}

// presentationController 要等呈现开始才存在，所以这个方法在两处调用：
// JS 订阅的时候（可能还没呈现，那就先记着），以及 present 的时候。
- (void)installPresentationDelegate:(UIViewController*)vc {
  NacrePresentationDelegate* d =
      objc_getAssociatedObject(vc, kNacrePresentationDelegateKey);
  if (d == nil || d.types.count == 0) return;
  UIPresentationController* pc = vc.presentationController;
  if (pc == nil || pc.delegate == d) return;
  // 有的呈现控制器不许改委托：提示框的就会抛 NSInternalInconsistencyException。
  // 这个方法有一处是在 present 的完成回调里调的，那里没有入口保底，抛出去
  // App 就终止了（接弹窗时实测崩过）。接住、打一行日志；那一页的关闭事件
  // 因此收不到，由认领它的域自己负责（见 NacreAlerts.mm）
  @try {
    pc.delegate = d;
  } @catch (NSException* e) {
    WriteRuntimeLog([NSString stringWithFormat:
        @"presentation delegate not installed on %@: %@",
        NSStringFromClass([vc class]), e.reason ?: e.name]);
  }
}

// 按对象订阅。JS 侧某个类型第一次有监听器时 on=YES，最后一个移走时 on=NO。
- (NacreSubscribed)setSubscription:(id)object
                   type:(const std::string&)type
                     on:(BOOL)on
                  error:(std::string*)error {
  // 外观特征变了。视图、页面、场景都认这一个事件名，而它们各自的分支
  // （控件、滚动、导航、tab、模态）只认自己那几个，所以在分到各个类之前
  // 先按名字认走
  {
    __weak NacreRuntime* weakSelf = self;
    NacreTraitEmit emit = ^(id environment, UITraitCollection* previous) {
      const char* cls =
          [environment isKindOfClass:UIViewController.class] ? "UIViewController"
          : [environment isKindOfClass:UIWindowScene.class]  ? "UIWindowScene"
                                                             : "UIView";
      [weakSelf emitEvent:@"traitchange"
                     from:environment
                className:cls
                     with:previous
             payloadClass:"UITraitCollection"
               eventClass:"UITraitChangeEvent"];
    };
    if (TraitSetSubscription(object, @(type.c_str()), on, emit, error)) return true;
  }
  return [self routeSubscription:object type:type on:on error:error];
}

// 按对象的类分到各自的分支
- (NacreSubscribed)routeSubscription:(id)object
                     type:(const std::string&)type
                       on:(BOOL)on
                    error:(std::string*)error {
  // 登记进来的域先问（NacreRegisterDomain）。手势、剪贴板走的是这条：
  // trampoline 和事件名表都在域自己的文件里，事件从 NacreEmitEvent… 出来，
  // 这个文件不认识它们。新接的类也走这条，下面这些分支是登记机制之前就有的
  {
    NacreSubscribed answer = NacreDomainSubscribe(object, @(type.c_str()), on, error);
    if (answer.kind != NacreSubscribed::NotMine) return answer;
  }
  // 网页。事件原生一直在发，这里只校验名字
  {
    NacreSubscribed answer = WebContentsSetSubscription(object, @(type.c_str()), on, error);
    if (answer.kind != NacreSubscribed::NotMine) return answer;
  }
  if ([object isKindOfClass:NSUserDefaults.class]) {
    NSUserDefaults* defaults = (NSUserDefaults*)object;
    if (type != "change") {
      // 和别的域一样用 EnumError 报：订阅入口靠它置的标记认出「事件名不认识」
      return NacreSubscribed::UnknownEvent;
    }
    NacreDefaultsObserver* observer =
        objc_getAssociatedObject(defaults, kNacreDefaultsObserverKey);
    if (on) {
      if (observer != nil) return true;
      observer = [NacreDefaultsObserver new];
      observer.runtime = self;
      observer.defaults = defaults;
      objc_setAssociatedObject(defaults, kNacreDefaultsObserverKey, observer,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      // object 传 nil 不按发送者过滤：头文件没承诺这条通知的 object 是哪个
      // 实例，而进程里只有 standard 一个，过滤没有收益只有风险
      [NSNotificationCenter.defaultCenter addObserver:observer
                                             selector:@selector(defaultsChanged:)
                                                 name:NSUserDefaultsDidChangeNotification
                                               object:nil];
    } else if (observer != nil) {
      [NSNotificationCenter.defaultCenter removeObserver:observer];
      objc_setAssociatedObject(defaults, kNacreDefaultsObserverKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return true;
  }
  if ([object isKindOfClass:UIBarButtonItem.class]) {
    UIBarButtonItem* item = (UIBarButtonItem*)object;
    NSString* name = @(type.c_str());
    if (!IsBarButtonEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
    NSMutableDictionary<NSString*, NacreControlTarget*>* table =
        objc_getAssociatedObject(item, kNacreControlTargetsKey);
    if (table == nil) {
      table = [NSMutableDictionary dictionary];
      objc_setAssociatedObject(item, kNacreControlTargetsKey, table,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    if (on) {
      if (table[name] != nil) return true;
      NacreControlTarget* target = [NacreControlTarget new];
      target.runtime = self;
      target.type = name;
      table[name] = target;
      // target 是 weak 的，所以 trampoline 由上面那个关联对象持有
      item.target = target;
      item.action = @selector(fireBarButton:);
    } else if (table[name] != nil) {
      item.target = nil;
      item.action = nil;
      [table removeObjectForKey:name];
    }
    return true;
  }
  if ([object isKindOfClass:NSURLSessionWebSocketTask.class]) {
    // 只校验名字。delegate 一直在发，没人听时 dispatchEvent 自然是空操作
    static NSSet<NSString*>* names;
    static dispatch_once_t once;
    dispatch_once(&once, ^{
      names = [NSSet setWithArray:@[ @"open", @"message", @"error", @"close" ]];
    });
    NSString* name = @(type.c_str());
    if (![names containsObject:name]) {
      return NacreSubscribed::UnknownEvent;
    }
    return true;
  }
  if ([object isKindOfClass:CADisplayLink.class]) {
    CADisplayLink* link = (CADisplayLink*)object;
    NSString* name = @(type.c_str());
    if (!IsDisplayLinkEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
    // trampoline 是造对象时就挂上的，靠关联对象找回来
    // （CADisplayLink 没有公开的 target 属性）
    NacreDisplayLinkTarget* hop =
        objc_getAssociatedObject(link, kNacreDisplayLinkTargetKey);
    if (hop != nil) {
      hop.runtime = self;
      hop.subscribed = on;
    }
    return true;
  }
  if ([object isKindOfClass:CAAnimation.class]) {
    CAAnimation* anim = (CAAnimation*)object;
    NSString* name = @(type.c_str());
    if (!IsAnimationEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
    NacreAnimationDelegate* d =
        objc_getAssociatedObject(anim, kNacreAnimationDelegateKey);
    if (on) {
      if (d == nil) {
        d = [NacreAnimationDelegate new];
        d.runtime = self;
        d.origin = anim;
        d.types = [NSMutableSet set];
        objc_setAssociatedObject(anim, kNacreAnimationDelegateKey, d,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        anim.delegate = d;
      }
      [d.types addObject:name];
    } else if (d != nil) {
      [d.types removeObject:name];
    }
    return true;
  }
  // tab 控制器：自己的事件在这里认。它也是页面，能被模态呈现，所以别的
  // 名字不在这里拒，往下落到模态那一支——但报错时要把两边的名字都列出来
  if ([object isKindOfClass:UITabBarController.class]) {
    UITabBarController* tabs = (UITabBarController*)object;
    NSString* name = @(type.c_str());
    if (IsTabEventName(name)) {
      NacreTabDelegate* d = objc_getAssociatedObject(tabs, kNacreTabDelegateKey);
      if (on) {
        if (d == nil) {
          d = [NacreTabDelegate new];
          d.runtime = self;
          d.types = [NSMutableSet set];
          objc_setAssociatedObject(tabs, kNacreTabDelegateKey, d,
                                   OBJC_ASSOCIATION_RETAIN_NONATOMIC);
          tabs.delegate = d;
        }
        [d.types addObject:name];
      } else if (d != nil) {
        [d.types removeObject:name];
        if (d.types.count == 0) {
          tabs.delegate = nil;
          objc_setAssociatedObject(tabs, kNacreTabDelegateKey, nil,
                                   OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        }
      }
      return true;
    }
    if (![name isEqualToString:@"@dismissed"] && !IsPresentationEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
  }
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    NSString* name = @(type.c_str());
    // @ 开头的两个名字是运行时自己订的，不在对外的事件名表里。
    // 模态的三条（和运行时自己订的 @dismissed）是「被模态呈现的那一页」的事，
    // 导航控制器也可能被呈现，所以不在这里处理，往下落到模态那一支
    const BOOL internalStack = [name isEqualToString:@"@stack"];
    const BOOL presentation =
        [name isEqualToString:@"@dismissed"] || IsPresentationEventName(name);
    if (!internalStack && !presentation && !IsNavEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
    NacreNavDelegate* d = objc_getAssociatedObject(nav, kNacreNavDelegateKey);
    if (presentation) {
      // 交给下面模态那一支
    } else if (on) {
      if (d == nil) {
        d = [NacreNavDelegate new];
        d.runtime = self;
        d.types = [NSMutableSet set];
        objc_setAssociatedObject(nav, kNacreNavDelegateKey, d,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        nav.delegate = d;
      }
      [d.types addObject:name];
    } else if (d != nil) {
      [d.types removeObject:name];
      if (d.types.count == 0) {
        nav.delegate = nil;
        objc_setAssociatedObject(nav, kNacreNavDelegateKey, nil,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      }
    }
    if (!presentation) return true;
  }
  // 放在 UINavigationController 之后：它是 UIViewController 的子类，
  // 导航事件先认走，剩下的才轮到模态事件
  if ([object isKindOfClass:UIViewController.class]) {
    UIViewController* vc = (UIViewController*)object;
    NSString* name = @(type.c_str());
    if (![name isEqualToString:@"@dismissed"] && !IsPresentationEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
    NacrePresentationDelegate* d =
        objc_getAssociatedObject(vc, kNacrePresentationDelegateKey);
    if (on) {
      if (d == nil) {
        d = [NacrePresentationDelegate new];
        d.runtime = self;
        d.types = [NSMutableSet set];
        objc_setAssociatedObject(vc, kNacrePresentationDelegateKey, d,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      }
      [d.types addObject:name];
      // 已经在呈现中就立刻装上；还没呈现的话 present 时会再装一次
      [self installPresentationDelegate:vc];
    } else if (d != nil) {
      [d.types removeObject:name];
      if (d.types.count == 0) {
        UIPresentationController* pc = vc.presentationController;
        if (pc != nil && pc.delegate == d) pc.delegate = nil;
        objc_setAssociatedObject(vc, kNacrePresentationDelegateKey, nil,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      }
    }
    return true;
  }
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    NSString* name = @(type.c_str());
    if (!IsScrollEventName(name)) {
      return NacreSubscribed::UnknownEvent;
    }
    NacreScrollDelegate* d =
        objc_getAssociatedObject(sv, kNacreScrollDelegateKey);
    if (on) {
      if (d == nil) {
        d = [NacreScrollDelegate new];
        d.runtime = self;
        d.types = [NSMutableSet set];
        objc_setAssociatedObject(sv, kNacreScrollDelegateKey, d,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        // 不直接写 sv.delegate：这个槽位可能有别的域也要用（列表的事件和
        // 滚动的事件是同一个 delegate），加进去由转发对象分给各方
        NacreAddDelegatePart(sv, d);
      }
      [d.types addObject:name];
    } else if (d != nil) {
      [d.types removeObject:name];
      // 一个监听器都不剩就把 delegate 摘掉，回到零开销
      if (d.types.count == 0) {
        NacreRemoveDelegatePart(sv, d);
        objc_setAssociatedObject(sv, kNacreScrollDelegateKey, nil,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      }
    }
    return true;
  }
  if (![object isKindOfClass:UIControl.class]) {
    *error = "this object does not support event subscription";
    return true;
  }
  UIControl* control = (UIControl*)object;
  NSString* name = @(type.c_str());
  UIControlEvents bit;
  if (!ControlEventFromName(name, &bit)) {
    return NacreSubscribed::UnknownEvent;
  }
  NSMutableDictionary<NSString*, NacreControlTarget*>* table =
      objc_getAssociatedObject(control, kNacreControlTargetsKey);
  if (table == nil) {
    table = [NSMutableDictionary dictionary];
    objc_setAssociatedObject(control, kNacreControlTargetsKey, table,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  if (on) {
    if (table[name] != nil) return true;   // 已经订阅过这个类型
    NacreControlTarget* target = [NacreControlTarget new];
    target.runtime = self;
    target.type = name;
    table[name] = target;
    [control addTarget:target action:@selector(fire:forEvent:) forControlEvents:bit];
  } else {
    NacreControlTarget* target = table[name];
    if (target == nil) return true;
    [control removeTarget:target action:@selector(fire:forEvent:) forControlEvents:bit];
    [table removeObjectForKey:name];
  }
  return true;
}

// 把一次 JS 发起的异步调用的结果投回 JS 线程
- (void)settleCall:(int)callId with:(BOOL)value {
  auto engine = _engine;
  [self postToJS:^{
    if (*engine) (*engine)->SettleBool(callId, value ? true : false);
  }];
}

// call_async 这条通道只约定了「异步地兑现 call_id」，没规定兑现成什么。
// openURL 兑现布尔，图片解码兑现一个原生对象，共用同一条路。
- (void)settleCall:(int)callId withObject:(id)object className:(const char*)className {
  auto engine = _engine;
  std::string name = className;
  // 捕获 object 本身而不是裸指针：block 要等下一轮主队列才跑，
  // 这中间必须有人持有它，否则 SettleObject 拿到的是野指针。
  [self postToJS:^{
    if (*engine) (*engine)->SettleObject(callId, {NacreKeep(object), name});
  }];
}

// JS 现在就在主线程上跑。仍然用 dispatch_async 而不是直接调用：
// 保证每轮 JS 执行都是独立的一轮，不会在 UIKit 操作中途重入。
// 例外是同步回调（见 NacreSetSyncSinks 那一段）：系统当场要答复，不走这里。
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
  // 让所有已排的唤醒作废；它们醒来时 weakSelf 也已经是 nil 了
  _wakeupGeneration++;
  [_fetch invalidate];
  // Engine 和 JS 在同一个线程（主线程），dealloc 也在主线程，直接销毁
  _engine->reset();
}

@end
