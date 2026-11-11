// 动画域的枚举：填充模式、时间曲线的名字、动画的事件名。
//
// 两个都是 NSString 常量（kCAFillModeForwards、kCAMediaTimingFunctionEaseIn），
// 不是 NS_ENUM，所以和 cornerCurve 那几个一样手写有序 pairs。
// **这已经是第六、七套同形状的代码了**，该抽宏——但 check-api.sh 的正则是
// 按这个形状找的，抽宏要连脚本一起改，那是独立的一步。
#import "NacreBridge.h"

namespace nacre_bridge {

// 动画跑完（或者还没开始）的时候，被动画的属性显示成什么。
// 默认是 removed：动画一结束就摘掉，属性弹回模型值——**这是最常被
// 当成 bug 的行为**，正确的做法是同时把模型值也设过去。
static NSArray<NSArray*>* FillModePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"removed", kCAFillModeRemoved ],
      @[ @"forwards", kCAFillModeForwards ],
      @[ @"backwards", kCAFillModeBackwards ],
      @[ @"both", kCAFillModeBoth ],
    ];
  });
  return pairs;
}

NSString* FillModeFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in FillModePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForFillMode(NSString* mode) {
  for (NSArray* pair in FillModePairs()) {
    if ([pair[1] isEqualToString:mode]) return pair[0];
  }
  return nil;
}

NSString* NamesForFillMode(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in FillModePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// 五个内置的时间曲线。default 和 easeInEaseOut 不是一回事：
// default 的控制点是 (0.25, 0.1) (0.25, 1)，easeInEaseOut 是 (0.42, 0) (0.58, 1)。
static NSArray<NSArray*>* TimingFunctionNamePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"linear", kCAMediaTimingFunctionLinear ],
      @[ @"easeIn", kCAMediaTimingFunctionEaseIn ],
      @[ @"easeOut", kCAMediaTimingFunctionEaseOut ],
      @[ @"easeInEaseOut", kCAMediaTimingFunctionEaseInEaseOut ],
      @[ @"default", kCAMediaTimingFunctionDefault ],
    ];
  });
  return pairs;
}

NSString* TimingFunctionNameFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in TimingFunctionNamePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NamesForTimingFunctionName(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in TimingFunctionNamePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// 动画自己的两个事件。来自 CAAnimationDelegate，走 trampoline，不需要 M2。
static NSArray<NSString*>* AnimationEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ names = @[ @"start", @"stop" ]; });
  return names;
}

BOOL IsAnimationEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [AnimationEventNamesList() containsObject:name];
}

NSString* NamesForAnimationEvent(void) {
  return [AnimationEventNamesList() componentsJoinedByString:@" / "];
}

}  // namespace nacre_bridge
