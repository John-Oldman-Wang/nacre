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

// 关键帧之间怎么插值。
//
// paced 和 cubicPaced 会**忽略 keyTimes 和 timingFunctions**，自己按
// 路程均匀分配——沿路径走位要匀速就用它。discrete 是不插值，到点直接跳。
NACRE_STRING_ENUM_MAP(CalculationMode,
                      @[ @"linear", kCAAnimationLinear ],
                      @[ @"discrete", kCAAnimationDiscrete ],
                      @[ @"paced", kCAAnimationPaced ],
                      @[ @"cubic", kCAAnimationCubic ],
                      @[ @"cubicPaced", kCAAnimationCubicPaced ])

// 沿路径走的时候要不要跟着路径的切线转。
// **只在给了 path 时有意义**（头文件原话：没有 path 时设非 nil 的效果未定义）。
// autoReverse 是切线方向再转 180°。
NACRE_STRING_ENUM_MAP(RotationMode,
                      @[ @"auto", kCAAnimationRotateAuto ],
                      @[ @"autoReverse", kCAAnimationRotateAutoReverse ])

// run loop 的模式。CADisplayLink 要挂到某个模式上才会开始发。
//
// **default 和 common 的区别是滚动时还跑不跑**——这是 display link 最常见
// 的坑。滚动期间主 run loop 切到 tracking 模式，只挂 default 的源就停了。
NACRE_STRING_ENUM_MAP(RunLoopMode,
                      @[ @"default", NSDefaultRunLoopMode ],
                      @[ @"common", NSRunLoopCommonModes ],
                      @[ @"tracking", UITrackingRunLoopMode ])

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

// CADisplayLink 只有一个事件。单独一张表，因为订阅通道按类分流
BOOL IsDisplayLinkEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] && [name isEqualToString:@"tick"];
}

NSString* NamesForDisplayLinkEvent(void) { return @"tick"; }

}  // namespace nacre_bridge
