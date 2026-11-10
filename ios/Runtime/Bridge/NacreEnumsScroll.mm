// UIScrollView：指示条、减速速率、事件名
//
// 字符串 ↔ 数值的映射。
//
// 名字 ↔ 数值只能放原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1、macOS 上是 2），JS 里按下标映射换个平台就全错。
// 宏在 NacreBridge.h 里，所以每个能力域可以单独成文件。
#import "NacreBridge.h"

namespace nacre_bridge {

NACRE_ENUM_MAP(IndicatorStyle, UIScrollViewIndicatorStyle,
               @"default": @(UIScrollViewIndicatorStyleDefault),
               @"black": @(UIScrollViewIndicatorStyleBlack),
               @"white": @(UIScrollViewIndicatorStyleWhite))

NACRE_ENUM_MAP(ContentInsetAdjustmentBehavior,
               UIScrollViewContentInsetAdjustmentBehavior,
               @"automatic": @(UIScrollViewContentInsetAdjustmentAutomatic),
               @"scrollableAxes": @(UIScrollViewContentInsetAdjustmentScrollableAxes),
               @"never": @(UIScrollViewContentInsetAdjustmentNever),
               @"always": @(UIScrollViewContentInsetAdjustmentAlways))

// decelerationRate：和 spacing 同一个套路，具名常量走字符串。区别是这两个
// 值不是哨兵而是真实的速率，所以读出来优先给名字、对不上就给数字。
static NSArray<NSArray*>* DecelerationRatePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"normal", @(UIScrollViewDecelerationRateNormal) ],
      @[ @"fast", @(UIScrollViewDecelerationRateFast) ],
    ];
  });
  return pairs;
}

BOOL DecelerationRateFromValue(id value, CGFloat* out) {
  if ([value isKindOfClass:NSString.class]) {
    for (NSArray* pair in DecelerationRatePairs()) {
      if ([pair[0] isEqualToString:value]) {
        *out = [pair[1] doubleValue];
        return YES;
      }
    }
    return NO;
  }
  if (![value isKindOfClass:NSNumber.class]) return NO;
  *out = [value doubleValue];
  return YES;
}

id ValueForDecelerationRate(CGFloat rate) {
  for (NSArray* pair in DecelerationRatePairs()) {
    if ([pair[1] doubleValue] == rate) return pair[0];
  }
  return @(rate);
}

NSString* NamesForDecelerationRate(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in DecelerationRatePairs()) {
    [names addObject:[NSString stringWithFormat:@"\"%@\"", pair[0]]];
  }
  return [@"a number / " stringByAppendingString:
             [names componentsJoinedByString:@" / "]];
}

// UIScrollView 的事件名。纯通知那一类，一个对一个 delegate 方法：
//   scroll                     ← scrollViewDidScroll:
//   dragbegin / dragend        ← scrollViewWillBeginDragging: / DidEndDragging:
//   deceleratebegin / end      ← WillBeginDecelerating: / DidEndDecelerating:
//   scrollanimationend         ← scrollViewDidEndScrollingAnimation:
//   scrolltotop                ← scrollViewDidScrollToTop:
//   adjustedcontentinsetchange ← scrollViewDidChangeAdjustedContentInset:
static NSArray<NSString*>* ScrollEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[ @"scroll", @"dragbegin", @"dragend", @"deceleratebegin",
               @"decelerateend", @"scrollanimationend", @"scrolltotop",
               @"adjustedcontentinsetchange" ];
  });
  return names;
}

BOOL IsScrollEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [ScrollEventNamesList() containsObject:name];
}

NSString* NamesForScrollEvent(void) {
  return [ScrollEventNamesList() componentsJoinedByString:@" / "];
}

}  // namespace nacre_bridge
