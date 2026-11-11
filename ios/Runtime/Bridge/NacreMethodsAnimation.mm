// 动画这个域在方法通道上的分支：图层上挂动画、时间曲线的控制点、
// 以及 CATransaction 的类方法。
//
// 一个域一个文件、装它在所有通道上的分支，每个入口返回「认不认领」。
#import "NacreBridge.h"

namespace nacre_bridge {

const char* AnimationClassName(CAAnimation* anim) {
  if ([anim isKindOfClass:CABasicAnimation.class]) return "CABasicAnimation";
  if ([anim isKindOfClass:CAPropertyAnimation.class]) return "CAPropertyAnimation";
  return "CAAnimation";
}

bool AnimationCallMethod(id object, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error) {
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if ([sel isEqualToString:@"addAnimation:forKey:"]) {
      id anim = args.object(0);
      if (![anim isKindOfClass:CAAnimation.class]) {
        *error = "addAnimation: expects a CAAnimation";
        *out = "null";
        return true;
      }
      id key = args.value(1);
      // **这里会拷贝一份动画。** 加完再改原来那个对象不会有任何效果，
      // 和 CAShapeLayer.path 是同一类事实。见 docs/api/ca-animation.md
      [layer addAnimation:(CAAnimation*)anim
                   forKey:[key isKindOfClass:NSString.class] ? key : nil];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"removeAllAnimations"]) {
      [layer removeAllAnimations];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"removeAnimationForKey:"]) {
      id key = args.value(0);
      if ([key isKindOfClass:NSString.class]) [layer removeAnimationForKey:key];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"animationKeys"]) {
      // nil 和空数组在这里不用分：没有动画时 JS 拿到 [] 就够了
      *out = EncodeJSON(layer.animationKeys ?: @[]);
      return true;
    }
  }
  if ([object isKindOfClass:CAMediaTimingFunction.class]) {
    if ([sel isEqualToString:@"controlPointAtIndex:"]) {
      // ObjC 是出参（float[2]），这里改成返回一个 CGPoint——
      // 「出参可以改成返回值」是已定的映射规则
      NSUInteger index = [args.value(0) unsignedIntegerValue];
      if (index > 3) {
        *error = "controlPointAtIndex: index must be 0…3";
        *out = "null";
        return true;
      }
      float values[2] = {0, 0};
      [(CAMediaTimingFunction*)object getControlPointAtIndex:index values:values];
      *out = EncodeJSON(PointToJSON(CGPointMake(values[0], values[1])));
      return true;
    }
  }
  return false;
}

bool AnimationCallObjectMethod(id object, const std::string& name, const NacreArgs& args,
                               nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:CALayer.class]) return false;
  if (name != "animationForKey:") return false;
  id key = args.value(0);
  if (![key isKindOfClass:NSString.class]) {
    *out = {nullptr, "CAAnimation"};
    return true;
  }
  CAAnimation* anim = [(CALayer*)object animationForKey:key];
  // 注意这给的是**图层持有的那份拷贝**，不是 JS 当初建的那个对象。
  // 头文件原话：改它的任何属性都是未定义行为
  if (anim == nil) {
    *out = {nullptr, "CAAnimation"};
    return true;
  }
  *out = {(__bridge void*)anim, AnimationClassName(anim)};
  return true;
}

// CATransaction 全是类方法。它管的是**隐式动画**：在 UIKit 的动画块外面
// 改独立子图层的属性，CA 默认会给一个 0.25 秒的动画，setDisableActions
// 是关掉它的唯一办法。
bool TransactionCallClassMethod(const std::string& className, NSString* sel,
                                const NacreArgs& args, std::string* out,
                                std::string* error) {
  if (className != "CATransaction") return false;
  if ([sel isEqualToString:@"begin"]) {
    [CATransaction begin];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"commit"]) {
    @try {
      [CATransaction commit];
    } @catch (NSException* e) {
      // 没 begin 就 commit，CA 会抛。错误来自调用方，接住变成 TypeError
      *error = [NSString stringWithFormat:@"CATransaction.commit: %@", e.reason].UTF8String;
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"flush"]) {
    [CATransaction flush];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"disableActions"]) {
    *out = EncodeJSON(@([CATransaction disableActions]));
    return true;
  }
  if ([sel isEqualToString:@"setDisableActions:"]) {
    [CATransaction setDisableActions:[args.value(0) boolValue]];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"animationDuration"]) {
    *out = EncodeJSON(@([CATransaction animationDuration]));
    return true;
  }
  if ([sel isEqualToString:@"setAnimationDuration:"]) {
    [CATransaction setAnimationDuration:[args.value(0) doubleValue]];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setAnimationTimingFunction:"]) {
    id fn = args.object(0);
    [CATransaction setAnimationTimingFunction:
        [fn isKindOfClass:CAMediaTimingFunction.class] ? fn : nil];
    *out = "null";
    return true;
  }
  return false;
}

}  // namespace nacre_bridge
