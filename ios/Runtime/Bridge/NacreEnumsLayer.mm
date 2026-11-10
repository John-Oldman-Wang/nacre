// CALayer：圆角的掩码和曲线
//
// 字符串 ↔ 数值的映射。
//
// 名字 ↔ 数值只能放原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1、macOS 上是 2），JS 里按下标映射换个平台就全错。
// 宏在 NacreBridge.h 里，所以每个能力域可以单独成文件。
#import "NacreBridge.h"

namespace nacre_bridge {

// 哪几个角要圆。名字是 ObjC 常量去掉 kCALayer 前缀和 Corner 后缀。
// UIKit 的 y 轴朝下，所以 MinY 是上边：minXMinY 就是左上角。
NACRE_MASK_MAP(CornerMask, CACornerMask,
               @"minXMinY": @(kCALayerMinXMinYCorner),
               @"maxXMinY": @(kCALayerMaxXMinYCorner),
               @"minXMaxY": @(kCALayerMinXMaxYCorner),
               @"maxXMaxY": @(kCALayerMaxXMaxYCorner))

// 圆角的曲线。continuous 是 Apple 自己在用的那种「超椭圆」圆角，
// 比正圆弧过渡得更顺——图标、卡片都是它。
static NSArray<NSArray*>* CornerCurvePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"circular", kCACornerCurveCircular ],
      @[ @"continuous", kCACornerCurveContinuous ],
    ];
  });
  return pairs;
}

NSString* CornerCurveFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in CornerCurvePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForCornerCurve(NSString* curve) {
  for (NSArray* pair in CornerCurvePairs()) {
    if ([pair[1] isEqualToString:curve]) return pair[0];
  }
  return nil;
}

NSString* NamesForCornerCurve(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in CornerCurvePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

}  // namespace nacre_bridge
