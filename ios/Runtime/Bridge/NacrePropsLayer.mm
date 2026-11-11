// 图层。CALayer 的几何、层级、外观，以及 CAGradientLayer。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。
//
// 注意这个域排在 View 前面，而 frame / bounds / isHidden 这些名字两边都有。
// 不冲突的原因是每个分支先问 isKindOfClass:CALayer.class——一个 UIView
// 永远走不进来。

#import "NacreBridge.h"

namespace nacre_bridge {

const char* LayerClassName(CALayer* layer) {
  if ([layer isKindOfClass:CAGradientLayer.class]) return "CAGradientLayer";
  return "CALayer";
}

id ReadLayerProperty(id object, NSString* key) {
  id value = nil;
  // 子类在前：渐变层也是 CALayer，但这几个键只有它有
  if ([object isKindOfClass:CAGradientLayer.class]) {
    CAGradientLayer* gradient = (CAGradientLayer*)object;
    if ([key isEqualToString:@"locations"]) {
      // nil 和空数组在 CA 里是两回事（nil = 均匀分布），所以别把 nil 变成 []
      value = gradient.locations ?: (id)NSNull.null;
    } else if ([key isEqualToString:@"startPoint"]) {
      value = PointToJSON(gradient.startPoint);
    } else if ([key isEqualToString:@"endPoint"]) {
      value = PointToJSON(gradient.endPoint);
    } else if ([key isEqualToString:@"type"]) {
      value = NameForGradientType(gradient.type);
    }
    if (value != nil) return value;
  }
  if ([object isKindOfClass:CALayer.class]) {
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
    } else if ([key isEqualToString:@"frame"]) {
      value = RectToJSON(layer.frame);
    } else if ([key isEqualToString:@"bounds"]) {
      value = RectToJSON(layer.bounds);
    } else if ([key isEqualToString:@"position"]) {
      value = PointToJSON(layer.position);
    } else if ([key isEqualToString:@"zPosition"]) {
      value = @(layer.zPosition);
    } else if ([key isEqualToString:@"opacity"]) {
      value = @(layer.opacity);
    } else if ([key isEqualToString:@"isHidden"]) {
      value = @(layer.hidden);
    } else if ([key isEqualToString:@"masksToBounds"]) {
      value = @(layer.masksToBounds);
    } else if ([key isEqualToString:@"contentsScale"]) {
      value = @(layer.contentsScale);
    }
  }
  return value;
}

BOOL WriteLayerProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:CAGradientLayer.class]) {
    CAGradientLayer* gradient = (CAGradientLayer*)object;
    if ([key isEqualToString:@"locations"]) {
      if (value == nil || value == NSNull.null) {
        gradient.locations = nil;
        return YES;
      }
      if (![value isKindOfClass:NSArray.class]) {
        *error = "locations needs an array of numbers, or null";
        return YES;
      }
      for (id n in (NSArray*)value) {
        if (![n isKindOfClass:NSNumber.class]) {
          *error = "locations needs an array of numbers, or null";
          return YES;
        }
      }
      gradient.locations = value;
      return YES;
    }
    if ([key isEqualToString:@"startPoint"]) {
      gradient.startPoint = JSONToPoint(value);
      return YES;
    }
    if ([key isEqualToString:@"endPoint"]) {
      gradient.endPoint = JSONToPoint(value);
      return YES;
    }
    if ([key isEqualToString:@"type"]) {
      NSString* type = GradientTypeFromName(value);
      if (type == nil) {
        *error = EnumError(@"type", value, NamesForGradientType());
        return YES;
      }
      gradient.type = type;
      return YES;
    }
  }
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
    if ([key isEqualToString:@"frame"]) {
      layer.frame = JSONToRect(value);
      return YES;
    }
    if ([key isEqualToString:@"bounds"]) {
      layer.bounds = JSONToRect(value);
      return YES;
    }
    if ([key isEqualToString:@"position"]) {
      layer.position = JSONToPoint(value);
      return YES;
    }
    if ([key isEqualToString:@"zPosition"]) {
      layer.zPosition = [value doubleValue];
      return YES;
    }
    if ([key isEqualToString:@"opacity"]) {
      layer.opacity = [value floatValue];
      return YES;
    }
    if ([key isEqualToString:@"isHidden"]) {
      layer.hidden = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"masksToBounds"]) {
      layer.masksToBounds = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"contentsScale"]) {
      layer.contentsScale = [value doubleValue];
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
    if (name == "backgroundColor") {
      if (layer.backgroundColor == NULL) return {nullptr, "UIColor"};
      return {(__bridge void*)[UIColor colorWithCGColor:layer.backgroundColor], "UIColor"};
    }
    if (name == "superlayer") {
      CALayer* super = layer.superlayer;
      if (super == nil) return {nullptr, "CALayer"};
      return {(__bridge void*)super, LayerClassName(super)};
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
    } else if (name == "backgroundColor") {
      layer.backgroundColor = color.CGColor;
    }
  }
}

void ReadLayerObjectArray(id object, const std::string& name,
                          std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:CAGradientLayer.class] && name == "colors") {
    // 存的是 CGColorRef，包回 UIColor 给 JS——和 borderColor 同一条路，
    // 所以读出来的包装和写进去的那个不是同一个对象
    for (id c in ((CAGradientLayer*)object).colors) {
      CGColorRef cg = (__bridge CGColorRef)c;
      refs.push_back({(__bridge void*)[UIColor colorWithCGColor:cg], "UIColor"});
    }
  }
  if ([object isKindOfClass:CALayer.class] && name == "sublayers") {
    for (CALayer* child in ((CALayer*)object).sublayers) {
      refs.push_back({(__bridge void*)child, LayerClassName(child)});
    }
  }
}

BOOL WriteLayerObjectArray(id object, const std::string& name,
                           const std::vector<void*>& values, std::string* error) {
  if ([object isKindOfClass:CAGradientLayer.class] && name == "colors") {
    NSMutableArray* list = [NSMutableArray array];
    for (void* ptr : values) {
      id v = (__bridge id)ptr;
      if (![v isKindOfClass:UIColor.class]) {
        *error = "colors needs an array of colors";
        return YES;
      }
      [list addObject:(__bridge id)((UIColor*)v).CGColor];
    }
    ((CAGradientLayer*)object).colors = list;
    return YES;
  }
  return NO;
}

}  // namespace nacre_bridge
