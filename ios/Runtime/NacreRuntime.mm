#import "NacreRuntime.h"

#import <UIKit/UIKit.h>
#import <os/log.h>
#import <objc/runtime.h>

#include <memory>
#include <mutex>
#include <string>

#include "Engine/Engine.h"

#include "Bridge/NacreBridge.h"

using namespace nacre_bridge;

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------
//
// 线程分工（实测定下来的）：
//
//   NSURLSession 的线程池     DNS/TCP/TLS/传输/gzip，系统的，并行
//          ↓
//   delegate 串行队列         **只做最轻的事**：追加数据、记状态、一次 dispatch
//          ↓
//   并发队列                  UTF-8 解码这类 CPU 活
//          ↓
//   主线程                    建 V8 对象、兑现 Promise
//
// 中间那层是被实测逼出来的：20 个并发请求，每个回调做 100ms 重活，直接在
// delegate 队列上做要 2179ms（全串行），派到并发队列只要 166ms。

@interface NacreFetchTask : NSObject
@property(nonatomic) int requestId;
@property(nonatomic, strong) NSURLSessionDataTask* task;
@property(nonatomic, strong) NSMutableData* body;
@property(nonatomic) BOOL completed;      // body 下载完了（成功或失败）
@property(nonatomic, strong) NSError* error;
// 等 body 的那个调用。headers 先到、body 后到，所以 read 可能来得比完成早
@property(nonatomic) int pendingBodyCallId;
@property(nonatomic, copy) NSString* pendingBodyKind;
@end

@implementation NacreFetchTask
@end

@interface NacreRuntime () <NSURLSessionDataDelegate>
- (void)emitControlEvent:(NSString*)type from:(UIControl*)control;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             then:(dispatch_block_t)completion;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             with:(id)payload
    payloadClass:(const char*)payloadClass;
- (void)setSubscription:(id)object
                   type:(const std::string&)type
                     on:(BOOL)on
                  error:(std::string*)error;
@end

// 控件事件的中转。
//
// control 通过关联对象持有它（`addTarget:action:` 自己**不**持有 target，
// 头文件原话 "the target is not retained"），它只记一个事件名和一个回
// 运行时的弱引用——**不持有任何 JS 函数**。派发时拿原生指针查包装，再走
// 包装自己的 dispatchEvent。于是回调的生命周期问题就只剩「包装活不活」，
// 而那个所有权镜像已经解决了。
@interface NacreControlTarget : NSObject
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, copy) NSString* type;
@end

@implementation NacreControlTarget
- (void)fire:(UIControl*)sender {
  [self.runtime emitControlEvent:self.type from:sender];
}
@end

// 滚动的 trampoline。和控件那个一样**只持有 handle 不持有 JS 函数**，
// 区别在于 UIScrollView 的事件全在 delegate 上，而 delegate 是一个对象、
// 不是一组可以分别注册的 action。所以订阅状态要自己记：types 里没有的
// 类型压根不过桥——这是惰性订阅第一次真的省开销，而不只是整洁。
@interface NacreScrollDelegate : NSObject <UIScrollViewDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
// 合并用：队列里已经有一个 scroll 在等着就不再排第二个。
// 这么做是无损的，因为事件不带数据，JS 回头从 contentOffset 上读最新值
@property(nonatomic, assign) BOOL scrollPending;
@end

@implementation NacreScrollDelegate

- (void)emit:(NSString*)type from:(UIScrollView*)sv {
  if (![self.types containsObject:type]) return;
  [self.runtime emitEvent:type from:sv className:"UIScrollView" then:nil];
}

- (void)scrollViewDidScroll:(UIScrollView*)scrollView {
  if (![self.types containsObject:@"scroll"]) return;
  if (self.scrollPending) return;
  self.scrollPending = YES;
  __weak NacreScrollDelegate* weakSelf = self;
  [self.runtime emitEvent:@"scroll"
                     from:scrollView
                className:"UIScrollView"
                     then:^{ weakSelf.scrollPending = NO; }];
}

- (void)scrollViewWillBeginDragging:(UIScrollView*)scrollView {
  [self emit:@"dragbegin" from:scrollView];
}
// willDecelerate 这个参数不往事件上放：延后一轮之后 JS 读 isDecelerating
// 拿到的是事实，而参数只是预测
- (void)scrollViewDidEndDragging:(UIScrollView*)scrollView
                  willDecelerate:(BOOL)decelerate {
  [self emit:@"dragend" from:scrollView];
}
- (void)scrollViewWillBeginDecelerating:(UIScrollView*)scrollView {
  [self emit:@"deceleratebegin" from:scrollView];
}
- (void)scrollViewDidEndDecelerating:(UIScrollView*)scrollView {
  [self emit:@"decelerateend" from:scrollView];
}
- (void)scrollViewDidEndScrollingAnimation:(UIScrollView*)scrollView {
  [self emit:@"scrollanimationend" from:scrollView];
}
- (void)scrollViewDidScrollToTop:(UIScrollView*)scrollView {
  [self emit:@"scrolltotop" from:scrollView];
}
- (void)scrollViewDidChangeAdjustedContentInset:(UIScrollView*)scrollView {
  [self emit:@"adjustedcontentinsetchange" from:scrollView];
}

@end

// 导航的 trampoline。和滚动那个同构，区别是这两条事件**带一个 viewController**：
// 「哪个页面」在 willShow 那一刻从 nav 上读不到（topViewController 还没换），
// 所以原生送什么就带什么——事件带不带数据的判据是「那个信息在对象上读不读
// 得到」，不是「一律不带」。
@interface NacreNavDelegate : NSObject <UINavigationControllerDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreNavDelegate

- (void)emit:(NSString*)type from:(UINavigationController*)nav with:(UIViewController*)vc {
  if (![self.types containsObject:type]) return;
  [self.runtime emitEvent:type
                     from:nav
                className:"UINavigationController"
                     with:vc
             payloadClass:"UIViewController"];
}

- (void)navigationController:(UINavigationController*)navigationController
      willShowViewController:(UIViewController*)viewController
                    animated:(BOOL)animated {
  [self emit:@"willshow" from:navigationController with:viewController];
}

- (void)navigationController:(UINavigationController*)navigationController
       didShowViewController:(UIViewController*)viewController
                    animated:(BOOL)animated {
  [self emit:@"didshow" from:navigationController with:viewController];
}

@end

// 关联对象的 key：事件名 → NacreControlTarget
static const void* kNacreControlTargetsKey = &kNacreControlTargetsKey;
// 关联对象的 key：UIScrollView → NacreScrollDelegate。
// scrollView.delegate 是 weak，所以 trampoline 必须由关联对象来持有
static const void* kNacreScrollDelegateKey = &kNacreScrollDelegateKey;
// 同理：navigationController.delegate 也是 weak
static const void* kNacreNavDelegateKey = &kNacreNavDelegateKey;

@implementation NacreRuntime {
  BOOL _started;
  // JS 跑在主线程，所以这些都只在主线程上创建、使用和销毁
  std::shared_ptr<std::unique_ptr<nacre::Engine>> _engine;
  std::shared_ptr<AppSnapshot> _snapshot;
  NSMutableArray* _observers;
  // 主线程即将空闲时把时间交给 V8 做增量 GC
  CFRunLoopObserverRef _idleObserver;
  // fetch 的状态。_fetchTasks 只在 _fetchQueue 上访问，所以不用加锁。
  NSURLSession* _session;
  NSOperationQueue* _delegateQueue;     // 串行，只做最轻的事
  dispatch_queue_t _fetchQueue;         // 串行，守着 _fetchTasks
  dispatch_queue_t _fetchWorkQueue;     // 并发，干解码这类重活
  NSMutableDictionary<NSNumber*, NacreFetchTask*>* _fetchTasks;
  int _nextRequestId;

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
    _fetchTasks = [NSMutableDictionary dictionary];
    _nextRequestId = 1;
    _fetchQueue = dispatch_queue_create("nacre.fetch", DISPATCH_QUEUE_SERIAL);
    _fetchWorkQueue = dispatch_queue_create(
        "nacre.fetch.work", DISPATCH_QUEUE_CONCURRENT);
    // delegate 队列设成串行（maxConcurrent = 1）：回调顺序要确定，
    // 而且我们在上面只做最轻的事，重活会派到 _fetchWorkQueue
    _delegateQueue = [NSOperationQueue new];
    _delegateQueue.maxConcurrentOperationCount = 1;
    _delegateQueue.name = @"nacre.fetch.delegate";
  }
  return self;
}

// ---- fetch ----

- (NSURLSession*)fetchSession {
  if (!_session) {
    NSURLSessionConfiguration* cfg =
        [NSURLSessionConfiguration defaultSessionConfiguration];
    _session = [NSURLSession sessionWithConfiguration:cfg
                                             delegate:self
                                        delegateQueue:_delegateQueue];
  }
  return _session;
}

- (int)fetchStart:(const std::string&)urlText
          options:(const std::string&)optionsJSON
           callId:(int)callId {
  auto engine = _engine;
  NSURL* url = [NSURL URLWithString:@(urlText.c_str())];
  if (url == nil || url.scheme.length == 0) {
    // 立刻拒绝，但要排到下一轮——JS 还没拿到 Promise 呢
    dispatch_async(dispatch_get_main_queue(), ^{
      if (*engine) (*engine)->RejectCall(callId, "TypeError", "URL 不合法");
    });
    return 0;
  }

  id decoded = DecodeJSON(optionsJSON);
  NSDictionary* opts = [decoded isKindOfClass:NSDictionary.class] ? decoded : @{};
  NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL:url];
  NSString* method = opts[@"method"];
  req.HTTPMethod = [method isKindOfClass:NSString.class] ? method.uppercaseString : @"GET";
  NSArray* headerPairs = opts[@"headers"];
  if ([headerPairs isKindOfClass:NSArray.class]) {
    for (NSArray* pair in headerPairs) {
      if (![pair isKindOfClass:NSArray.class] || pair.count != 2) continue;
      // 用 add 而不是 set：同名多值要保留
      [req addValue:pair[1] forHTTPHeaderField:pair[0]];
    }
  }
  NSString* bodyText = opts[@"body"];
  if ([bodyText isKindOfClass:NSString.class]) {
    req.HTTPBody = [bodyText dataUsingEncoding:NSUTF8StringEncoding];
  }

  const int requestId = _nextRequestId++;
  NacreFetchTask* entry = [NacreFetchTask new];
  entry.requestId = requestId;
  entry.body = [NSMutableData data];
  entry.pendingBodyCallId = 0;
  entry.task = [[self fetchSession] dataTaskWithRequest:req];
  // taskDescription 是从 delegate 回调找回 requestId 的那根线
  entry.task.taskDescription = [NSString stringWithFormat:@"%d:%d", requestId, callId];
  dispatch_async(_fetchQueue, ^{
    self->_fetchTasks[@(requestId)] = entry;
  });
  [entry.task resume];
  return requestId;
}

// 把 delegate 回调里的 task 映射回我们的记录
- (void)withTask:(NSURLSessionTask*)task
              do:(void (^)(NacreFetchTask* entry, int callId))block {
  NSArray* parts = [task.taskDescription componentsSeparatedByString:@":"];
  if (parts.count != 2) return;
  const int requestId = [parts[0] intValue];
  const int callId = [parts[1] intValue];
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (entry) block(entry, callId);
  });
}

// headers 到了 —— 这时候就兑现 Response，body 还在下
- (void)URLSession:(NSURLSession*)session
              dataTask:(NSURLSessionDataTask*)dataTask
    didReceiveResponse:(NSURLResponse*)response
     completionHandler:(void (^)(NSURLSessionResponseDisposition))completionHandler {
  completionHandler(NSURLSessionResponseAllow);
  auto engine = _engine;
  NSHTTPURLResponse* http =
      [response isKindOfClass:NSHTTPURLResponse.class] ? (NSHTTPURLResponse*)response : nil;
  [self withTask:dataTask
              do:^(NacreFetchTask* entry, int callId) {
                NSMutableArray* headerPairs = [NSMutableArray array];
                [http.allHeaderFields
                    enumerateKeysAndObjectsUsingBlock:^(id k, id v, BOOL* stop) {
                      [headerPairs addObject:@[ [k description], [v description] ]];
                    }];
                NSDictionary* payload = @{
                  @"requestId" : @(entry.requestId),
                  @"status" : @(http ? http.statusCode : 200),
                  @"url" : response.URL.absoluteString ?: @"",
                  @"headers" : headerPairs,
                };
                const std::string json = EncodeJSON(payload);
                dispatch_async(dispatch_get_main_queue(), ^{
                  if (*engine) (*engine)->SettleJSON(callId, json);
                });
              }];
}

// 数据块到了 —— delegate 队列上只做 append，绝不在这里干活
- (void)URLSession:(NSURLSession*)session
          dataTask:(NSURLSessionDataTask*)dataTask
    didReceiveData:(NSData*)data {
  [self withTask:dataTask
              do:^(NacreFetchTask* entry, int callId) { [entry.body appendData:data]; }];
}

- (void)URLSession:(NSURLSession*)session
                    task:(NSURLSessionTask*)task
    didCompleteWithError:(NSError*)error {
  [self withTask:task
              do:^(NacreFetchTask* entry, int callId) {
                entry.completed = YES;
                entry.error = error;
                if (error && entry.pendingBodyCallId == 0) {
                  // headers 都没到就失败了，拒绝那个 Response 的 Promise
                  [self rejectCall:callId withError:error];
                }
                if (entry.pendingBodyCallId != 0) {
                  // 已经有人在等 body 了，现在能给了
                  [self deliverBody:entry
                               kind:entry.pendingBodyKind
                             callId:entry.pendingBodyCallId];
                  entry.pendingBodyCallId = 0;
                }
              }];
}

- (void)rejectCall:(int)callId withError:(NSError*)error {
  auto engine = _engine;
  const BOOL cancelled = error.code == NSURLErrorCancelled;
  const std::string name = cancelled ? "AbortError" : "TypeError";
  NSString* text = cancelled
                       ? @"The operation was aborted"
                       : [NSString stringWithFormat:@"Network request failed: %@",
                                                    error.localizedDescription];
  const std::string message = text.UTF8String;
  dispatch_async(dispatch_get_main_queue(), ^{
    if (*engine) (*engine)->RejectCall(callId, name, message);
  });
}

// 真正把 body 交出去。重活（UTF-8 解码）在并发队列上做。
- (void)deliverBody:(NacreFetchTask*)entry kind:(NSString*)kind callId:(int)callId {
  auto engine = _engine;
  if (entry.error) {
    [self rejectCall:callId withError:entry.error];
    return;
  }
  NSData* data = [entry.body copy];
  dispatch_async(_fetchWorkQueue, ^{
    if ([kind isEqualToString:@"text"]) {
      // UTF-8 解码：这是实打实的 CPU 活，所以才要并发队列
      NSString* text = [[NSString alloc] initWithData:data
                                             encoding:NSUTF8StringEncoding]
                           ?: @"";
      const std::string json = EncodeJSON(text);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->SettleJSON(callId, json);
      });
    } else if ([kind isEqualToString:@"blob"]) {
      // blob：字节压根不进 V8 堆，JS 侧只拿一个句柄
      NacreBlob* blob = [NacreBlob new];
      blob.data = data;
      blob.type = @"";
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) return;
        (*engine)->SettleObject(
            callId, {(void*)CFAutorelease(CFBridgingRetain(blob)), "Blob"});
      });
    } else {
      // arrayBuffer：把 NSData 的内存直接交给 V8，零拷贝。
      // CFBridgingRetain 把所有权转过去，deleter 里再 release。
      const void* bytes = data.bytes;
      const size_t length = data.length;
      void* owned = (void*)CFBridgingRetain(data);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) {
          CFRelease(owned);
          return;
        }
        (*engine)->SettleBytes(
            callId, (void*)bytes, length,
            [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
      });
    }
  });
}

- (void)fetchReadBody:(int)requestId kind:(const std::string&)kindText callId:(int)callId {
  NSString* kind = @(kindText.c_str());
  auto engine = _engine;
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (!entry) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->RejectCall(callId, "TypeError", "这个请求已经没了");
      });
      return;
    }
    if (entry.completed) {
      [self deliverBody:entry kind:kind callId:callId];
    } else {
      // body 还在下，记下来等完成时再给
      entry.pendingBodyCallId = callId;
      entry.pendingBodyKind = kind;
    }
  });
}

- (void)fetchCancel:(int)requestId {
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    [entry.task cancel];
  });
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
  // 在主线程做会掉帧。这也是 arrayBuffer 零拷贝、text 才要后台的原因。
  dispatch_async(_fetchWorkQueue, ^{
    if ([kind isEqualToString:@"text"]) {
      NSString* text =
          [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"";
      const std::string json = EncodeJSON(text);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->SettleJSON(callId, json);
      });
    } else {
      const void* bytes = data.bytes;
      const size_t length = data.length;
      void* owned = (void*)CFBridgingRetain(data);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) {
          CFRelease(owned);
          return;
        }
        (*engine)->SettleBytes(
            callId, (void*)bytes, length,
            [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
      });
    }
  });
}

nacre::NativeObjectRef CreateBlob(
    const std::string& partsJSON,
    const std::vector<std::pair<const void*, size_t>>& buffers,
    const std::string& type) {
  id decoded = DecodeJSON(partsJSON);
  NSArray* parts = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  NSMutableData* out = [NSMutableData data];
  for (NSUInteger i = 0; i < parts.count; i++) {
    id item = parts[i];
    if (i < buffers.size() && buffers[i].first != nullptr) {
      // 字节项：JSON 里是 null，真正的数据在 buffers 里
      [out appendBytes:buffers[i].first length:buffers[i].second];
    } else if ([item isKindOfClass:NSString.class]) {
      [out appendData:[item dataUsingEncoding:NSUTF8StringEncoding]];
    } else if (item != nil && item != NSNull.null) {
      [out appendData:[[item description] dataUsingEncoding:NSUTF8StringEncoding]];
    }
  }
  NacreBlob* blob = [NacreBlob new];
  blob.data = out;
  blob.type = @(type.c_str());
  return {(void*)CFAutorelease(CFBridgingRetain(blob)), "Blob"};
}

- (void)fetchRelease:(int)requestId {
  dispatch_async(_fetchQueue, ^{
    [self->_fetchTasks removeObjectForKey:@(requestId)];
  });
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
    host.write_property = [](void* ptr, const std::string& name,
                             const std::string& json, std::string* error) {
      WriteNativeProperty((__bridge id)ptr, name, json, error);
    };
    host.read_object_property = [](void* ptr, const std::string& name) {
      return ReadNativeObjectProperty((__bridge id)ptr, name);
    };
    host.write_object_property = [](void* ptr, const std::string& name, void* value) {
      WriteNativeObjectProperty((__bridge id)ptr, name, value);
    };
    host.construct_native = [](const std::string& className,
                               const std::vector<void*>& args) {
      return ConstructNative(className, args);
    };
    host.call_method = [](void* ptr, const std::string& name,
                          const std::string& argsJSON,
                          const std::vector<void*>& argPtrs, std::string* error) {
      return CallMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
    };
    host.call_object_method = [](void* ptr, const std::string& name,
                                 const std::string& argsJSON,
                                 const std::vector<void*>& argPtrs,
                                 std::string* error) {
      return CallObjectMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
    };
    host.read_object_array_property = [](void* ptr, const std::string& name) {
      return ReadNativeObjectArrayProperty((__bridge id)ptr, name);
    };
    host.write_object_array_property = [](void* ptr, const std::string& name,
                                          const std::vector<void*>& values,
                                          std::string* error) {
      WriteNativeObjectArrayProperty((__bridge id)ptr, name, values, error);
    };
    host.set_event_subscription = [weakSelf](void* ptr, const std::string& type,
                                             bool on, std::string* error) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf setSubscription:(__bridge id)ptr type:type on:on error:error];
    };
    host.call_object_array_method = [](void* ptr, const std::string& name,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& argPtrs,
                                       std::string* error) {
      return CallObjectArrayMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
    };
    host.call_class_object_method = [](const std::string& className,
                                       const std::string& name,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& argPtrs,
                                       std::string* error) {
      return CallClassObjectMethod(className, name, argsJSON, argPtrs, error);
    };
    host.read_class_object_property = [](const std::string& className,
                                         const std::string& name) {
      return ReadClassObjectProperty(className, name);
    };
    host.fetch_start = [weakSelf](const std::string& url, const std::string& options,
                                  int callId) -> int {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return 0;
      return [strongSelf fetchStart:url options:options callId:callId];
    };
    host.fetch_read_body = [weakSelf](int requestId, const std::string& kind,
                                      int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf fetchReadBody:requestId kind:kind callId:callId];
    };
    host.fetch_cancel = [weakSelf](int requestId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf fetchCancel:requestId];
    };
    host.fetch_release = [weakSelf](int requestId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf fetchRelease:requestId];
    };
    host.read_object_async = [weakSelf](void* ptr, const std::string& kind,
                                        int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf readObjectAsync:(__bridge id)ptr kind:kind callId:callId];
    };
    host.create_blob = [](const std::string& partsJSON,
                          const std::vector<std::pair<const void*, size_t>>& buffers,
                          const std::string& type) {
      return CreateBlob(partsJSON, buffers, type);
    };
    host.parse_url = [](const std::string& url, const std::string& base) {
      return ParseURL(url, base);
    };
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
    host.call_void_method = [](void* ptr, const std::string& name) {
      CallVoidMethod((__bridge id)ptr, name);
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
      // 图片解码默认发生在**绘制时**，也就是主线程。这两个方法把解码挪到
      // 后台，解完再把准备好的那张图交回来。JS 本来就在主线程抢时间，
      // 大图不走这条就会掉帧。
      if ([object isKindOfClass:UIImage.class]) {
        UIImage* image = (UIImage*)object;
        if (name == "prepareForDisplay") {
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
      WriteRuntimeLog(@"builtin script Builtin/nacre.js is missing; the upper-layer API is unavailable");
      return;
    }
    // 脚本名用 nacre:internal/ 前缀而不是文件路径：调用栈里一眼能看出是运行时内部，
    // 和 Node 的 node:internal/... 同样的做法
    double t0 = NowMs();
    bool ok = (*engine)->Evaluate({"nacre:internal/nacre.js", source.UTF8String});
    WriteRuntimeLog([NSString stringWithFormat:@"builtin script %@ in %.1f ms", ok ? @"ready" : @"failed", NowMs() - t0]);
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
                    (*engine)->EmitObjectEvent({(__bridge void*)window, "UIWindow"},
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

// 控件事件：延后一轮再进 JS，和别的原生通知一致。
// 这里捕获的是 control 的强引用，保证 block 跑起来时它还活着。
- (void)emitControlEvent:(NSString*)type from:(UIControl*)control {
  [self emitEvent:type from:control className:"UIControl" then:nil];
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
    if (*engine) (*engine)->EmitObjectEvent({(__bridge void*)object, cls}, t);
    if (completion) completion();
  }];
}

// 带一个原生对象作为负载的事件。延后一轮，和别的一致。
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             with:(id)payload
    payloadClass:(const char*)payloadClass {
  auto engine = _engine;
  std::string t = type.UTF8String;
  std::string cls = className;
  std::string payloadCls = payloadClass;
  [self postToJS:^{
    if (*engine) {
      (*engine)->EmitObjectEventWith({(__bridge void*)object, cls}, t,
                                     {(__bridge void*)payload, payloadCls});
    }
  }];
}

// 按对象订阅。JS 侧某个类型第一次有监听器时 on=YES，最后一个移走时 on=NO。
- (void)setSubscription:(id)object
                   type:(const std::string&)type
                     on:(BOOL)on
                  error:(std::string*)error {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    NSString* name = @(type.c_str());
    if (!IsNavEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForNavEvent());
      return;
    }
    NacreNavDelegate* d = objc_getAssociatedObject(nav, kNacreNavDelegateKey);
    if (on) {
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
    return;
  }
  if ([object isKindOfClass:UIScrollView.class]) {
    UIScrollView* sv = (UIScrollView*)object;
    NSString* name = @(type.c_str());
    if (!IsScrollEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForScrollEvent());
      return;
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
        sv.delegate = d;
      }
      [d.types addObject:name];
    } else if (d != nil) {
      [d.types removeObject:name];
      // 一个监听器都不剩就把 delegate 摘掉，回到零开销
      if (d.types.count == 0) {
        sv.delegate = nil;
        objc_setAssociatedObject(sv, kNacreScrollDelegateKey, nil,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      }
    }
    return;
  }
  if (![object isKindOfClass:UIControl.class]) {
    *error = "this object does not support event subscription";
    return;
  }
  UIControl* control = (UIControl*)object;
  NSString* name = @(type.c_str());
  UIControlEvents bit;
  if (!ControlEventFromName(name, &bit)) {
    *error = EnumError(@"addEventListener", name, NamesForControlEvent());
    return;
  }
  NSMutableDictionary<NSString*, NacreControlTarget*>* table =
      objc_getAssociatedObject(control, kNacreControlTargetsKey);
  if (table == nil) {
    table = [NSMutableDictionary dictionary];
    objc_setAssociatedObject(control, kNacreControlTargetsKey, table,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  if (on) {
    if (table[name] != nil) return;   // 已经订阅过这个类型
    NacreControlTarget* target = [NacreControlTarget new];
    target.runtime = self;
    target.type = name;
    table[name] = target;
    [control addTarget:target action:@selector(fire:) forControlEvents:bit];
  } else {
    NacreControlTarget* target = table[name];
    if (target == nil) return;
    [control removeTarget:target action:@selector(fire:) forControlEvents:bit];
    [table removeObjectForKey:name];
  }
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
    if (*engine) (*engine)->SettleObject(callId, {(__bridge void*)object, name});
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
  // 让所有已排的唤醒作废；它们醒来时 weakSelf 也已经是 nil 了
  _wakeupGeneration++;
  [_session invalidateAndCancel];
  _session = nil;
  // Engine 和 JS 在同一个线程（主线程），dealloc 也在主线程，直接销毁
  _engine->reset();
}

@end
