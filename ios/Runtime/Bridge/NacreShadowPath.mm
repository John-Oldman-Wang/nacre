// 一个域：图层的 shadowPath。阴影照这条路径的形状画，系统不再从图层的内容
// 算形状。
//
// 设了阴影、又不给 shadowPath，系统每一帧都要从图层（和它的子图层）的不透明
// 像素里算一遍阴影的形状，列表里一屏几十张卡片滚起来就是这一处在花时间。
// 给一条和卡片一样的圆角矩形，这一步就省掉了。
//
// 写法和 CAShapeLayer.path 一样（那个在核心的 NacrePropsLayer.mm 里）：原生存的
// 是 CGPath，读回来现包一个新的 UIBezierPath；JS 那一侧记着写进去的那个对象，
// 优先还它。CGPath 是不可变的，所以存进去的是副本：写进去之后再改那条
// UIBezierPath，阴影不跟着变。
#import "NacreBridge.h"

namespace nacre_bridge {

static nacre::NativeObjectRef ReadShadowPathObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:CALayer.class]) return {};
  if (name == "shadowPath") {
    CGPathRef path = ((CALayer*)object).shadowPath;
    if (path == NULL) return {nullptr, "UIBezierPath"};
    return {NacreKeep([UIBezierPath bezierPathWithCGPath:path]), "UIBezierPath"};
  }
  return {};
}

static bool WriteShadowPathObjectProperty(id object, const std::string& name, id value,
                                          std::string* error) {
  if (![object isKindOfClass:CALayer.class]) return false;
  if (name == "shadowPath") {
    if (value != nil && ![value isKindOfClass:UIBezierPath.class]) {
      ObjectTypeError(name, "UIBezierPath", true, error);
      return true;
    }
    ((CALayer*)object).shadowPath = ((UIBezierPath*)value).CGPath;
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreShadowPathDomain : NSObject
@end
@implementation NacreShadowPathDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "shadow-path";
  d.classes = {CALayer.class};
  d.readObject = nacre_bridge::ReadShadowPathObjectProperty;
  d.writeObject = nacre_bridge::WriteShadowPathObjectProperty;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
