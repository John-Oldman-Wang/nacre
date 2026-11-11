// 路径的属性。UIBezierPath 只有一个可写的（填充规则），其余都是算出来的。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。
//
// 画线用的那几个属性（lineWidth / lineCapStyle / lineJoinStyle / miterLimit /
// flatness / setLineDash:）**故意不暴露**：它们只服务于 -fill / -stroke，
// 而那两个要当前 CGContext（= M2）。路径画在 CAShapeLayer 上时，生效的是
// 图层自己的同名属性，把路径上这一套也暴露出来等于摆两套设置、其中一套
// 永远不起作用。
#import "NacreBridge.h"

namespace nacre_bridge {

id ReadPathProperty(id object, NSString* key) {
  if (![object isKindOfClass:UIBezierPath.class]) return nil;
  UIBezierPath* path = (UIBezierPath*)object;
  if ([key isEqualToString:@"usesEvenOddFillRule"]) {
    return @(path.usesEvenOddFillRule);
  }
  if ([key isEqualToString:@"isEmpty"]) {
    return @(path.isEmpty);
  }
  if ([key isEqualToString:@"bounds"]) {
    return RectToJSON(path.bounds);
  }
  if ([key isEqualToString:@"currentPoint"]) {
    // 空路径时 UIKit 返回 CGPointZero，不抛
    return PointToJSON(path.currentPoint);
  }
  return nil;
}

BOOL WritePathProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:UIBezierPath.class]) return NO;
  UIBezierPath* path = (UIBezierPath*)object;
  if ([key isEqualToString:@"usesEvenOddFillRule"]) {
    path.usesEvenOddFillRule = [value boolValue];
    return YES;
  }
  return NO;
}

}  // namespace nacre_bridge
