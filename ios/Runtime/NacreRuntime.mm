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
// 响应头交给 JS 了。从这一刻起 JS 那边有一个 Response，这条记录的清理
// 归它管（它被回收时来 fetchRelease）；在这之前结束的请求没有人会来清理
@property(nonatomic) BOOL responded;
@property(nonatomic, strong) NSError* error;
// 等 body 的那个调用。headers 先到、body 后到，所以 read 可能来得比完成早
@property(nonatomic) int pendingBodyCallId;
@property(nonatomic, copy) NSString* pendingBodyKind;
@end

@implementation NacreFetchTask
@end

@interface NacreRuntime () <NSURLSessionDataDelegate>
- (void)emitControlEvent:(NSString*)type from:(UIControl*)control event:(UIEvent*)event;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             then:(dispatch_block_t)completion;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             with:(id)payload
    payloadClass:(const char*)payloadClass;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             json:(const std::string&)json;
- (void)setSubscription:(id)object
                   type:(const std::string&)type
                     on:(BOOL)on
                  error:(std::string*)error;
- (void)routeSubscription:(id)object
                     type:(const std::string&)type
                       on:(BOOL)on
                    error:(std::string*)error;
- (void)installPresentationDelegate:(UIViewController*)vc;
@end

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
// 两参的 action。**单参那版拿不到 UIEvent**，而触点位置只能从它身上取，
// 而且只能在这一刻取——事件延后一轮派发，到那时 UIEvent 早没了。
- (void)fire:(UIControl*)sender forEvent:(UIEvent*)event {
  [self.runtime emitControlEvent:self.type from:sender event:event];
}
// UIBarButtonItem 不是 UIControl，但 target/action 是同一套，所以复用这个
// trampoline，只是 sender 的类名不一样
- (void)fireBarButton:(UIBarButtonItem*)sender {
  [self.runtime emitEvent:self.type from:sender className:"UIBarButtonItem" then:nil];
}
@end

// 本地存储的变化通知。和上面两个一样只持有 handle 不持有 JS 函数。
//
// 用通知而不是按键 KVO，是因为第一版单进程、没有 App Group 和 iCloud，
// 通知覆盖得住；而按键订阅要先解决「订阅按事件名分流」那条 TODO。
// 边界要知道（头文件原话）：这条通知**只在本进程改**的时候发，外部进程和
// iCloud 的改动收不到。和 Web 的 storage 事件正好相反——那个只在**别的
// tab** 改时发，自己改不发。
@interface NacreDefaultsObserver : NSObject
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, weak) NSUserDefaults* defaults;
@end

@implementation NacreDefaultsObserver
- (void)defaultsChanged:(NSNotification*)note {
  NSUserDefaults* d = self.defaults;
  if (d == nil) return;
  [self.runtime emitEvent:@"change" from:d className:"NSUserDefaults" then:nil];
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

// 动画的 trampoline。和别的一样只持有 handle 不持有 JS 函数，但多一条
// 别处没有的麻烦：**addAnimation: 会拷贝动画**，delegate 跟着被拷过去，
// 所以回调里的 anim 是那份拷贝，指针和 JS 当初建的那个对不上。于是
// trampoline 自己记着原来那个对象，派发时派给它——JS 监听的本来就是它。
//
// origin 是 weak：动画 strong 持有 delegate，反过来再强持有就成环了。
// JS 那边只要还拿着包装，原对象就活着；包装没了也就没人听了。
@interface NacreAnimationDelegate : NSObject <CAAnimationDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
// **weak，不能 strong**：动画 strong 持有 delegate（和 UIScrollView.delegate
// 的 weak 正好相反），反过来再强持有就成环。
//
// 另外还有一层保险：只有 types 非空时才碰 origin，而 types 非空就意味着
// JS 侧的 subscribed 还攥着那个包装，包装攥着句柄，原生对象活着。
@property(nonatomic, weak) CAAnimation* origin;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreAnimationDelegate

// 先看 types 再看 origin，顺序不能换（见上面那条注释）
- (void)animationDidStart:(CAAnimation*)anim {
  if (![self.types containsObject:@"start"]) return;
  CAAnimation* origin = self.origin;
  if (origin == nil) return;
  [self.runtime emitEvent:@"start"
                     from:origin
                className:AnimationClassName(origin)
                     then:nil];
}

// finished 在动画对象上**读不出来**，所以必须带在事件上
- (void)animationDidStop:(CAAnimation*)anim finished:(BOOL)flag {
  if (![self.types containsObject:@"stop"]) return;
  CAAnimation* origin = self.origin;
  if (origin == nil) return;
  [self.runtime emitEvent:@"stop"
                     from:origin
                className:AnimationClassName(origin)
                     json:flag ? "true" : "false"];
}

@end

// CADisplayLink 的 trampoline（类声明在 NacreBridge.h，因为造对象的工厂
// 也要用）。每帧一次，所以这里尽量短：没订阅就直接返回，连 emit 都不进。
//
// 事件**带三个时间**，因为它们在下一轮读 link 上的属性已经是下一帧的值了
// ——「事件带不带数据」的判据就是「那个信息回头读不读得到」。
@implementation NacreDisplayLinkTarget
- (void)tick:(CADisplayLink*)sender {
  if (!self.subscribed) return;
  NacreRuntime* runtime = self.runtime;
  CADisplayLink* link = self.link;
  if (runtime == nil || link == nil) return;
  // 秒，和 ObjC 一致。底层跟原生走，上层的 rAF 将来再换毫秒
  NSString* json =
      [NSString stringWithFormat:@"{\"timestamp\":%.9f,\"duration\":%.9f,"
                                 @"\"targetTimestamp\":%.9f}",
                                 sender.timestamp, sender.duration,
                                 sender.targetTimestamp];
  [runtime emitEvent:@"tick"
                from:link
           className:"CADisplayLink"
                json:json.UTF8String];
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
  // 给运行时自己的：栈可能变了（用户点了返回、左滑返回）。JS 侧据此重建
  // 「导航控制器持有哪些页面」那条边。不带负载，JS 自己去读栈
  if ([self.types containsObject:@"@stack"]) {
    [self.runtime emitEvent:@"@stack"
                       from:navigationController
                  className:"UINavigationController"
                       then:nil];
  }
}

@end

// tab 控制器的 trampoline。只转一件事：用户点了某个 tab。
// 「能不能切过去」那个委托方法要同步返回 BOOL，不接。
@interface NacreTabDelegate : NSObject <UITabBarControllerDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreTabDelegate

- (void)tabBarController:(UITabBarController*)tabBarController
    didSelectViewController:(UIViewController*)viewController {
  if (![self.types containsObject:@"didselect"]) return;
  const char* payloadClass =
      [viewController isKindOfClass:UINavigationController.class] ? "UINavigationController"
      : [viewController isKindOfClass:UITabBarController.class]   ? "UITabBarController"
                                                                  : "UIViewController";
  [self.runtime emitEvent:@"didselect"
                     from:tabBarController
                className:"UITabBarController"
                     with:viewController
             payloadClass:payloadClass];
}

@end

// 模态页被关掉的 trampoline。delegate 挂在 presentationController 上，但
// 事件派发到**被呈现的那个 VC** 上——UIPresentationController 对 JS 没有别的
// 用处，暴露出来只为挂一个 delegate。
//
// 麻烦的一点：presentationController 要等到开始呈现才存在，所以 JS 在 present
// 之前订阅时装不上。办法是订阅状态记在 VC 上，present 的时候再装一次。
@interface NacrePresentationDelegate : NSObject <UIAdaptivePresentationControllerDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacrePresentationDelegate

- (void)emit:(NSString*)type from:(UIPresentationController*)pc {
  if (![self.types containsObject:type]) return;
  [self.runtime emitEvent:type
                     from:pc.presentedViewController
                className:"UIViewController"
                     then:nil];
}

- (void)presentationControllerWillDismiss:(UIPresentationController*)pc {
  [self emit:@"willdismiss" from:pc];
}
- (void)presentationControllerDidDismiss:(UIPresentationController*)pc {
  [self emit:@"diddismiss" from:pc];
  // 给运行时自己的：这一页被用户拖走了。JS 侧据此放开「呈现它的页面持有它」
  // 那条边
  [self emit:@"@dismissed" from:pc];
}
// 用户想关但被挡住了（isModalInPresentation 开着）
- (void)presentationControllerDidAttemptToDismiss:(UIPresentationController*)pc {
  [self emit:@"dismissattempted" from:pc];
}

@end

// 关联对象的 key：事件名 → NacreControlTarget
static const void* kNacreControlTargetsKey = &kNacreControlTargetsKey;
// 关联对象的 key：UIScrollView → NacreScrollDelegate。
// scrollView.delegate 是 weak，所以 trampoline 必须由关联对象来持有
static const void* kNacreScrollDelegateKey = &kNacreScrollDelegateKey;
// 本地存储变化通知的观察者
static const void* kNacreDefaultsObserverKey = &kNacreDefaultsObserverKey;
// 同理：navigationController.delegate 也是 weak
static const void* kNacreNavDelegateKey = &kNacreNavDelegateKey;
// 关联对象的 key：UITabBarController → NacreTabDelegate（delegate 属性是 weak）
static const void* kNacreTabDelegateKey = &kNacreTabDelegateKey;
// 关联对象的 key：CAAnimation → NacreAnimationDelegate。
// anim.delegate 是 **strong**（和别的几个相反），所以这个关联对象只是
// 为了取消订阅时找得回来，不是为了持有
static const void* kNacreAnimationDelegateKey = &kNacreAnimationDelegateKey;
// 关联对象的 key：UIViewController → NacrePresentationDelegate。
// 记在 VC 上而不是 presentationController 上，因为后者要等呈现时才存在
static const void* kNacrePresentationDelegateKey = &kNacrePresentationDelegateKey;

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
             body:(id)body
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
  // 请求体只认 Blob：字符串、ArrayBuffer、类型数组在 JS 侧都已经包成了 Blob。
  // NSData 不可变，直接交给请求，不用拷贝
  if (body != nil) {
    if (![body isKindOfClass:NacreBlob.class]) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->RejectCall(callId, "TypeError", "fetch body must be a Blob");
      });
      return 0;
    }
    req.HTTPBody = ((NacreBlob*)body).data;
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
                entry.responded = YES;
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
                if (!entry.responded) {
                  // 响应头都没到就结束了（连不上、超时、被取消）：拒绝 fetch
                  // 的那个 Promise。JS 那边没有建出 Response，不会有人来
                  // fetchRelease，所以记录在这里当场删掉。
                  if (error) [self rejectCall:callId withError:error];
                  [self->_fetchTasks removeObjectForKey:@(entry.requestId)];
                  return;
                }
                // 响应头到了之后才失败的：fetch 的 Promise 早已兑现，错误留在
                // 记录里，等读 body 时交出去
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

// Response 被回收了。读取期间 JS 侧拿着 Response（见 nacre.js 的 reading），
// 所以走到这里时不会有人在等这个 body
- (void)fetchRelease:(int)requestId {
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (!entry) return;
    // 还没下完就没人要了：停掉下载，不然它会在后台下完再整个扔掉
    if (!entry.completed) [entry.task cancel];
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
                             const std::string& json, std::string* error) {
      Guarded(name.c_str(), error, [&] {
        WriteNativeProperty((__bridge id)ptr, name, json, error);
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
        return ConstructNative(className, argsJSON, args);
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
    // WebSocket 的事件出口。那个文件不认识 NacreRuntime，所以在这里塞进去
    WebSocketSetEmitter(^(id task, NSString* type, NSString* json, NacreBlob* blob) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) return;
      if (blob != nil) {
        [strongSelf emitEvent:type
                         from:task
                    className:"WebSocket"
                         with:blob
                 payloadClass:"Blob"];
      } else if (json != nil) {
        [strongSelf emitEvent:type from:task className:"WebSocket" json:json.UTF8String];
      } else {
        [strongSelf emitEvent:type from:task className:"WebSocket" then:nil];
      }
    });
    // 网页的事件出口，同上
    WebViewSetEmitter(^(id contents, NSString* type, NSString* json) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) return;
      if (json != nil) {
        [strongSelf emitEvent:type
                         from:contents
                    className:"WebContents"
                         json:json.UTF8String];
      } else {
        [strongSelf emitEvent:type from:contents className:"WebContents" then:nil];
      }
    });
    // Session 的事件出口（cookie 变了）。同一个路子
    WebSessionSetEmitter(^(id session, NSString* type, NSString* json) {
      [weakSelf emitEvent:type from:session className:"Session" then:nil];
    });
    // 能被取消的那一个（will-navigate）：派发完把「取消了没有」交回去。
    // 走 postToJS，所以 answer 一定会被调到；引擎不在了就按没取消算
    WebViewSetAsker(^(id contents, NSString* type, NSString* json,
                      void (^answer)(BOOL prevented)) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf == nil) {
        answer(NO);
        return;
      }
      auto engine = strongSelf->_engine;
      std::string t = type.UTF8String;
      std::string payload = json.UTF8String ?: "null";
      [strongSelf postToJS:^{
        BOOL prevented = NO;
        if (*engine) {
          prevented = (*engine)->EmitObjectEventWithJSON(
              {NacreKeep(contents), "WebContents"}, t, payload);
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
      return [strongSelf fetchStart:url options:options body:(__bridge id)body callId:callId];
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
      return Guarded("new Blob", nullptr, [&] {
        return CreateBlob(partsJSON, buffers, type);
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

    WriteRuntimeLog([NSString stringWithFormat:@"V8 %s initialized in %.1f ms, context ready in %.1f ms",
                                               nacre::Engine::V8Version(), t1 - t0, t2 - t1]);
  }];

  // 2. 执行内置脚本，装上 EventTarget / Event / Application / application
  [self postToJS:^{
    if (!*engine) return;
    // 内置脚本在**运行时自己的包**里，不在 App 的包里：运行时做成了
    // framework，Builtin/parts/ 跟着它走
    NSBundle* runtimeBundle = [NSBundle bundleForClass:NacreRuntime.class];
    // 内置脚本拆成了 Builtin/parts/ 下的若干个 part，每个是一个函数表达式。
    // **顺序由文件名决定**（00-、01-…），所以这里必须排序：
    // URLsForResourcesWithExtension: 不保证顺序。
    NSArray<NSURL*>* parts =
        [[runtimeBundle URLsForResourcesWithExtension:@"js" subdirectory:@"Builtin/parts"]
            sortedArrayUsingComparator:^NSComparisonResult(NSURL* a, NSURL* b) {
              return [a.lastPathComponent compare:b.lastPathComponent];
            }];
    if (parts.count == 0) {
      WriteRuntimeLog(@"builtin scripts Builtin/parts/*.js are missing; "
                      @"the upper-layer API is unavailable");
      return;
    }
    double t0 = NowMs();
    for (NSURL* url in parts) {
      NSString* source = [NSString stringWithContentsOfURL:url
                                                  encoding:NSUTF8StringEncoding
                                                     error:nil];
      // 脚本名用 nacre:internal/ 前缀而不是文件路径：调用栈里一眼能看出是运行时
      // 内部，和 Node 的 node:internal/... 同样的做法
      NSString* name = [@"nacre:internal/parts/" stringByAppendingString:url.lastPathComponent];
      // 任何一个 part 失败都当致命错误并**点名是哪个文件**：后面的 part 会在一个
      // 半装好的状态上继续跑，错得更远也更难查
      if (!source || !(*engine)->RunBuiltinPart({name.UTF8String, source.UTF8String})) {
        (*engine)->FinishBuiltinParts();
        WriteRuntimeLog([NSString stringWithFormat:
            @"builtin script %@ failed; the upper-layer API is incomplete", name]);
        return;
      }
    }
    (*engine)->FinishBuiltinParts();
    WriteRuntimeLog([NSString stringWithFormat:@"builtin script ready in %.1f ms (%lu parts)",
                                               NowMs() - t0, (unsigned long)parts.count]);
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
  [self emitEvent:type from:control className:"UIControl" json:json.UTF8String];
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
    payloadClass:(const char*)payloadClass {
  auto engine = _engine;
  std::string t = type.UTF8String;
  std::string cls = className;
  std::string payloadCls = payloadClass;
  [self postToJS:^{
    if (*engine) {
      (*engine)->EmitObjectEventWith({NacreKeep(object), cls}, t,
                                     {NacreKeep(payload), payloadCls});
    }
  }];
}

// 带一个 JSON 值作为负载的事件。动画的 stop 要带 finished，而那个事实
// 在动画对象上**读不出来**——事件带不带数据的判据就是这个。
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             json:(const std::string&)json {
  auto engine = _engine;
  std::string t = type.UTF8String;
  std::string cls = className;
  std::string payload = json;
  [self postToJS:^{
    if (*engine) {
      (*engine)->EmitObjectEventWithJSON({NacreKeep(object), cls}, t, payload);
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
  if (pc != nil && pc.delegate != d) pc.delegate = d;
}

// 按对象订阅。JS 侧某个类型第一次有监听器时 on=YES，最后一个移走时 on=NO。
- (void)setSubscription:(id)object
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
             payloadClass:"UITraitCollection"];
    };
    if (TraitSetSubscription(object, @(type.c_str()), on, emit, error)) return;
  }
  [self routeSubscription:object type:type on:on error:error];
  // 各个类报「不认识这个事件名」时列的是自己那张表，里面没有 traitchange。
  // 这三类对象都多认它一个，所以在这里补到名单末尾
  if (error != nullptr && TraitObservable(object) &&
      error->find("expected one of:") != std::string::npos) {
    *error += " / traitchange";
  }
}

// 按对象的类分到各自的分支
- (void)routeSubscription:(id)object
                     type:(const std::string&)type
                       on:(BOOL)on
                    error:(std::string*)error {
  // 手势。域自己管 trampoline 和事件名表，这里只把事件出口塞给它
  {
    __weak NacreRuntime* weakSelf = self;
    NacreGestureEmit emit = ^(UIGestureRecognizer* recognizer, NSString* name,
                              NSString* json) {
      [weakSelf emitEvent:name
                     from:recognizer
                className:GestureClassName(recognizer)
                     json:json.UTF8String];
    };
    if (GestureSetSubscription(object, @(type.c_str()), on, emit, error)) return;
  }
  // 网页。事件原生一直在发，这里只校验名字
  if (WebContentsSetSubscription(object, @(type.c_str()), on, error)) return;
  // 剪贴板。同样只塞一个事件出口
  {
    __weak NacreRuntime* weakSelf = self;
    NacrePasteboardEmit emit = ^(UIPasteboard* pasteboard, NSString* name) {
      [weakSelf emitEvent:name from:pasteboard className:"UIPasteboard" then:nil];
    };
    if (PasteboardSetSubscription(object, @(type.c_str()), on, emit, error)) return;
  }
  if ([object isKindOfClass:NSUserDefaults.class]) {
    NSUserDefaults* defaults = (NSUserDefaults*)object;
    if (type != "change") {
      *error = [NSString stringWithFormat:
                    @"addEventListener: '%s' is not a storage event; expected: change",
                    type.c_str()].UTF8String;
      return;
    }
    NacreDefaultsObserver* observer =
        objc_getAssociatedObject(defaults, kNacreDefaultsObserverKey);
    if (on) {
      if (observer != nil) return;
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
    return;
  }
  if ([object isKindOfClass:UIBarButtonItem.class]) {
    UIBarButtonItem* item = (UIBarButtonItem*)object;
    NSString* name = @(type.c_str());
    if (!IsBarButtonEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForBarButtonEvent());
      return;
    }
    NSMutableDictionary<NSString*, NacreControlTarget*>* table =
        objc_getAssociatedObject(item, kNacreControlTargetsKey);
    if (table == nil) {
      table = [NSMutableDictionary dictionary];
      objc_setAssociatedObject(item, kNacreControlTargetsKey, table,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    if (on) {
      if (table[name] != nil) return;
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
    return;
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
      *error = EnumError(@"addEventListener", name, @"open / message / error / close");
    }
    return;
  }
  if ([object isKindOfClass:CADisplayLink.class]) {
    CADisplayLink* link = (CADisplayLink*)object;
    NSString* name = @(type.c_str());
    if (!IsDisplayLinkEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForDisplayLinkEvent());
      return;
    }
    // trampoline 是造对象时就挂上的，靠关联对象找回来
    // （CADisplayLink 没有公开的 target 属性）
    NacreDisplayLinkTarget* hop =
        objc_getAssociatedObject(link, kNacreDisplayLinkTargetKey);
    if (hop != nil) {
      hop.runtime = self;
      hop.subscribed = on;
    }
    return;
  }
  if ([object isKindOfClass:CAAnimation.class]) {
    CAAnimation* anim = (CAAnimation*)object;
    NSString* name = @(type.c_str());
    if (!IsAnimationEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForAnimationEvent());
      return;
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
    return;
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
      return;
    }
    if (![name isEqualToString:@"@dismissed"] && !IsPresentationEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForTabEvent());
      return;
    }
  }
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    NSString* name = @(type.c_str());
    // @ 开头的两个名字是运行时自己订的，不在对外的事件名表里。
    // @dismissed 是「被模态呈现的那一页」的事，导航控制器也可能被呈现，
    // 所以不在这里处理，往下落到模态那一支
    const BOOL internalStack = [name isEqualToString:@"@stack"];
    const BOOL internalDismissed = [name isEqualToString:@"@dismissed"];
    if (!internalStack && !internalDismissed && !IsNavEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForNavEvent());
      return;
    }
    NacreNavDelegate* d = objc_getAssociatedObject(nav, kNacreNavDelegateKey);
    if (internalDismissed) {
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
    if (!internalDismissed) return;
  }
  // 放在 UINavigationController 之后：它是 UIViewController 的子类，
  // 导航事件先认走，剩下的才轮到模态事件
  if ([object isKindOfClass:UIViewController.class]) {
    UIViewController* vc = (UIViewController*)object;
    NSString* name = @(type.c_str());
    if (![name isEqualToString:@"@dismissed"] && !IsPresentationEventName(name)) {
      *error = EnumError(@"addEventListener", name, NamesForPresentationEvent());
      return;
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
    [control addTarget:target action:@selector(fire:forEvent:) forControlEvents:bit];
  } else {
    NacreControlTarget* target = table[name];
    if (target == nil) return;
    [control removeTarget:target action:@selector(fire:forEvent:) forControlEvents:bit];
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
    if (*engine) (*engine)->SettleObject(callId, {NacreKeep(object), name});
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
