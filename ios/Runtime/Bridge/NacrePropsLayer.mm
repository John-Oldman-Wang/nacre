// 图层。CALayer 的几何、层级、外观，以及 CAGradientLayer、CAShapeLayer。
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
  if ([layer isKindOfClass:CAShapeLayer.class]) return "CAShapeLayer";
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
  if ([object isKindOfClass:CAShapeLayer.class]) {
    CAShapeLayer* shape = (CAShapeLayer*)object;
    if ([key isEqualToString:@"fillRule"]) {
      value = NameForFillRule(shape.fillRule);
    } else if ([key isEqualToString:@"lineCap"]) {
      value = NameForLineCap(shape.lineCap);
    } else if ([key isEqualToString:@"lineJoin"]) {
      value = NameForLineJoin(shape.lineJoin);
    } else if ([key isEqualToString:@"lineWidth"]) {
      value = @(shape.lineWidth);
    } else if ([key isEqualToString:@"miterLimit"]) {
      value = @(shape.miterLimit);
    } else if ([key isEqualToString:@"strokeStart"]) {
      value = @(shape.strokeStart);
    } else if ([key isEqualToString:@"strokeEnd"]) {
      value = @(shape.strokeEnd);
    } else if ([key isEqualToString:@"lineDashPhase"]) {
      value = @(shape.lineDashPhase);
    } else if ([key isEqualToString:@"lineDashPattern"]) {
      // 和 locations 一样：nil 不是空数组。nil = 实线
      value = shape.lineDashPattern ?: (id)NSNull.null;
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
  if ([object isKindOfClass:CAShapeLayer.class]) {
    CAShapeLayer* shape = (CAShapeLayer*)object;
    if ([key isEqualToString:@"fillRule"]) {
      NSString* rule = FillRuleFromName(value);
      if (rule == nil) {
        *error = EnumError(@"fillRule", value, NamesForFillRule());
        return YES;
      }
      shape.fillRule = rule;
      return YES;
    }
    if ([key isEqualToString:@"lineCap"]) {
      NSString* cap = LineCapFromName(value);
      if (cap == nil) {
        *error = EnumError(@"lineCap", value, NamesForLineCap());
        return YES;
      }
      shape.lineCap = cap;
      return YES;
    }
    if ([key isEqualToString:@"lineJoin"]) {
      NSString* join = LineJoinFromName(value);
      if (join == nil) {
        *error = EnumError(@"lineJoin", value, NamesForLineJoin());
        return YES;
      }
      shape.lineJoin = join;
      return YES;
    }
    if ([key isEqualToString:@"lineWidth"]) {
      shape.lineWidth = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"miterLimit"]) {
      shape.miterLimit = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"strokeStart"]) {
      shape.strokeStart = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"strokeEnd"]) {
      shape.strokeEnd = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"lineDashPhase"]) {
      shape.lineDashPhase = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"lineDashPattern"]) {
      if (value == nil || value == NSNull.null) {
        shape.lineDashPattern = nil;
        return YES;
      }
      if (![value isKindOfClass:NSArray.class]) {
        *error = "lineDashPattern needs an array of numbers, or null";
        return YES;
      }
      for (id n in (NSArray*)value) {
        if (![n isKindOfClass:NSNumber.class]) {
          *error = "lineDashPattern needs an array of numbers, or null";
          return YES;
        }
      }
      shape.lineDashPattern = value;
      return YES;
    }
  }
  if ([object isKindOfClass:CALayer.class]) {
    CALayer* layer = (CALayer*)object;
    if ([key isEqualToString:@"cornerRadius"]) {
      layer.cornerRadius = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"borderWidth"]) {
      layer.borderWidth = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"shadowOpacity"]) {
      layer.shadowOpacity = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"shadowRadius"]) {
      layer.shadowRadius = NACRE_NUM(value, key);
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
      layer.zPosition = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"opacity"]) {
      layer.opacity = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isHidden"]) {
      layer.hidden = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"masksToBounds"]) {
      layer.masksToBounds = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"contentsScale"]) {
      layer.contentsScale = NACRE_NUM(value, key);
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
    if (name == "path" && [layer isKindOfClass:CAShapeLayer.class]) {
      CGPathRef cg = ((CAShapeLayer*)layer).path;
      if (cg == NULL) return {nullptr, "UIBezierPath"};
      // 每次都是新建的包装——JS 侧优先还镜像里那个对象，镜像没有才走这里
      return {(__bridge void*)[UIBezierPath bezierPathWithCGPath:cg], "UIBezierPath"};
    }
    if (name == "fillColor" && [layer isKindOfClass:CAShapeLayer.class]) {
      CGColorRef cg = ((CAShapeLayer*)layer).fillColor;
      if (cg == NULL) return {nullptr, "UIColor"};
      return {(__bridge void*)[UIColor colorWithCGColor:cg], "UIColor"};
    }
    if (name == "strokeColor" && [layer isKindOfClass:CAShapeLayer.class]) {
      CGColorRef cg = ((CAShapeLayer*)layer).strokeColor;
      if (cg == NULL) return {nullptr, "UIColor"};
      return {(__bridge void*)[UIColor colorWithCGColor:cg], "UIColor"};
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
    } else if ([layer isKindOfClass:CAShapeLayer.class]) {
      CAShapeLayer* shape = (CAShapeLayer*)layer;
      if (name == "fillColor") {
        shape.fillColor = color.CGColor;
      } else if (name == "strokeColor") {
        shape.strokeColor = color.CGColor;
      } else if (name == "path") {
        // 取的是 CGPath。nil 合法，表示什么都不画
        UIBezierPath* p = [value isKindOfClass:UIBezierPath.class] ? (UIBezierPath*)value : nil;
        shape.path = p.CGPath;
      }
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
