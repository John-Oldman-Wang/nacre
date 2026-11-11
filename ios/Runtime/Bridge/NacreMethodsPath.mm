// 路径这个域在方法通道上的分支。
//
// 一个域一个文件、装它在所有通道上的分支，每个入口返回「认不认领」。
//
// 角度的单位是**弧度**，和 Core Graphics 一致，我们不替 JS 换算。
// 要注意 UIKit 的 y 轴朝下，所以 0 弧度在正右方、角度增大是**顺时针**转，
// 和数学课上的方向相反；clockwise:YES 画的就是这个方向。
#import "NacreBridge.h"

namespace nacre_bridge {

bool PathCallMethod(id object, NSString* sel, const NacreArgs& args,
                    std::string* out, std::string* error) {
  if (![object isKindOfClass:UIBezierPath.class]) return false;
  UIBezierPath* path = (UIBezierPath*)object;

  if ([sel isEqualToString:@"moveToPoint:"]) {
    [path moveToPoint:JSONToPoint(args.value(0))];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"addLineToPoint:"]) {
    [path addLineToPoint:JSONToPoint(args.value(0))];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"addCurveToPoint:controlPoint1:controlPoint2:"]) {
    [path addCurveToPoint:JSONToPoint(args.value(0))
            controlPoint1:JSONToPoint(args.value(1))
            controlPoint2:JSONToPoint(args.value(2))];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"addQuadCurveToPoint:controlPoint:"]) {
    [path addQuadCurveToPoint:JSONToPoint(args.value(0))
                 controlPoint:JSONToPoint(args.value(1))];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"addArcWithCenter:radius:startAngle:endAngle:clockwise:"]) {
    [path addArcWithCenter:JSONToPoint(args.value(0))
                    radius:[args.value(1) doubleValue]
                startAngle:[args.value(2) doubleValue]
                  endAngle:[args.value(3) doubleValue]
                 clockwise:[args.value(4) boolValue]];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"closePath"]) {
    [path closePath];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeAllPoints"]) {
    [path removeAllPoints];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"appendPath:"]) {
    id other = args.object(0);
    if (![other isKindOfClass:UIBezierPath.class]) {
      *error = "appendPath: expects a UIBezierPath";
      *out = "null";
      return true;
    }
    // 追加的是另一条路径的副本，之后改它不会影响这一条
    [path appendPath:(UIBezierPath*)other];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"applyTransform:"]) {
    // 就地改这条路径，不返回新的
    [path applyTransform:JSONToTransform(args.value(0))];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"containsPoint:"]) {
    // 只看**填充区域**，描边不算。开口路径按闭合之后算
    *out = EncodeJSON(@([path containsPoint:JSONToPoint(args.value(0))]));
    return true;
  }
  return false;
}

bool PathCallObjectMethod(id object, const std::string& name, const NacreArgs& args,
                          nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:UIBezierPath.class]) return false;
  UIBezierPath* path = (UIBezierPath*)object;
  if (name == "bezierPathByReversingPath") {
    // 新建一条，原路径不动。方向影响的是 nonZero 填充规则下的绕向
    *out = {(__bridge void*)[path bezierPathByReversingPath], "UIBezierPath"};
    return true;
  }
  return false;
}

}  // namespace nacre_bridge
