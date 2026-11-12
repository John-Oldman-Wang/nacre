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

// 「一串数字，或者 null」。keyTimes 和那三个样条参数都是这个形状，
// 和 locations / lineDashPattern 一样：nil 不是空数组
static BOOL NumberArrayOrNull(id value, NSString* what, NSArray** out,
                              std::string* error) {
  if (value == nil || value == NSNull.null) {
    *out = nil;
    return YES;
  }
  if (![value isKindOfClass:NSArray.class]) {
    *error = [NSString stringWithFormat:
                  @"%@ needs an array of numbers, or null", what].UTF8String;
    return NO;
  }
  for (id n in (NSArray*)value) {
    if (![n isKindOfClass:NSNumber.class]) {
      *error = [NSString stringWithFormat:
                    @"%@ needs an array of numbers, or null", what].UTF8String;
      return NO;
    }
  }
  *out = value;
  return YES;
}

// 一串关键帧值。每个按 keyPath 的类型包一次，错一个就整条不写——
// 和 colors 一个规矩，不写进去一半
static BOOL AnimValuesFromJSON(CAPropertyAnimation* anim, id value,
                               NSArray** out, std::string* error) {
  if (value == nil || value == NSNull.null) {
    *out = nil;
    return YES;
  }
  if (![value isKindOfClass:NSArray.class]) {
    *error = "values needs an array, or null";
    return NO;
  }
  NSMutableArray* list = [NSMutableArray array];
  for (id item in (NSArray*)value) {
    std::string local;
    id boxed = AnimValueFromJSON(anim, @"values", item, &local);
    if (!local.empty()) {
      *error = local;
      return NO;
    }
    [list addObject:boxed ?: NSNull.null];
  }
  *out = list;
  return YES;
}

// CADisplayLink。时间单位**是秒**，和 ObjC 一致——底层跟原生走，
// 将来上层的 requestAnimationFrame 再换成毫秒。
id ReadDisplayLinkProperty(id object, NSString* key) {
  if (![object isKindOfClass:CADisplayLink.class]) return nil;
  CADisplayLink* link = (CADisplayLink*)object;
  if ([key isEqualToString:@"timestamp"]) return @(link.timestamp);
  if ([key isEqualToString:@"duration"]) return @(link.duration);
  if ([key isEqualToString:@"targetTimestamp"]) return @(link.targetTimestamp);
  if ([key isEqualToString:@"isPaused"]) return @(link.isPaused);
  if ([key isEqualToString:@"preferredFrameRateRange"]) {
    return FrameRateRangeToJSON(link.preferredFrameRateRange);
  }
  return nil;
}

BOOL WriteDisplayLinkProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:CADisplayLink.class]) return NO;
  CADisplayLink* link = (CADisplayLink*)object;
  if ([key isEqualToString:@"isPaused"]) {
    link.paused = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"preferredFrameRateRange"]) {
    link.preferredFrameRateRange = JSONToFrameRateRange(value);
    return YES;
  }
  return NO;
}

id ReadAnimationProperty(id object, NSString* key) {
  // 子类在前
  if ([object isKindOfClass:CASpringAnimation.class]) {
    CASpringAnimation* spring = (CASpringAnimation*)object;
    if ([key isEqualToString:@"mass"]) return @(spring.mass);
    if ([key isEqualToString:@"stiffness"]) return @(spring.stiffness);
    if ([key isEqualToString:@"damping"]) return @(spring.damping);
    if ([key isEqualToString:@"initialVelocity"]) return @(spring.initialVelocity);
    if ([key isEqualToString:@"allowsOverdamping"]) return @(spring.allowsOverdamping);
    // 三个只读的：系统按当前参数算出来的
    if ([key isEqualToString:@"settlingDuration"]) return @(spring.settlingDuration);
    if ([key isEqualToString:@"perceptualDuration"]) return @(spring.perceptualDuration);
    if ([key isEqualToString:@"bounce"]) return @(spring.bounce);
  }
  if ([object isKindOfClass:CAKeyframeAnimation.class]) {
    CAKeyframeAnimation* frames = (CAKeyframeAnimation*)object;
    if ([key isEqualToString:@"values"]) {
      // 对象那几种（颜色、路径）这里给 nil，由对象数组通道接手
      NacreAnimValueKind kind;
      if (!AnimValueKindForKeyPath(frames.keyPath, &kind)) return nil;
      if (kind == NacreAnimValueColor || kind == NacreAnimValuePath) return nil;
      if (frames.values == nil) return NSNull.null;
      NSMutableArray* out = [NSMutableArray array];
      for (id item in frames.values) [out addObject:AnimValueToJSON(item) ?: NSNull.null];
      return out;
    }
    if ([key isEqualToString:@"keyTimes"]) return frames.keyTimes ?: (id)NSNull.null;
    if ([key isEqualToString:@"calculationMode"]) {
      return NameForCalculationMode(frames.calculationMode);
    }
    if ([key isEqualToString:@"rotationMode"]) {
      return frames.rotationMode == nil ? (id)NSNull.null
                                        : NameForRotationMode(frames.rotationMode);
    }
    if ([key isEqualToString:@"tensionValues"]) return frames.tensionValues ?: (id)NSNull.null;
    if ([key isEqualToString:@"continuityValues"]) {
      return frames.continuityValues ?: (id)NSNull.null;
    }
    if ([key isEqualToString:@"biasValues"]) return frames.biasValues ?: (id)NSNull.null;
  }
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
  // 子类在前
  if ([object isKindOfClass:CASpringAnimation.class]) {
    CASpringAnimation* spring = (CASpringAnimation*)object;
    if ([key isEqualToString:@"mass"]) { spring.mass = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"stiffness"]) {
      spring.stiffness = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"damping"]) { spring.damping = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"initialVelocity"]) {
      spring.initialVelocity = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"allowsOverdamping"]) {
      spring.allowsOverdamping = NACRE_BOOL(value, key);
      return YES;
    }
  }
  if ([object isKindOfClass:CAKeyframeAnimation.class]) {
    CAKeyframeAnimation* frames = (CAKeyframeAnimation*)object;
    if ([key isEqualToString:@"values"]) {
      NSArray* list = nil;
      if (!AnimValuesFromJSON(frames, value, &list, error)) return YES;
      frames.values = list;
      return YES;
    }
    if ([key isEqualToString:@"keyTimes"]) {
      NSArray* list = nil;
      if (!NumberArrayOrNull(value, @"keyTimes", &list, error)) return YES;
      frames.keyTimes = list;
      return YES;
    }
    if ([key isEqualToString:@"tensionValues"]) {
      NSArray* list = nil;
      if (!NumberArrayOrNull(value, @"tensionValues", &list, error)) return YES;
      frames.tensionValues = list;
      return YES;
    }
    if ([key isEqualToString:@"continuityValues"]) {
      NSArray* list = nil;
      if (!NumberArrayOrNull(value, @"continuityValues", &list, error)) return YES;
      frames.continuityValues = list;
      return YES;
    }
    if ([key isEqualToString:@"biasValues"]) {
      NSArray* list = nil;
      if (!NumberArrayOrNull(value, @"biasValues", &list, error)) return YES;
      frames.biasValues = list;
      return YES;
    }
    if ([key isEqualToString:@"calculationMode"]) {
      NSString* mode = CalculationModeFromName(value);
      if (mode == nil) {
        *error = EnumError(@"calculationMode", value, NamesForCalculationMode());
        return YES;
      }
      frames.calculationMode = mode;
      return YES;
    }
    if ([key isEqualToString:@"rotationMode"]) {
      // null 是合法的，而且是默认值：不跟着路径转
      if (value == nil || value == NSNull.null) {
        frames.rotationMode = nil;
        return YES;
      }
      NSString* mode = RotationModeFromName(value);
      if (mode == nil) {
        *error = EnumError(@"rotationMode", value, NamesForRotationMode());
        return YES;
      }
      frames.rotationMode = mode;
      return YES;
    }
  }
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
    if ([key isEqualToString:@"duration"]) { anim.duration = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"beginTime"]) { anim.beginTime = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"speed"]) { anim.speed = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"timeOffset"]) { anim.timeOffset = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"repeatCount"]) {
      anim.repeatCount = [value isEqual:@"infinity"] ? HUGE_VALF : NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"repeatDuration"]) {
      anim.repeatDuration = [value isEqual:@"infinity"] ? HUGE_VAL : NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"autoreverses"]) { anim.autoreverses = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"removedOnCompletion"]) {
      anim.removedOnCompletion = NACRE_BOOL(value, key);
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
  if ([object isKindOfClass:CAKeyframeAnimation.class] && name == "path") {
    CGPathRef cg = ((CAKeyframeAnimation*)object).path;
    if (cg == NULL) return {nullptr, "UIBezierPath"};
    // 和 CAShapeLayer.path 一样每次新建一个包装，所以 JS 侧也记了镜像
    return {(__bridge void*)[UIBezierPath bezierPathWithCGPath:cg], "UIBezierPath"};
  }
  if ([object isKindOfClass:CAAnimation.class] && name == "timingFunction") {
    CAMediaTimingFunction* fn = ((CAAnimation*)object).timingFunction;
    if (fn == nil) return {nullptr, "CAMediaTimingFunction"};
    return {(__bridge void*)fn, "CAMediaTimingFunction"};
  }
  return {};
}

void WriteAnimationObjectProperty(id object, const std::string& name, id value) {
  if ([object isKindOfClass:CAKeyframeAnimation.class] && name == "path") {
    // 取的是 CGPath。给了 path 之后 values 就不起作用了（头文件原话）
    UIBezierPath* p = [value isKindOfClass:UIBezierPath.class] ? (UIBezierPath*)value : nil;
    ((CAKeyframeAnimation*)object).path = p.CGPath;
    return;
  }
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

void ReadAnimationObjectArray(id object, const std::string& name,
                              std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:CAKeyframeAnimation.class]) {
    CAKeyframeAnimation* frames = (CAKeyframeAnimation*)object;
    if (name == "values") {
      NacreAnimValueKind kind;
      if (!AnimValueKindForKeyPath(frames.keyPath, &kind)) return;
      if (kind == NacreAnimValueColor) {
        for (id item in frames.values) {
          refs.push_back({(__bridge void*)[UIColor colorWithCGColor:(__bridge CGColorRef)item],
                          "UIColor"});
        }
      } else if (kind == NacreAnimValuePath) {
        for (id item in frames.values) {
          refs.push_back({(__bridge void*)[UIBezierPath
                              bezierPathWithCGPath:(__bridge CGPathRef)item],
                          "UIBezierPath"});
        }
      }
      return;
    }
    if (name == "timingFunctions") {
      for (CAMediaTimingFunction* fn in frames.timingFunctions) {
        refs.push_back({(__bridge void*)fn, "CAMediaTimingFunction"});
      }
      return;
    }
  }
  if ([object isKindOfClass:CAAnimationGroup.class] && name == "animations") {
    for (CAAnimation* a in ((CAAnimationGroup*)object).animations) {
      refs.push_back({(__bridge void*)a, AnimationClassName(a)});
    }
  }
}

BOOL WriteAnimationObjectArray(id object, const std::string& name,
                               const std::vector<void*>& values, std::string* error) {
  if ([object isKindOfClass:CAKeyframeAnimation.class]) {
    CAKeyframeAnimation* frames = (CAKeyframeAnimation*)object;
    if (name == "values") {
      NacreAnimValueKind kind;
      if (!AnimValueKindForKeyPath(frames.keyPath, &kind)) {
        *error = frames.keyPath == nil
                     ? "set keyPath before values; the value's type depends on it"
                     : "this keyPath cannot be animated";
        return YES;
      }
      NSMutableArray* list = [NSMutableArray array];
      for (void* ptr : values) {
        id v = (__bridge id)ptr;
        if (kind == NacreAnimValueColor && [v isKindOfClass:UIColor.class]) {
          [list addObject:(__bridge id)((UIColor*)v).CGColor];
        } else if (kind == NacreAnimValuePath && [v isKindOfClass:UIBezierPath.class]) {
          [list addObject:(__bridge id)((UIBezierPath*)v).CGPath];
        } else {
          *error = "values does not fit this keyPath";
          return YES;
        }
      }
      frames.values = list;
      return YES;
    }
    if (name == "timingFunctions") {
      NSMutableArray* list = [NSMutableArray array];
      for (void* ptr : values) {
        id v = (__bridge id)ptr;
        if (![v isKindOfClass:CAMediaTimingFunction.class]) {
          *error = "timingFunctions needs an array of CAMediaTimingFunction";
          return YES;
        }
        [list addObject:v];
      }
      frames.timingFunctions = list;
      return YES;
    }
  }
  if ([object isKindOfClass:CAAnimationGroup.class] && name == "animations") {
    NSMutableArray* list = [NSMutableArray array];
    for (void* ptr : values) {
      id v = (__bridge id)ptr;
      if (![v isKindOfClass:CAAnimation.class]) {
        *error = "animations needs an array of CAAnimation";
        return YES;
      }
      [list addObject:v];
    }
    ((CAAnimationGroup*)object).animations = list;
    return YES;
  }
  return NO;
}

}  // namespace nacre_bridge
