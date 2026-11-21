// 一个域：图层的 3D 变换和遮罩。CALayer 的 transform / sublayerTransform /
// isDoubleSided / mask。
//
// CATransform3D 是结构体，过桥的是 16 个数（JSON 对象 m11…m44），在 JS 那边是
// CATransform3D 类（内置脚本 02-struct.js）。动画那一侧的 transform 一组
// keyPath 在 NacrePropsAnimation.mm 的表里。
#import "NacreBridge.h"

namespace nacre_bridge {

static id ReadLayerTransformProperty(id object, NSString* key) {
  if (![object isKindOfClass:CALayer.class]) return nil;
  CALayer* layer = (CALayer*)object;
  if ([key isEqualToString:@"transform"]) return Transform3DToJSON(layer.transform);
  if ([key isEqualToString:@"sublayerTransform"]) return Transform3DToJSON(layer.sublayerTransform);
  if ([key isEqualToString:@"isDoubleSided"]) return @(layer.doubleSided);
  return nil;
}

static BOOL WriteLayerTransformProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:CALayer.class]) return NO;
  CALayer* layer = (CALayer*)object;
  if ([key isEqualToString:@"transform"] || [key isEqualToString:@"sublayerTransform"]) {
    // 字段齐不齐、是不是数，JS 那边（structArg）已经核过了
    if (![value isKindOfClass:NSDictionary.class]) {
      *error = [NSString stringWithFormat:@"%@ needs a CATransform3D", key].UTF8String;
      return YES;
    }
    CATransform3D t = JSONToTransform3D(value);
    if ([key isEqualToString:@"transform"]) {
      layer.transform = t;
    } else {
      layer.sublayerTransform = t;
    }
    return YES;
  }
  if ([key isEqualToString:@"isDoubleSided"]) {
    layer.doubleSided = NACRE_BOOL(value, key);
    return YES;
  }
  return NO;
}

static nacre::NativeObjectRef ReadLayerTransformObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:CALayer.class]) return {};
  CALayer* layer = (CALayer*)object;
  if (name == "mask") return {NacreKeep(layer.mask), "CALayer"};
  return {};
}

static bool WriteLayerTransformObjectProperty(id object, const std::string& name, id value,
                                              std::string* error) {
  if (![object isKindOfClass:CALayer.class]) return false;
  CALayer* layer = (CALayer*)object;
  if (name == "mask") {
    if (value != nil && ![value isKindOfClass:CALayer.class]) {
      *error = "mask needs a CALayer or null";
      return true;
    }
    layer.mask = value;
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreLayerTransformDomain : NSObject
@end
@implementation NacreLayerTransformDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "layer-transform";
  d.classes = {CALayer.class};
  d.read = nacre_bridge::ReadLayerTransformProperty;
  d.write = nacre_bridge::WriteLayerTransformProperty;
  d.readObject = nacre_bridge::ReadLayerTransformObjectProperty;
  d.writeObject = nacre_bridge::WriteLayerTransformObjectProperty;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
