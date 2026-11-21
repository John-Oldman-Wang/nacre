// 事件的中转对象：系统的回调（target-action、委托方法、通知）先到这些小对象
// 上，它们只做一件事——转给 NacreRuntime 去派发成 JS 的事件。
//
// 它们都只记一个回运行时的弱引用，不持有任何 JS 函数。从 NacreRuntime.mm
// 里搬出来的（2026-11-17），内容没有改。建它们、挂到原生对象上的代码还在
// NacreRuntime.mm 的订阅那一段里。
#import "NacreRuntimeInternal.h"

#import <objc/runtime.h>

#include "Bridge/NacreBridge.h"

using namespace nacre_bridge;

// 控件事件的中转。
//
// control 通过关联对象持有它（`addTarget:action:` 自己**不**持有 target，
// 头文件原话 "the target is not retained"），它只记一个事件名和一个回
// 运行时的弱引用——**不持有任何 JS 函数**。派发时拿原生指针查包装，再走
// 包装自己的 dispatchEvent。于是回调的生命周期问题就只剩「包装活不活」，
// 而那个所有权镜像已经解决了。

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
// 手指离开的那一刻系统当场问「停在哪」，带着松手时的速度（pt/ms）和它算出来的
// 停点。当场派发 beforedragend，事件上的 targetContentOffset 可写，监听器改成
// 什么就停在哪。没人听、监听器没改或者改成了不是点的东西，照系统的
- (void)scrollViewWillEndDragging:(UIScrollView*)scrollView
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint*)targetContentOffset {
  if (![self.types containsObject:@"beforedragend"]) return;
  NSDictionary* payload = @{
    @"velocity": @{@"x": @(velocity.x), @"y": @(velocity.y)},
    @"targetContentOffset": @{@"x": @(targetContentOffset->x), @"y": @(targetContentOffset->y)},
  };
  NSData* data = [NSJSONSerialization dataWithJSONObject:payload options:0 error:nil];
  NSString* json = data != nil ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] : nil;
  NSString* answer = nacre_bridge::NacreEmitEventForAnswer(scrollView, "UIScrollView",
                                                           @"beforedragend", json,
                                                           @"targetContentOffset");
  if (answer == nil) return;
  id point = [NSJSONSerialization JSONObjectWithData:[answer dataUsingEncoding:NSUTF8StringEncoding]
                                             options:0 error:nil];
  if (![point isKindOfClass:NSDictionary.class]) return;
  id x = point[@"x"];
  id y = point[@"y"];
  if (![x isKindOfClass:NSNumber.class] || ![y isKindOfClass:NSNumber.class]) return;
  const double px = [x doubleValue];
  const double py = [y doubleValue];
  if (!isfinite(px) || !isfinite(py)) return;
  *targetContentOffset = CGPointMake(px, py);
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
  [self emit:@"beforeshow" from:navigationController with:viewController];
}

- (void)navigationController:(UINavigationController*)navigationController
       didShowViewController:(UIViewController*)viewController
                    animated:(BOOL)animated {
  [self emit:@"show" from:navigationController with:viewController];
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

@implementation NacreTabDelegate

- (void)tabBarController:(UITabBarController*)tabBarController
    didSelectViewController:(UIViewController*)viewController {
  if (![self.types containsObject:@"tabselect"]) return;
  const char* payloadClass =
      [viewController isKindOfClass:UINavigationController.class] ? "UINavigationController"
      : [viewController isKindOfClass:UITabBarController.class]   ? "UITabBarController"
                                                                  : "UIViewController";
  [self.runtime emitEvent:@"tabselect"
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

@implementation NacrePresentationDelegate

- (void)emit:(NSString*)type from:(UIPresentationController*)pc {
  if (![self.types containsObject:type]) return;
  [self.runtime emitEvent:type
                     from:pc.presentedViewController
                className:"UIViewController"
                     then:nil];
}

- (void)presentationControllerWillDismiss:(UIPresentationController*)pc {
  [self emit:@"beforedismiss" from:pc];
}
- (void)presentationControllerDidDismiss:(UIPresentationController*)pc {
  [self emit:@"dismiss" from:pc];
  // 给运行时自己的：这一页被用户拖走了。JS 侧据此放开「呈现它的页面持有它」
  // 那条边
  [self emit:@"@dismissed" from:pc];
}
// 用户想关但被挡住了（isModalInPresentation 开着）
- (void)presentationControllerDidAttemptToDismiss:(UIPresentationController*)pc {
  [self emit:@"dismissattempt" from:pc];
}

@end

// 关联对象的 key：事件名 → NacreControlTarget
const void* kNacreControlTargetsKey = &kNacreControlTargetsKey;
// 关联对象的 key：UIScrollView → NacreScrollDelegate。
// scrollView.delegate 是 weak，所以 trampoline 必须由关联对象来持有
const void* kNacreScrollDelegateKey = &kNacreScrollDelegateKey;
// 本地存储变化通知的观察者
const void* kNacreDefaultsObserverKey = &kNacreDefaultsObserverKey;
// 同理：navigationController.delegate 也是 weak
const void* kNacreNavDelegateKey = &kNacreNavDelegateKey;
// 关联对象的 key：UITabBarController → NacreTabDelegate（delegate 属性是 weak）
const void* kNacreTabDelegateKey = &kNacreTabDelegateKey;
// 关联对象的 key：CAAnimation → NacreAnimationDelegate。
// anim.delegate 是 **strong**（和别的几个相反），所以这个关联对象只是
// 为了取消订阅时找得回来，不是为了持有
const void* kNacreAnimationDelegateKey = &kNacreAnimationDelegateKey;
// 关联对象的 key：UIViewController → NacrePresentationDelegate。
// 记在 VC 上而不是 presentationController 上，因为后者要等呈现时才存在
const void* kNacrePresentationDelegateKey = &kNacrePresentationDelegateKey;
