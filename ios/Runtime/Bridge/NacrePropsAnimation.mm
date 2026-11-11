// 动画的属性：CAAnimation 的时间和曲线、CAPropertyAnimation 的 keyPath、
// CABasicAnimation 的三个值。
//
// 这个域最特别的一条是 fromValue / toValue / byValue 在 ObjC 里是 id——
// **该放什么类型由 keyPath 决定**。表只能放原生层，理由和枚举一样：只有
// 这里知道事实，而且查不到就能当场报错并列出可选值，不会静默什么都不做。
#import "NacreBridge.h"

namespace nacre_bridge {

// keyPath → 这个属性的值是什么类型。
//
// 收的是我们已经暴露的那些可动画属性。**frame 不收**：它在 CA 里是从
// position / bounds / transform 推出来的，Apple 明说别动画它。
// **isHidden 不收**：布尔值动画没有意义。
// locations / colors 这两个数组也先不收，它们要再加一种「数组 of X」。
static NSDictionary<NSString*, NSNumber*>* AnimKeyPathTable(void) {
  static NSDictionary<NSString*, NSNumber*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      // CALayer
      @"opacity": @(NacreAnimValueNumber),
      @"cornerRadius": @(NacreAnimValueNumber),
      @"borderWidth": @(NacreAnimValueNumber),
      @"shadowOpacity": @(NacreAnimValueNumber),
      @"shadowRadius": @(NacreAnimValueNumber),
      @"zPosition": @(NacreAnimValueNumber),
      @"position": @(NacreAnimValuePoint),
      @"bounds": @(NacreAnimValueRect),
      @"shadowOffset": @(NacreAnimValueSize),
      @"backgroundColor": @(NacreAnimValueColor),
      @"borderColor": @(NacreAnimValueColor),
      @"shadowColor": @(NacreAnimValueColor),
      // CAShapeLayer
      @"lineWidth": @(NacreAnimValueNumber),
      @"miterLimit": @(NacreAnimValueNumber),
      @"strokeStart": @(NacreAnimValueNumber),
      @"strokeEnd": @(NacreAnimValueNumber),
      @"lineDashPhase": @(NacreAnimValueNumber),
      @"fillColor": @(NacreAnimValueColor),
      @"strokeColor": @(NacreAnimValueColor),
      @"path": @(NacreAnimValuePath),
      // CAGradientLayer
      @"startPoint": @(NacreAnimValuePoint),
      @"endPoint": @(NacreAnimValuePoint),
    };
  });
  return table;
}

BOOL AnimValueKindForKeyPath(NSString* keyPath, NacreAnimValueKind* out) {
  if (![keyPath isKindOfClass:NSString.class]) return NO;
  NSNumber* kind = AnimKeyPathTable()[keyPath];
  if (kind == nil) return NO;
  *out = (NacreAnimValueKind)kind.integerValue;
  return YES;
}

NSString* NamesForAnimationKeyPath(void) {
  NSArray<NSString*>* keys =
      [AnimKeyPathTable().allKeys sortedArrayUsingSelector:@selector(compare:)];
  return [keys componentsJoinedByString:@" / "];
}

// 一个标量值（数字或者结构体）按 keyPath 的类型包成 CA 要的东西。
// 认不出来就填 error——写不进去又不报错是这个项目一路在消灭的那种错。
static id AnimValueFromJSON(CAPropertyAnimation* anim, NSString* what, id value,
                            std::string* error) {
  if (value == nil || value == NSNull.null) return nil;
  NacreAnimValueKind kind;
  if (!AnimValueKindForKeyPath(anim.keyPath, &kind)) {
    *error = anim.keyPath == nil
                 ? [NSString stringWithFormat:
                       @"set keyPath before %@; the value's type depends on it", what]
                       .UTF8String
                 : [NSString stringWithFormat:
                       @"keyPath \"%@\" cannot be animated; expected one of: %@",
                       anim.keyPath, NamesForAnimationKeyPath()].UTF8String;
    return nil;
  }
  switch (kind) {
    case NacreAnimValueNumber:
      if (![value isKindOfClass:NSNumber.class]) break;
      return value;
    case NacreAnimValuePoint:
      if (![value isKindOfClass:NSDictionary.class]) break;
      return [NSValue valueWithCGPoint:JSONToPoint(value)];
    case NacreAnimValueSize:
      if (![value isKindOfClass:NSDictionary.class]) break;
      return [NSValue valueWithCGSize:JSONToSize(value)];
    case NacreAnimValueRect:
      if (![value isKindOfClass:NSDictionary.class]) break;
      return [NSValue valueWithCGRect:JSONToRect(value)];
    case NacreAnimValueColor:
      *error = [NSString stringWithFormat:@"%@ for keyPath \"%@\" needs a color",
                                          what, anim.keyPath].UTF8String;
      return nil;
    case NacreAnimValuePath:
      *error = [NSString stringWithFormat:@"%@ for keyPath \"%@\" needs a UIBezierPath",
                                          what, anim.keyPath].UTF8String;
      return nil;
  }
  *error = [NSString stringWithFormat:@"%@ does not fit keyPath \"%@\"",
                                      what, anim.keyPath].UTF8String;
  return nil;
}

// 反过来：CA 存的东西变回 JSON。对象类型（颜色、路径）这里给 nil，
// 由对象通道接手——JS 侧先问对象通道，没有再问这条
static id AnimValueToJSON(id value) {
  if (value == nil) return nil;
  if ([value isKindOfClass:NSNumber.class]) return value;
  if ([value isKindOfClass:NSValue.class]) {
    NSValue* v = (NSValue*)value;
    const char* type = v.objCType;
    if (strcmp(type, @encode(CGPoint)) == 0) return PointToJSON(v.CGPointValue);
    if (strcmp(type, @encode(CGSize)) == 0) return SizeToJSON(v.CGSizeValue);
    if (strcmp(type, @encode(CGRect)) == 0) return RectToJSON(v.CGRectValue);
  }
  return nil;
}

id ReadAnimationProperty(id object, NSString* key) {
  if ([object isKindOfClass:CABasicAnimation.class]) {
    CABasicAnimation* basic = (CABasicAnimation*)object;
    if ([key isEqualToString:@"fromValue"]) return AnimValueToJSON(basic.fromValue);
    if ([key isEqualToString:@"toValue"]) return AnimValueToJSON(basic.toValue);
    if ([key isEqualToString:@"byValue"]) return AnimValueToJSON(basic.byValue);
  }
  if ([object isKindOfClass:CAPropertyAnimation.class]) {
    CAPropertyAnimation* prop = (CAPropertyAnimation*)object;
    if ([key isEqualToString:@"keyPath"]) return prop.keyPath ?: (id)NSNull.null;
  }
  if ([object isKindOfClass:CAAnimation.class]) {
    CAAnimation* anim = (CAAnimation*)object;
    if ([key isEqualToString:@"duration"]) return @(anim.duration);
    if ([key isEqualToString:@"beginTime"]) return @(anim.beginTime);
    if ([key isEqualToString:@"speed"]) return @(anim.speed);
    if ([key isEqualToString:@"timeOffset"]) return @(anim.timeOffset);
    // JSON 没有 Infinity（JSON.stringify 给 null），所以无穷大在桥上是
    // 字符串 'infinity'。JS 侧换回 Infinity，类型还是 number
    if ([key isEqualToString:@"repeatCount"]) {
      return isinf(anim.repeatCount) ? (id)@"infinity" : @(anim.repeatCount);
    }
    if ([key isEqualToString:@"repeatDuration"]) {
      return isinf(anim.repeatDuration) ? (id)@"infinity" : @(anim.repeatDuration);
    }
    if ([key isEqualToString:@"autoreverses"]) return @(anim.autoreverses);
    if ([key isEqualToString:@"fillMode"]) return NameForFillMode(anim.fillMode);
    if ([key isEqualToString:@"removedOnCompletion"]) return @(anim.removedOnCompletion);
  }
  return nil;
}

BOOL WriteAnimationProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:CABasicAnimation.class]) {
    CABasicAnimation* basic = (CABasicAnimation*)object;
    // 三个分支写开不合并：check-api.sh 靠正则认 @"..." 这些名字，
    // 合成一个循环它就看不见了（实测当场漏报了 byValue）
    if ([key isEqualToString:@"fromValue"]) {
      std::string local;
      id boxed = AnimValueFromJSON(basic, @"fromValue", value, &local);
      if (!local.empty()) { *error = local; return YES; }
      basic.fromValue = boxed;
      return YES;
    }
    if ([key isEqualToString:@"toValue"]) {
      std::string local;
      id boxed = AnimValueFromJSON(basic, @"toValue", value, &local);
      if (!local.empty()) { *error = local; return YES; }
      basic.toValue = boxed;
      return YES;
    }
    if ([key isEqualToString:@"byValue"]) {
      std::string local;
      id boxed = AnimValueFromJSON(basic, @"byValue", value, &local);
      if (!local.empty()) { *error = local; return YES; }
      basic.byValue = boxed;
      return YES;
    }
  }
  if ([object isKindOfClass:CAPropertyAnimation.class]) {
    CAPropertyAnimation* prop = (CAPropertyAnimation*)object;
    if ([key isEqualToString:@"keyPath"]) {
      if (value == nil || value == NSNull.null) {
        prop.keyPath = nil;
        return YES;
      }
      NacreAnimValueKind kind;
      if (!AnimValueKindForKeyPath(value, &kind)) {
        *error = EnumError(@"keyPath", value, NamesForAnimationKeyPath());
        return YES;
      }
      prop.keyPath = value;
      return YES;
    }
  }
  if ([object isKindOfClass:CAAnimation.class]) {
    CAAnimation* anim = (CAAnimation*)object;
    if ([key isEqualToString:@"duration"]) { anim.duration = [value doubleValue]; return YES; }
    if ([key isEqualToString:@"beginTime"]) { anim.beginTime = [value doubleValue]; return YES; }
    if ([key isEqualToString:@"speed"]) { anim.speed = [value floatValue]; return YES; }
    if ([key isEqualToString:@"timeOffset"]) { anim.timeOffset = [value doubleValue]; return YES; }
    if ([key isEqualToString:@"repeatCount"]) {
      anim.repeatCount = [value isEqual:@"infinity"] ? HUGE_VALF : [value floatValue];
      return YES;
    }
    if ([key isEqualToString:@"repeatDuration"]) {
      anim.repeatDuration = [value isEqual:@"infinity"] ? HUGE_VAL : [value doubleValue];
      return YES;
    }
    if ([key isEqualToString:@"autoreverses"]) { anim.autoreverses = [value boolValue]; return YES; }
    if ([key isEqualToString:@"removedOnCompletion"]) {
      anim.removedOnCompletion = [value boolValue];
      return YES;
    }
    if ([key isEqualToString:@"fillMode"]) {
      NSString* mode = FillModeFromName(value);
      if (mode == nil) {
        *error = EnumError(@"fillMode", value, NamesForFillMode());
        return YES;
      }
      anim.fillMode = mode;
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadAnimationObjectProperty(id object, const std::string& name) {
  // 先认名字再认类型：这三个名字之外的（timingFunction）要能往下走。
  // 一开始写成「先查 keyPath，查不到就 return {}」，结果 opacity 这种
  // 标量动画的 timingFunction 整个读不出来
  if ([object isKindOfClass:CABasicAnimation.class] &&
      (name == "fromValue" || name == "toValue" || name == "byValue")) {
    CABasicAnimation* basic = (CABasicAnimation*)object;
    NacreAnimValueKind kind;
    if (!AnimValueKindForKeyPath(basic.keyPath, &kind)) return {};
    if (kind != NacreAnimValueColor && kind != NacreAnimValuePath) return {};
    id value = nil;
    if (name == "fromValue") value = basic.fromValue;
    else if (name == "toValue") value = basic.toValue;
    else value = basic.byValue;
    if (kind == NacreAnimValueColor) {
      if (value == nil) return {nullptr, "UIColor"};
      return {(__bridge void*)[UIColor colorWithCGColor:(__bridge CGColorRef)value],
              "UIColor"};
    }
    if (value == nil) return {nullptr, "UIBezierPath"};
    return {(__bridge void*)[UIBezierPath bezierPathWithCGPath:(__bridge CGPathRef)value],
            "UIBezierPath"};
  }
  if ([object isKindOfClass:CAAnimation.class] && name == "timingFunction") {
    CAMediaTimingFunction* fn = ((CAAnimation*)object).timingFunction;
    if (fn == nil) return {nullptr, "CAMediaTimingFunction"};
    return {(__bridge void*)fn, "CAMediaTimingFunction"};
  }
  return {};
}

void WriteAnimationObjectProperty(id object, const std::string& name, id value) {
  if ([object isKindOfClass:CAAnimation.class] && name == "timingFunction") {
    ((CAAnimation*)object).timingFunction =
        [value isKindOfClass:CAMediaTimingFunction.class] ? value : nil;
    return;
  }
  if (![object isKindOfClass:CABasicAnimation.class]) return;
  CABasicAnimation* basic = (CABasicAnimation*)object;
  id boxed = nil;
  if ([value isKindOfClass:UIColor.class]) {
    boxed = (__bridge id)((UIColor*)value).CGColor;
  } else if ([value isKindOfClass:UIBezierPath.class]) {
    boxed = (__bridge id)((UIBezierPath*)value).CGPath;
  }
  if (name == "fromValue") basic.fromValue = boxed;
  else if (name == "toValue") basic.toValue = boxed;
  else if (name == "byValue") basic.byValue = boxed;
}

}  // namespace nacre_bridge
