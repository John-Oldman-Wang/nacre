// CALayer：圆角的掩码和曲线、渐变的类型
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

// 渐变的类型。同样是 NSString 常量（kCAGradientLayerAxial…），所以和
// cornerCurve 一样手写有序 pairs：NACRE_ENUM_MAP 的值必须是数字。
//
// axial 是一条直线上的渐变（最常见的那种），radial 从中心向外，
// conic 绕中心转一圈。startPoint / endPoint 在三种里的含义不一样，
// 见 docs/api/ca-layer.md。
static NSArray<NSArray*>* GradientTypePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"axial", kCAGradientLayerAxial ],
      @[ @"radial", kCAGradientLayerRadial ],
      @[ @"conic", kCAGradientLayerConic ],
    ];
  });
  return pairs;
}

NSString* GradientTypeFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in GradientTypePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForGradientType(NSString* type) {
  for (NSArray* pair in GradientTypePairs()) {
    if ([pair[1] isEqualToString:type]) return pair[0];
  }
  return nil;
}

NSString* NamesForGradientType(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in GradientTypePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

}  // namespace nacre_bridge
