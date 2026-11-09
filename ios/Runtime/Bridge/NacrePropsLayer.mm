// 图层。CALayer 的圆角、边框、阴影。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadLayerProperty(id object, NSString* key) {
  id value = nil;
  if (value == nil && [object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if ([key isEqualToString:@"cornerRadius"]) {
      value = @(layer.cornerRadius);
    } else if ([key isEqualToString:@"cornerCurve"]) {
      value = NameForCornerCurve(layer.cornerCurve);
    } else if ([key isEqualToString:@"maskedCorners"]) {
      value = NamesInCornerMask(layer.maskedCorners);
    } else if ([key isEqualToString:@"borderWidth"]) {
      value = @(layer.borderWidth);
    } else if ([key isEqualToString:@"shadowOpacity"]) {
      value = @(layer.shadowOpacity);
    } else if ([key isEqualToString:@"shadowRadius"]) {
      value = @(layer.shadowRadius);
    } else if ([key isEqualToString:@"shadowOffset"]) {
      value = SizeToJSON(layer.shadowOffset);
    }
  }
  return value;
}

BOOL WriteLayerProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if ([key isEqualToString:@"cornerRadius"]) {
      layer.cornerRadius = [value doubleValue];
      return YES;
    }
    if ([key isEqualToString:@"borderWidth"]) {
      layer.borderWidth = [value doubleValue];
      return YES;
    }
    if ([key isEqualToString:@"shadowOpacity"]) {
      layer.shadowOpacity = [value floatValue];
      return YES;
    }
    if ([key isEqualToString:@"shadowRadius"]) {
      layer.shadowRadius = [value doubleValue];
      return YES;
    }
    if ([key isEqualToString:@"shadowOffset"]) {
      layer.shadowOffset = JSONToSize(value);
      return YES;
    }
    if ([key isEqualToString:@"cornerCurve"]) {
      NSString* curve = CornerCurveFromName(value);
      if (curve == nil) {
        *error = EnumError(@"cornerCurve", value, NamesForCornerCurve());
        return YES;
      }
      layer.cornerCurve = curve;
      return YES;
    }
    if ([key isEqualToString:@"maskedCorners"]) {
      CACornerMask mask;
      id bad = nil;
      if (!CornerMaskFromNames(value, &mask, &bad)) {
        *error = bad != nil
                     ? EnumError(@"maskedCorners", bad, NamesForCornerMask())
                     : [NSString stringWithFormat:
                           @"maskedCorners needs an array of names; expected any of: %@",
                           NamesForCornerMask()].UTF8String;
        return YES;
      }
      layer.maskedCorners = mask;
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadLayerObjectProperty(id object,
                                            const std::string& name) {
  // CGColorRef 不是 ObjC 对象，JS 侧统一用 UIColor。读出来是新建的包装——
  // 动态色在这一步被定死了，见 docs/api/ca-layer.md。
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    // 空指针 + 类名 = 「有这个属性，但值是 nil」；光一个 {} 现在表示
    // 「这个域不认识这个名字」，两件事不能再共用一个表示
    if (name == "borderColor") {
      if (layer.borderColor == NULL) return {nullptr, "UIColor"};
      return {(__bridge void*)[UIColor colorWithCGColor:layer.borderColor], "UIColor"};
    }
    if (name == "shadowColor") {
      if (layer.shadowColor == NULL) return {nullptr, "UIColor"};
      return {(__bridge void*)[UIColor colorWithCGColor:layer.shadowColor], "UIColor"};
    }
  }
  return {};
}

void WriteLayerObjectProperty(id object, const std::string& name, id value) {
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    UIColor* color = [value isKindOfClass:UIColor.class] ? (UIColor*)value : nil;
    if (name == "borderColor") {
      layer.borderColor = color.CGColor;
    } else if (name == "shadowColor") {
      layer.shadowColor = color.CGColor;
    }
  }
}

}  // namespace nacre_bridge
