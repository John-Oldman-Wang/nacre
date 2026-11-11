// CALayer：圆角的掩码和曲线、渐变的类型、CAShapeLayer 的三个枚举
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

// ---- CAShapeLayer ----
// 三个都是 NSString 常量，所以照 cornerCurve 那套手写有序 pairs。
// 名字按已定规则取（去掉类型前缀、首字母小写），**不照抄常量的值**——
// kCAFillRuleNonZero 的值其实是 @"non-zero"，那是桥的实现细节。

// 填充规则。nonZero 是默认：射线穿过路径时按绕向加减，不为零就填。
// evenOdd 数穿过次数，奇数填——两者只在路径自交或嵌套时不一样
static NSArray<NSArray*>* FillRulePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"nonZero", kCAFillRuleNonZero ],
      @[ @"evenOdd", kCAFillRuleEvenOdd ],
    ];
  });
  return pairs;
}

NSString* FillRuleFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in FillRulePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForFillRule(NSString* rule) {
  for (NSArray* pair in FillRulePairs()) {
    if ([pair[1] isEqualToString:rule]) return pair[0];
  }
  return nil;
}

NSString* NamesForFillRule(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in FillRulePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// 线头。butt 是齐根切断（默认），round 加半圆，square 加半个方块——
// 后两种都会让线比路径长出半个线宽
static NSArray<NSArray*>* LineCapPairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"butt", kCALineCapButt ],
      @[ @"round", kCALineCapRound ],
      @[ @"square", kCALineCapSquare ],
    ];
  });
  return pairs;
}

NSString* LineCapFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in LineCapPairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForLineCap(NSString* cap) {
  for (NSArray* pair in LineCapPairs()) {
    if ([pair[1] isEqualToString:cap]) return pair[0];
  }
  return nil;
}

NSString* NamesForLineCap(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in LineCapPairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// 拐角。miter 是尖角（默认，太尖时按 miterLimit 削平成 bevel），
// round 是圆角，bevel 直接削平
static NSArray<NSArray*>* LineJoinPairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"miter", kCALineJoinMiter ],
      @[ @"round", kCALineJoinRound ],
      @[ @"bevel", kCALineJoinBevel ],
    ];
  });
  return pairs;
}

NSString* LineJoinFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in LineJoinPairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForLineJoin(NSString* join) {
  for (NSArray* pair in LineJoinPairs()) {
    if ([pair[1] isEqualToString:join]) return pair[0];
  }
  return nil;
}

NSString* NamesForLineJoin(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in LineJoinPairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

}  // namespace nacre_bridge
