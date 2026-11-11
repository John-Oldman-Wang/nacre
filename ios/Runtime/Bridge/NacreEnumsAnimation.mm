// 动画域的枚举：填充模式、时间曲线的名字、动画的事件名。
//
// 两个都是 NSString 常量（kCAFillModeForwards、kCAMediaTimingFunctionEaseIn），
// 不是 NS_ENUM，所以走 NACRE_STRING_ENUM_MAP 而不是 NACRE_ENUM_MAP。
#import "NacreBridge.h"

namespace nacre_bridge {

// 动画跑完（或者还没开始）的时候，被动画的属性显示成什么。
// 默认是 removed：动画一结束就摘掉，属性弹回模型值——**这是最常被
// 当成 bug 的行为**，正确的做法是同时把模型值也设过去。
NACRE_STRING_ENUM_MAP(FillMode,
                      @[ @"removed", kCAFillModeRemoved ],
                      @[ @"forwards", kCAFillModeForwards ],
                      @[ @"backwards", kCAFillModeBackwards ],
                      @[ @"both", kCAFillModeBoth ])

// 五个内置的时间曲线。default 和 easeInEaseOut 不是一回事：
// default 的控制点是 (0.25, 0.1) (0.25, 1)，easeInEaseOut 是 (0.42, 0) (0.58, 1)。
NACRE_STRING_ENUM_MAP(TimingFunctionName,
                      @[ @"linear", kCAMediaTimingFunctionLinear ],
                      @[ @"easeIn", kCAMediaTimingFunctionEaseIn ],
                      @[ @"easeOut", kCAMediaTimingFunctionEaseOut ],
                      @[ @"easeInEaseOut", kCAMediaTimingFunctionEaseInEaseOut ],
                      @[ @"default", kCAMediaTimingFunctionDefault ])

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
