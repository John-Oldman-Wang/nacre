// UIView 的动画：animateWithDuration… 和 performWithoutAnimation。
//
// 这两个接口收一个 block，**在调用里面就执行它**——UIKit 在 block 前后各记
// 一次属性的值，差别就是要动画的东西。所以那段 JS 必须当场跑完，延后一轮
// 就什么动画都没有了。这是同步回调（M1b）里「当场执行的一段代码」那一类，
// 也是「JS 调原生、原生回头调 JS」（嵌套）的第一个使用者。
//
// JS 的函数过不了桥：JS 侧把它登记成一个号（callWithBlock），原生在 block
// 里按号调回去（NacreCallBlock）。动画结束的通知不用等答案，延后一轮调
// （NacreCallBlockLater），JS 侧拿它兑现 Promise。
//
// 这个域是登记进来的（文件末尾的 +load）。

#import "NacreBridge.h"

namespace nacre_bridge {

// 选项。头文件里它是一个 NS_OPTIONS，但曲线那四个不是单独的位（占 16–19 位
// 的一个数），所以这里只用「名字 → 数值、按位或起来」这一半，不反查。
// 转场那一组（transition…）是 transitionWithView: 用的，没接。
// d.ts 里的联合类型和它同名，check-api.sh 会自动核对取值
NACRE_MASK_MAP(ViewAnimationOptions, UIViewAnimationOptions,
               @"layoutSubviews": @(UIViewAnimationOptionLayoutSubviews),
               @"allowUserInteraction": @(UIViewAnimationOptionAllowUserInteraction),
               @"beginFromCurrentState": @(UIViewAnimationOptionBeginFromCurrentState),
               @"repeat": @(UIViewAnimationOptionRepeat),
               @"autoreverse": @(UIViewAnimationOptionAutoreverse),
               @"overrideInheritedDuration": @(UIViewAnimationOptionOverrideInheritedDuration),
               @"overrideInheritedCurve": @(UIViewAnimationOptionOverrideInheritedCurve),
               @"allowAnimatedContent": @(UIViewAnimationOptionAllowAnimatedContent),
               @"overrideInheritedOptions": @(UIViewAnimationOptionOverrideInheritedOptions),
               @"curveEaseInOut": @(UIViewAnimationOptionCurveEaseInOut),
               @"curveEaseIn": @(UIViewAnimationOptionCurveEaseIn),
               @"curveEaseOut": @(UIViewAnimationOptionCurveEaseOut),
               @"curveLinear": @(UIViewAnimationOptionCurveLinear))

static bool ViewAnimationClassCall(const std::string& className, NSString* sel,
                                   const NacreArgs& args, std::string* out,
                                   std::string* error) {
  if (className != "UIView") return false;

  // [block]
  if ([sel isEqualToString:@"performWithoutAnimation:"]) {
    const NSInteger block = NACRE_INT(args.value(0), @"performWithoutAnimation");
    [UIView performWithoutAnimation:^{
      NacreCallBlock(block, @"[]");
    }];
    *out = "null";
    return true;
  }

  // [duration, delay, options, animations, completion]
  // [duration, delay, damping, velocity, options, animations, completion]
  const BOOL plain =
      [sel isEqualToString:@"animateWithDuration:delay:options:animations:completion:"];
  const BOOL spring = [sel isEqualToString:
      @"animateWithDuration:delay:usingSpringWithDamping:initialSpringVelocity:options:"
      @"animations:completion:"];
  if (!plain && !spring) return false;

  const NSTimeInterval duration = NACRE_NUM(args.value(0), @"duration");
  const NSTimeInterval delay = NACRE_NUM(args.value(1), @"delay");
  CGFloat damping = 0;
  CGFloat velocity = 0;
  NSUInteger next = 2;
  if (spring) {
    damping = NACRE_NUM(args.value(2), @"usingSpringWithDamping");
    velocity = NACRE_NUM(args.value(3), @"initialSpringVelocity");
    next = 4;
  }
  UIViewAnimationOptions options = 0;
  id bad = nil;
  if (!ViewAnimationOptionsFromNames(args.value(next), &options, &bad)) {
    *error = bad != nil
                 ? EnumError(@"options", bad, NamesForViewAnimationOptions())
                 : [NSString stringWithFormat:
                       @"options needs an array of option names; expected any of: %@",
                       NamesForViewAnimationOptions()].UTF8String;
    return true;
  }
  const NSInteger animations = NACRE_INT(args.value(next + 1), @"animations");
  const NSInteger completion = NACRE_INT(args.value(next + 2), @"completion");

  void (^run)(void) = ^{
    NacreCallBlock(animations, @"[]");
  };
  // 结束的通知延后一轮：系统不等答案。finished 回头读不到，所以带过去
  void (^done)(BOOL) = ^(BOOL finished) {
    NacreCallBlockLater(completion, finished ? @"[true]" : @"[false]");
  };
  if (spring) {
    [UIView animateWithDuration:duration
                          delay:delay
         usingSpringWithDamping:damping
          initialSpringVelocity:velocity
                        options:options
                     animations:run
                     completion:done];
  } else {
    [UIView animateWithDuration:duration
                          delay:delay
                        options:options
                     animations:run
                     completion:done];
  }
  *out = "null";
  return true;
}

}  // namespace nacre_bridge

@interface NacreViewAnimationDomain : NSObject
@end
@implementation NacreViewAnimationDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "view-animation";
  d.classCall = nacre_bridge::ViewAnimationClassCall;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
