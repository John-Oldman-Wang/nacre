// 数值控件：UISwitch、UISlider、UIStepper、UISegmentedControl、UIPageControl、
// UIDatePicker。六个都是 UIControl 的子类。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个域是**登记进来的**（文件末尾的 +load，见 NacreExtension.h 的
// NacreRegisterDomain），核心的分发器、内部头、NacreRuntime.mm 都不认识它，
// 所以这里的函数全是 static。
//
// 这里没有事件的代码：change 等 16 个控件事件走核心里现成的 UIControl
// 分支，JS 那一侧继承 UIControl 就有。
//
// 这个文件里的「实测」都是用一个不带界面的原生小程序在 iPhone Air 模拟器
// （iOS 27.2）上量的，数据记在 docs/internals/value-controls.md。它们决定了
// 下面哪些值要先拦：UIKit 对越界的值有三种反应——抛 ObjC 异常、悄悄改成
// 别的值、什么都不做——后两种在 JS 那一侧就是「写不进去又不报错」。

#import "NacreBridge.h"

#include <cfloat>
#include <cmath>

namespace nacre_bridge {

// ---- 枚举 ----

NACRE_ENUM_MAP(SliderStyle, UISliderStyle,
               @"default": @(UISliderStyleDefault),
               @"thumbless": @(UISliderStyleThumbless))

NACRE_ENUM_MAP(PageControlBackgroundStyle, UIPageControlBackgroundStyle,
               @"automatic": @(UIPageControlBackgroundStyleAutomatic),
               @"prominent": @(UIPageControlBackgroundStyleProminent),
               @"minimal": @(UIPageControlBackgroundStyleMinimal))

NACRE_ENUM_MAP(PageControlDirection, UIPageControlDirection,
               @"natural": @(UIPageControlDirectionNatural),
               @"leftToRight": @(UIPageControlDirectionLeftToRight),
               @"rightToLeft": @(UIPageControlDirectionRightToLeft),
               @"topToBottom": @(UIPageControlDirectionTopToBottom),
               @"bottomToTop": @(UIPageControlDirectionBottomToTop))

NACRE_ENUM_MAP(PageControlInteractionState, UIPageControlInteractionState,
               @"none": @(UIPageControlInteractionStateNone),
               @"discrete": @(UIPageControlInteractionStateDiscrete),
               @"continuous": @(UIPageControlInteractionStateContinuous))

NACRE_ENUM_MAP(DatePickerMode, UIDatePickerMode,
               @"time": @(UIDatePickerModeTime),
               @"date": @(UIDatePickerModeDate),
               @"dateAndTime": @(UIDatePickerModeDateAndTime),
               @"countDownTimer": @(UIDatePickerModeCountDownTimer),
               @"yearAndMonth": @(UIDatePickerModeYearAndMonth))

NACRE_ENUM_MAP(DatePickerStyle, UIDatePickerStyle,
               @"automatic": @(UIDatePickerStyleAutomatic),
               @"wheels": @(UIDatePickerStyleWheels),
               @"compact": @(UIDatePickerStyleCompact),
               @"inline": @(UIDatePickerStyleInline))

// ---- 小工具 ----

// UISlider 的三个值在 ObjC 里是 float。JS 给的是 double，超出 float 范围的
// 直接强转是 inf；钉在 float 的两头，之后滑块自己会再钉到 min / max 之间
static float ToFloat(double d) {
  if (d > FLT_MAX) return FLT_MAX;
  if (d < -FLT_MAX) return -FLT_MAX;
  return (float)d;
}

// 日期在桥上是「1970 年以来的毫秒数」，一个 JSON 数字，和 JS 的
// Date.prototype.getTime() 是同一个量。null 就是 JSON 的 null。
// 四舍五入到整毫秒：NSDate 是双精度的秒，新建的选择器默认日期带着微秒
static id DateToJSON(NSDate* date) {
  if (date == nil) return NSNull.null;
  return @(std::round(date.timeIntervalSince1970 * 1000.0));
}

// 下面这几个取值函数返回 true 表示**值可用**，所以里面不能用 NACRE_NUM
// 那几个宏（宏失败时让所在函数返回「真」，在这里意思正好反了）

static bool DateValue(NSString* what, id value, NSDate* __strong* out, std::string* error) {
  if (!RequireNumber(value, what, error)) return false;
  *out = [NSDate dateWithTimeIntervalSince1970:SafeNumber(value) / 1000.0];
  return true;
}

// 个数：不能是负的
static bool CountValue(NSString* what, id value, NSInteger* out, std::string* error) {
  if (!RequireInteger(value, what, error)) return false;
  double d = SafeNumber(value);
  if (d < 0) {
    *error = [NSString stringWithFormat:@"%@ must be a non-negative integer, got %@", what,
                                        value].UTF8String;
    return false;
  }
  *out = (NSInteger)d;
  return true;
}

// 已有的那些的下标：0 到 count - 1。what 是报错里的主语
static bool IndexValue(NSString* what, NSString* noun, id value, NSInteger count,
                       NSInteger* out, std::string* error) {
  if (!RequireInteger(value, what, error)) return false;
  double d = SafeNumber(value);
  if (d < 0 || d >= count) {
    *error = count == 0
                 ? [NSString stringWithFormat:@"%@: %@ %@ is out of range; there are none",
                                              what, noun, value].UTF8String
                 : [NSString stringWithFormat:@"%@: %@ %@ is out of range; expected 0 to %ld",
                                              what, noun, value, (long)(count - 1)].UTF8String;
    return false;
  }
  *out = (NSInteger)d;
  return true;
}

// 状态参数：字符串数组 → UIControlState。和 UIButton 那一组用的是同一张表
static bool StateValue(NSString* what, id value, UIControlState* out, std::string* error) {
  id bad = nil;
  if (ControlStateArgFromNames(value, out, &bad)) return true;
  *error = bad != nil
               ? EnumError(what, bad, NamesForControlStateArg())
               : [NSString stringWithFormat:
                     @"%@ needs an array of state names; expected any of: %@", what,
                     NamesForControlStateArg()].UTF8String;
  return false;
}

// 图片参数。可以是 null；给了对象就得是 UIImage，不是就填报错——不当 nil 吞掉。
// 返回 true 表示值可用
static bool imageArg(const NacreArgs& args, size_t i, NSString* sel, UIImage* __strong* out,
                     std::string* error) {
  id given = args.object(i);
  // 对象位在标量那一路里是 null。那一路里有东西，说明 JS 给的不是原生对象
  // （字符串、数字、普通对象）——那不是「没有图」，是给错了
  id scalar = args.value(i);
  BOOL isNull = given == nil && (scalar == nil || scalar == NSNull.null);
  if (isNull || [given isKindOfClass:UIImage.class]) {
    *out = given;
    return true;
  }
  NSString* first = [sel componentsSeparatedByString:@":"].firstObject;
  ObjectTypeError(first.UTF8String, "UIImage", true, error);
  return false;
}

// 写对象属性时的取值。NACRE_OBJECT_OR_NIL 在这里用不了：它失败时写的是
// `return;`，而登记域的这条通道返回 bool。返回 true 表示值可用
static bool ObjectOrNil(id value, Class cls, const char* className, const std::string& name,
                        std::string* error) {
  if (value == nil || [value isKindOfClass:cls]) return true;
  ObjectTypeError(name, className, true, error);
  return false;
}

// 倒计时和年月这两种模式只有滚轮样式
static bool WheelsOnly(UIDatePickerMode mode) {
  return mode == UIDatePickerModeCountDownTimer || mode == UIDatePickerModeYearAndMonth;
}
static bool NotWheels(UIDatePickerStyle style) {
  return style == UIDatePickerStyleCompact || style == UIDatePickerStyleInline;
}

// ---- 标量属性：读 ----

static id ReadSwitchProperty(id object, NSString* key) {
  UISwitch* sw = (UISwitch*)object;
  if ([key isEqualToString:@"isOn"]) return @(sw.isOn);
  return nil;
}

static id ReadSliderProperty(id object, NSString* key) {
  UISlider* slider = (UISlider*)object;
  // float 转成 double 再给：0.3 读回来是 0.30000001192092896，和 UIView.alpha
  // 一样把「原生是单精度」这个事实原样交出去
  if ([key isEqualToString:@"value"]) return @((double)slider.value);
  if ([key isEqualToString:@"minimumValue"]) return @((double)slider.minimumValue);
  if ([key isEqualToString:@"maximumValue"]) return @((double)slider.maximumValue);
  if ([key isEqualToString:@"isContinuous"]) return @(slider.isContinuous);
  if ([key isEqualToString:@"sliderStyle"]) return NameForSliderStyle(slider.sliderStyle);
  return nil;
}

static id ReadStepperProperty(id object, NSString* key) {
  UIStepper* stepper = (UIStepper*)object;
  if ([key isEqualToString:@"value"]) return @(stepper.value);
  if ([key isEqualToString:@"minimumValue"]) return @(stepper.minimumValue);
  if ([key isEqualToString:@"maximumValue"]) return @(stepper.maximumValue);
  if ([key isEqualToString:@"stepValue"]) return @(stepper.stepValue);
  if ([key isEqualToString:@"isContinuous"]) return @(stepper.isContinuous);
  if ([key isEqualToString:@"autorepeat"]) return @(stepper.autorepeat);
  if ([key isEqualToString:@"wraps"]) return @(stepper.wraps);
  return nil;
}

static id ReadSegmentedProperty(id object, NSString* key) {
  UISegmentedControl* seg = (UISegmentedControl*)object;
  if ([key isEqualToString:@"numberOfSegments"]) return @(seg.numberOfSegments);
  if ([key isEqualToString:@"selectedSegmentIndex"]) {
    // 「没有选中的」在头文件里是 -1（UISegmentedControlNoSegment）。实测删掉
    // 选中的那一段之后读出来是 -2，所以负数一律归成 -1
    NSInteger index = seg.selectedSegmentIndex;
    return @(index < 0 ? -1 : index);
  }
  if ([key isEqualToString:@"isMomentary"]) return @(seg.isMomentary);
  if ([key isEqualToString:@"apportionsSegmentWidthsByContent"]) {
    return @(seg.apportionsSegmentWidthsByContent);
  }
  return nil;
}

static id ReadPageControlProperty(id object, NSString* key) {
  UIPageControl* pages = (UIPageControl*)object;
  if ([key isEqualToString:@"numberOfPages"]) return @(pages.numberOfPages);
  if ([key isEqualToString:@"currentPage"]) return @(pages.currentPage);
  if ([key isEqualToString:@"hidesForSinglePage"]) return @(pages.hidesForSinglePage);
  if ([key isEqualToString:@"allowsContinuousInteraction"]) {
    return @(pages.allowsContinuousInteraction);
  }
  if ([key isEqualToString:@"backgroundStyle"]) {
    return NameForPageControlBackgroundStyle(pages.backgroundStyle);
  }
  if ([key isEqualToString:@"direction"]) return NameForPageControlDirection(pages.direction);
  if ([key isEqualToString:@"interactionState"]) {
    return NameForPageControlInteractionState(pages.interactionState);
  }
  return nil;
}

static id ReadDatePickerProperty(id object, NSString* key) {
  UIDatePicker* picker = (UIDatePicker*)object;
  if ([key isEqualToString:@"date"]) return DateToJSON(picker.date);
  if ([key isEqualToString:@"minimumDate"]) return DateToJSON(picker.minimumDate);
  if ([key isEqualToString:@"maximumDate"]) return DateToJSON(picker.maximumDate);
  if ([key isEqualToString:@"datePickerMode"]) return NameForDatePickerMode(picker.datePickerMode);
  if ([key isEqualToString:@"preferredDatePickerStyle"]) {
    return NameForDatePickerStyle(picker.preferredDatePickerStyle);
  }
  if ([key isEqualToString:@"datePickerStyle"]) {
    return NameForDatePickerStyle(picker.datePickerStyle);
  }
  if ([key isEqualToString:@"countDownDuration"]) return @(picker.countDownDuration);
  if ([key isEqualToString:@"minuteInterval"]) return @(picker.minuteInterval);
  if ([key isEqualToString:@"roundsToMinuteInterval"]) return @(picker.roundsToMinuteInterval);
  return nil;
}

static id ReadValueControlsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UISwitch.class]) return ReadSwitchProperty(object, key);
  if ([object isKindOfClass:UISlider.class]) return ReadSliderProperty(object, key);
  if ([object isKindOfClass:UIStepper.class]) return ReadStepperProperty(object, key);
  if ([object isKindOfClass:UISegmentedControl.class]) return ReadSegmentedProperty(object, key);
  if ([object isKindOfClass:UIPageControl.class]) return ReadPageControlProperty(object, key);
  if ([object isKindOfClass:UIDatePicker.class]) return ReadDatePickerProperty(object, key);
  return nil;
}

// ---- 标量属性：写 ----

static BOOL WriteSwitchProperty(id object, NSString* key, id value, std::string* error) {
  UISwitch* sw = (UISwitch*)object;
  if ([key isEqualToString:@"isOn"]) { sw.on = NACRE_BOOL(value, key); return YES; }
  return NO;
}

static BOOL WriteSliderProperty(id object, NSString* key, id value, std::string* error) {
  UISlider* slider = (UISlider*)object;
  if ([key isEqualToString:@"value"]) {
    slider.value = ToFloat(NACRE_NUM(value, key));
    return YES;
  }
  // 实测：下限写得比上限大（或者反过来）UIKit 不报错，把另一头拉到一样
  if ([key isEqualToString:@"minimumValue"]) {
    slider.minimumValue = ToFloat(NACRE_NUM(value, key));
    return YES;
  }
  if ([key isEqualToString:@"maximumValue"]) {
    slider.maximumValue = ToFloat(NACRE_NUM(value, key));
    return YES;
  }
  if ([key isEqualToString:@"isContinuous"]) {
    slider.continuous = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"sliderStyle"]) {
    UISliderStyle style;
    if (!SliderStyleFromName(value, &style)) {
      *error = EnumError(key, value, NamesForSliderStyle());
      return YES;
    }
    slider.sliderStyle = style;
    return YES;
  }
  return NO;
}

static BOOL WriteStepperProperty(id object, NSString* key, id value, std::string* error) {
  UIStepper* stepper = (UIStepper*)object;
  if ([key isEqualToString:@"value"]) { stepper.value = NACRE_NUM(value, key); return YES; }
  // 头文件说下限必须小于上限。实测不是：不报错，另一头被拉到一样
  if ([key isEqualToString:@"minimumValue"]) {
    stepper.minimumValue = NACRE_NUM(value, key);
    return YES;
  }
  if ([key isEqualToString:@"maximumValue"]) {
    stepper.maximumValue = NACRE_NUM(value, key);
    return YES;
  }
  if ([key isEqualToString:@"stepValue"]) {
    double step = NACRE_NUM(value, key);
    // 实测：0 和负数 UIKit 抛 NSInvalidArgumentException
    if (step <= 0) {
      *error = [NSString stringWithFormat:@"stepValue must be greater than 0, got %@", value]
                   .UTF8String;
      return YES;
    }
    stepper.stepValue = step;
    return YES;
  }
  if ([key isEqualToString:@"isContinuous"]) {
    stepper.continuous = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"autorepeat"]) {
    stepper.autorepeat = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"wraps"]) { stepper.wraps = NACRE_BOOL(value, key); return YES; }
  return NO;
}

static BOOL WriteSegmentedProperty(id object, NSString* key, id value, std::string* error) {
  UISegmentedControl* seg = (UISegmentedControl*)object;
  if ([key isEqualToString:@"selectedSegmentIndex"]) {
    NSInteger index = NACRE_INT(value, key);
    // 实测：越界的下标 UIKit 什么都不做也不报错，-2 这类负数还会被原样存下来
    NSInteger count = (NSInteger)seg.numberOfSegments;
    if (index < -1 || index >= count) {
      *error = count == 0
                   ? [NSString stringWithFormat:
                         @"selectedSegmentIndex %ld is out of range; there are no segments, "
                         @"so only -1 (none selected) is allowed", (long)index].UTF8String
                   : [NSString stringWithFormat:
                         @"selectedSegmentIndex %ld is out of range; expected 0 to %ld, "
                         @"or -1 for none selected", (long)index, (long)(count - 1)].UTF8String;
      return YES;
    }
    seg.selectedSegmentIndex = index;
    return YES;
  }
  if ([key isEqualToString:@"isMomentary"]) {
    seg.momentary = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"apportionsSegmentWidthsByContent"]) {
    seg.apportionsSegmentWidthsByContent = NACRE_BOOL(value, key);
    return YES;
  }
  return NO;
}

static BOOL WritePageControlProperty(id object, NSString* key, id value, std::string* error) {
  UIPageControl* pages = (UIPageControl*)object;
  if ([key isEqualToString:@"numberOfPages"]) {
    // 实测：负数 UIKit 当成 0。和手势的次数一样，负的个数直接拒
    NSInteger count = 0;
    if (CountValue(key, value, &count, error)) pages.numberOfPages = count;
    return YES;
  }
  // 越界的页码 UIKit 钉到 0 和最后一页之间（头文件写明的行为），不拦
  if ([key isEqualToString:@"currentPage"]) {
    pages.currentPage = NACRE_INT(value, key);
    return YES;
  }
  if ([key isEqualToString:@"hidesForSinglePage"]) {
    pages.hidesForSinglePage = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"allowsContinuousInteraction"]) {
    pages.allowsContinuousInteraction = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"backgroundStyle"]) {
    UIPageControlBackgroundStyle style;
    if (!PageControlBackgroundStyleFromName(value, &style)) {
      *error = EnumError(key, value, NamesForPageControlBackgroundStyle());
      return YES;
    }
    pages.backgroundStyle = style;
    return YES;
  }
  if ([key isEqualToString:@"direction"]) {
    UIPageControlDirection direction;
    if (!PageControlDirectionFromName(value, &direction)) {
      *error = EnumError(key, value, NamesForPageControlDirection());
      return YES;
    }
    pages.direction = direction;
    return YES;
  }
  return NO;
}

static BOOL WriteDatePickerProperty(id object, NSString* key, id value, std::string* error) {
  UIDatePicker* picker = (UIDatePicker*)object;
  if ([key isEqualToString:@"date"]) {
    NSDate* date = nil;
    if (DateValue(key, value, &date, error)) picker.date = date;
    return YES;
  }
  if ([key isEqualToString:@"minimumDate"]) {
    NSDate* date = nil;
    if (value == nil) {
      picker.minimumDate = nil;
    } else if (DateValue(key, value, &date, error)) {
      picker.minimumDate = date;
    }
    return YES;
  }
  if ([key isEqualToString:@"maximumDate"]) {
    NSDate* date = nil;
    if (value == nil) {
      picker.maximumDate = nil;
    } else if (DateValue(key, value, &date, error)) {
      picker.maximumDate = date;
    }
    return YES;
  }
  // 倒计时和年月只有滚轮样式。实测：配上 compact 或 inline，UIKit 抛
  // NSInternalInconsistencyException，先写模式还是先写样式都一样。
  // 所以两个属性各拦一半
  if ([key isEqualToString:@"datePickerMode"]) {
    UIDatePickerMode mode;
    if (!DatePickerModeFromName(value, &mode)) {
      *error = EnumError(key, value, NamesForDatePickerMode());
      return YES;
    }
    if (WheelsOnly(mode) && NotWheels(picker.preferredDatePickerStyle)) {
      *error = [NSString stringWithFormat:
                   @"datePickerMode \"%@\" only works with the wheels style, but "
                   @"preferredDatePickerStyle is \"%@\"; set it to \"wheels\" or "
                   @"\"automatic\" first", value,
                   NameForDatePickerStyle(picker.preferredDatePickerStyle)].UTF8String;
      return YES;
    }
    picker.datePickerMode = mode;
    return YES;
  }
  if ([key isEqualToString:@"preferredDatePickerStyle"]) {
    UIDatePickerStyle style;
    if (!DatePickerStyleFromName(value, &style)) {
      *error = EnumError(key, value, NamesForDatePickerStyle());
      return YES;
    }
    if (NotWheels(style) && WheelsOnly(picker.datePickerMode)) {
      *error = [NSString stringWithFormat:
                   @"preferredDatePickerStyle \"%@\" does not support datePickerMode \"%@\"; "
                   @"that mode only works with \"wheels\" or \"automatic\"", value,
                   NameForDatePickerMode(picker.datePickerMode)].UTF8String;
      return YES;
    }
    picker.preferredDatePickerStyle = style;
    return YES;
  }
  if ([key isEqualToString:@"countDownDuration"]) {
    double seconds = NACRE_NUM(value, key);
    // 实测：别的模式下写它，UIKit 直接丢掉（写 300 读回来是 0，之后切到
    // 倒计时模式也找不回来）
    if (picker.datePickerMode != UIDatePickerModeCountDownTimer) {
      *error = [NSString stringWithFormat:
                   @"countDownDuration can only be set while datePickerMode is "
                   @"\"countDownTimer\"; it is \"%@\"",
                   NameForDatePickerMode(picker.datePickerMode)].UTF8String;
      return YES;
    }
    // 实测：超出范围时 UIKit 不报错，悄悄变成 60。上限是头文件写的 23:59
    if (seconds < 0 || seconds > 86399) {
      *error = [NSString stringWithFormat:
                   @"countDownDuration must be between 0 and 86399 seconds, got %@", value]
                   .UTF8String;
      return YES;
    }
    picker.countDownDuration = seconds;
    return YES;
  }
  if ([key isEqualToString:@"minuteInterval"]) {
    NSInteger interval = NACRE_INT(value, key);
    // 实测：不合法的间隔 UIKit 什么都不做也不报错。规则是头文件写的：
    // 能整除 60，最小 1，最大 30
    if (interval < 1 || interval > 30 || 60 % interval != 0) {
      *error = [NSString stringWithFormat:
                   @"minuteInterval must divide 60 evenly and be between 1 and 30, got %ld",
                   (long)interval].UTF8String;
      return YES;
    }
    picker.minuteInterval = interval;
    return YES;
  }
  if ([key isEqualToString:@"roundsToMinuteInterval"]) {
    picker.roundsToMinuteInterval = NACRE_BOOL(value, key);
    return YES;
  }
  return NO;
}

static BOOL WriteValueControlsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UISwitch.class]) return WriteSwitchProperty(object, key, value, error);
  if ([object isKindOfClass:UISlider.class]) return WriteSliderProperty(object, key, value, error);
  if ([object isKindOfClass:UIStepper.class]) {
    return WriteStepperProperty(object, key, value, error);
  }
  if ([object isKindOfClass:UISegmentedControl.class]) {
    return WriteSegmentedProperty(object, key, value, error);
  }
  if ([object isKindOfClass:UIPageControl.class]) {
    return WritePageControlProperty(object, key, value, error);
  }
  if ([object isKindOfClass:UIDatePicker.class]) {
    return WriteDatePickerProperty(object, key, value, error);
  }
  return NO;
}

// ---- 对象属性：颜色和图 ----
// 颜色在 JS 那一侧是字符串，过桥的是 UIColor 对象（和 UIView.backgroundColor
// 同一条路）。这些属性在 ObjC 里都可空：null 是「用系统默认的」

static nacre::NativeObjectRef ReadValueControlsObjectProperty(id object,
                                                              const std::string& name) {
  if ([object isKindOfClass:UISwitch.class]) {
    UISwitch* sw = (UISwitch*)object;
    if (name == "onTintColor") return {NacreKeep(sw.onTintColor), "UIColor"};
    if (name == "thumbTintColor") return {NacreKeep(sw.thumbTintColor), "UIColor"};
  }
  if ([object isKindOfClass:UISlider.class]) {
    UISlider* slider = (UISlider*)object;
    if (name == "minimumTrackTintColor") {
      return {NacreKeep(slider.minimumTrackTintColor), "UIColor"};
    }
    if (name == "maximumTrackTintColor") {
      return {NacreKeep(slider.maximumTrackTintColor), "UIColor"};
    }
    if (name == "thumbTintColor") return {NacreKeep(slider.thumbTintColor), "UIColor"};
    if (name == "minimumValueImage") return {NacreKeep(slider.minimumValueImage), "UIImage"};
    if (name == "maximumValueImage") return {NacreKeep(slider.maximumValueImage), "UIImage"};
    if (name == "currentThumbImage") return {NacreKeep(slider.currentThumbImage), "UIImage"};
    if (name == "currentMinimumTrackImage") {
      return {NacreKeep(slider.currentMinimumTrackImage), "UIImage"};
    }
    if (name == "currentMaximumTrackImage") {
      return {NacreKeep(slider.currentMaximumTrackImage), "UIImage"};
    }
  }
  if ([object isKindOfClass:UISegmentedControl.class]) {
    UISegmentedControl* seg = (UISegmentedControl*)object;
    if (name == "selectedSegmentTintColor") {
      return {NacreKeep(seg.selectedSegmentTintColor), "UIColor"};
    }
  }
  if ([object isKindOfClass:UIPageControl.class]) {
    UIPageControl* pages = (UIPageControl*)object;
    if (name == "pageIndicatorTintColor") {
      return {NacreKeep(pages.pageIndicatorTintColor), "UIColor"};
    }
    if (name == "currentPageIndicatorTintColor") {
      return {NacreKeep(pages.currentPageIndicatorTintColor), "UIColor"};
    }
    if (name == "preferredIndicatorImage") {
      return {NacreKeep(pages.preferredIndicatorImage), "UIImage"};
    }
    if (name == "preferredCurrentPageIndicatorImage") {
      return {NacreKeep(pages.preferredCurrentPageIndicatorImage), "UIImage"};
    }
  }
  return {};
}

static bool WriteValueControlsObjectProperty(id object, const std::string& name, id value,
                                             std::string* error) {
  Class color = UIColor.class;
  Class image = UIImage.class;
  if ([object isKindOfClass:UISwitch.class]) {
    UISwitch* sw = (UISwitch*)object;
    if (name == "onTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) sw.onTintColor = value;
      return true;
    }
    if (name == "thumbTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) sw.thumbTintColor = value;
      return true;
    }
  }
  if ([object isKindOfClass:UISlider.class]) {
    UISlider* slider = (UISlider*)object;
    if (name == "minimumTrackTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) slider.minimumTrackTintColor = value;
      return true;
    }
    if (name == "maximumTrackTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) slider.maximumTrackTintColor = value;
      return true;
    }
    if (name == "thumbTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) slider.thumbTintColor = value;
      return true;
    }
    if (name == "minimumValueImage") {
      if (ObjectOrNil(value, image, "UIImage", name, error)) slider.minimumValueImage = value;
      return true;
    }
    if (name == "maximumValueImage") {
      if (ObjectOrNil(value, image, "UIImage", name, error)) slider.maximumValueImage = value;
      return true;
    }
  }
  if ([object isKindOfClass:UISegmentedControl.class]) {
    UISegmentedControl* seg = (UISegmentedControl*)object;
    if (name == "selectedSegmentTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) seg.selectedSegmentTintColor = value;
      return true;
    }
  }
  if ([object isKindOfClass:UIPageControl.class]) {
    UIPageControl* pages = (UIPageControl*)object;
    if (name == "pageIndicatorTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) pages.pageIndicatorTintColor = value;
      return true;
    }
    if (name == "currentPageIndicatorTintColor") {
      if (ObjectOrNil(value, color, "UIColor", name, error)) {
        pages.currentPageIndicatorTintColor = value;
      }
      return true;
    }
    if (name == "preferredIndicatorImage") {
      if (ObjectOrNil(value, image, "UIImage", name, error)) pages.preferredIndicatorImage = value;
      return true;
    }
    if (name == "preferredCurrentPageIndicatorImage") {
      if (ObjectOrNil(value, image, "UIImage", name, error)) {
        pages.preferredCurrentPageIndicatorImage = value;
      }
      return true;
    }
  }
  return false;
}

// ---- 方法：返回标量或者没有返回值 ----
// 每个分支都带大括号：check-api.sh 是按 selector 后面的第一对大括号切分支体的

static bool SwitchCallMethod(UISwitch* sw, NSString* sel, const NacreArgs& args,
                             std::string* out, std::string* error) {
  if ([sel isEqualToString:@"setOn:animated:"]) {
    BOOL on = NACRE_BOOL(args.value(0), @"setOn");
    BOOL animated = NACRE_BOOL(args.value(1), @"animated");
    [sw setOn:on animated:animated];
    *out = "null";
    return true;
  }
  return false;
}

static bool SliderCallMethod(UISlider* slider, NSString* sel, const NacreArgs& args,
                             std::string* out, std::string* error) {
  if ([sel isEqualToString:@"setValue:animated:"]) {
    float value = ToFloat(NACRE_NUM(args.value(0), @"setValue"));
    BOOL animated = NACRE_BOOL(args.value(1), @"animated");
    [slider setValue:value animated:animated];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setThumbImage:forState:"]) {
    UIControlState state;
    UIImage* image = nil;
    if (StateValue(@"forState", args.value(1), &state, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [slider setThumbImage:image forState:state];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setMinimumTrackImage:forState:"]) {
    UIControlState state;
    UIImage* image = nil;
    if (StateValue(@"forState", args.value(1), &state, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [slider setMinimumTrackImage:image forState:state];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setMaximumTrackImage:forState:"]) {
    UIControlState state;
    UIImage* image = nil;
    if (StateValue(@"forState", args.value(1), &state, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [slider setMaximumTrackImage:image forState:state];
    }
    *out = "null";
    return true;
  }
  // 这四个在 ObjC 里是给子类覆写用的（覆写要等 M2），但直接调也有用：
  // 问「滑块现在画在哪」，好把一个气泡对到它上面
  if ([sel isEqualToString:@"trackRectForBounds:"]) {
    *out = EncodeJSON(RectToJSON([slider trackRectForBounds:JSONToRect(args.value(0))]));
    return true;
  }
  if ([sel isEqualToString:@"minimumValueImageRectForBounds:"]) {
    *out = EncodeJSON(
        RectToJSON([slider minimumValueImageRectForBounds:JSONToRect(args.value(0))]));
    return true;
  }
  if ([sel isEqualToString:@"maximumValueImageRectForBounds:"]) {
    *out = EncodeJSON(
        RectToJSON([slider maximumValueImageRectForBounds:JSONToRect(args.value(0))]));
    return true;
  }
  if ([sel isEqualToString:@"thumbRectForBounds:trackRect:value:"]) {
    float value = ToFloat(NACRE_NUM(args.value(2), @"value"));
    CGRect rect = [slider thumbRectForBounds:JSONToRect(args.value(0))
                                   trackRect:JSONToRect(args.value(1))
                                       value:value];
    *out = EncodeJSON(RectToJSON(rect));
    return true;
  }
  return false;
}

static bool SegmentedCallMethod(UISegmentedControl* seg, NSString* sel, const NacreArgs& args,
                                std::string* out, std::string* error) {
  NSInteger count = (NSInteger)seg.numberOfSegments;
  NSInteger index = 0;
  NSString* first = [sel componentsSeparatedByString:@":"].firstObject;

  // 插入的位置：头文件写明超过段数就插在最后（value pinned），所以只拦负数
  if ([sel isEqualToString:@"insertSegmentWithTitle:atIndex:animated:"]) {
    id title = args.value(0);
    BOOL animated = NACRE_BOOL(args.value(2), @"animated");
    if (CountValue(@"atIndex", args.value(1), &index, error)) {
      [seg insertSegmentWithTitle:[title isKindOfClass:NSString.class] ? title : nil
                          atIndex:(NSUInteger)index
                         animated:animated];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"insertSegmentWithImage:atIndex:animated:"]) {
    UIImage* image = nil;
    BOOL animated = NACRE_BOOL(args.value(2), @"animated");
    if (CountValue(@"atIndex", args.value(1), &index, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [seg insertSegmentWithImage:image atIndex:(NSUInteger)index animated:animated];
    }
    *out = "null";
    return true;
  }
  // 实测：越界的下标 UIKit 什么都不做也不报错
  if ([sel isEqualToString:@"removeSegmentAtIndex:animated:"]) {
    BOOL animated = NACRE_BOOL(args.value(1), @"animated");
    if (IndexValue(first, @"segment", args.value(0), count, &index, error)) {
      [seg removeSegmentAtIndex:(NSUInteger)index animated:animated];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeAllSegments"]) {
    [seg removeAllSegments];
    *out = "null";
    return true;
  }

  // 下面十个按段读写的方法，实测下标越界时 UIKit 抛 NSRangeException
  // （头文件说的是「忽略」），所以先查
  if ([sel isEqualToString:@"setTitle:forSegmentAtIndex:"]) {
    id title = args.value(0);
    if (IndexValue(first, @"segment", args.value(1), count, &index, error)) {
      [seg setTitle:[title isKindOfClass:NSString.class] ? title : nil
          forSegmentAtIndex:(NSUInteger)index];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"titleForSegmentAtIndex:"]) {
    *out = "null";
    if (IndexValue(first, @"segment", args.value(0), count, &index, error)) {
      *out = EncodeJSON([seg titleForSegmentAtIndex:(NSUInteger)index]);
    }
    return true;
  }
  if ([sel isEqualToString:@"setImage:forSegmentAtIndex:"]) {
    UIImage* image = nil;
    if (IndexValue(first, @"segment", args.value(1), count, &index, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [seg setImage:image forSegmentAtIndex:(NSUInteger)index];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setWidth:forSegmentAtIndex:"]) {
    double width = NACRE_NUM(args.value(0), @"setWidth");
    if (IndexValue(first, @"segment", args.value(1), count, &index, error)) {
      [seg setWidth:width forSegmentAtIndex:(NSUInteger)index];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"widthForSegmentAtIndex:"]) {
    *out = "null";
    if (IndexValue(first, @"segment", args.value(0), count, &index, error)) {
      *out = EncodeJSON(@([seg widthForSegmentAtIndex:(NSUInteger)index]));
    }
    return true;
  }
  if ([sel isEqualToString:@"setContentOffset:forSegmentAtIndex:"]) {
    if (IndexValue(first, @"segment", args.value(1), count, &index, error)) {
      [seg setContentOffset:JSONToSize(args.value(0)) forSegmentAtIndex:(NSUInteger)index];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"contentOffsetForSegmentAtIndex:"]) {
    *out = "null";
    if (IndexValue(first, @"segment", args.value(0), count, &index, error)) {
      *out = EncodeJSON(SizeToJSON([seg contentOffsetForSegmentAtIndex:(NSUInteger)index]));
    }
    return true;
  }
  if ([sel isEqualToString:@"setEnabled:forSegmentAtIndex:"]) {
    BOOL enabled = NACRE_BOOL(args.value(0), @"setEnabled");
    if (IndexValue(first, @"segment", args.value(1), count, &index, error)) {
      [seg setEnabled:enabled forSegmentAtIndex:(NSUInteger)index];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"isEnabledForSegmentAtIndex:"]) {
    *out = "null";
    if (IndexValue(first, @"segment", args.value(0), count, &index, error)) {
      *out = EncodeJSON(@([seg isEnabledForSegmentAtIndex:(NSUInteger)index]));
    }
    return true;
  }
  return false;
}

static bool PageControlCallMethod(UIPageControl* pages, NSString* sel, const NacreArgs& args,
                                  std::string* out, std::string* error) {
  NSInteger count = pages.numberOfPages;
  NSInteger page = 0;
  NSString* first = [sel componentsSeparatedByString:@":"].firstObject;

  // 实测：页码越界时 UIKit 抛 NSInternalInconsistencyException。头文件写的
  // 范围是 0..numberOfPages，实际最后一个合法的是 numberOfPages - 1
  if ([sel isEqualToString:@"setIndicatorImage:forPage:"]) {
    UIImage* image = nil;
    if (IndexValue(first, @"page", args.value(1), count, &page, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [pages setIndicatorImage:image forPage:page];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setCurrentPageIndicatorImage:forPage:"]) {
    UIImage* image = nil;
    if (IndexValue(first, @"page", args.value(1), count, &page, error) &&
        imageArg(args, 0, sel, &image, error)) {
      [pages setCurrentPageIndicatorImage:image forPage:page];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"sizeForNumberOfPages:"]) {
    // 实测：负数 UIKit 抛 NSInvalidArgumentException
    NSInteger wanted = 0;
    *out = "null";
    if (CountValue(first, args.value(0), &wanted, error)) {
      *out = EncodeJSON(SizeToJSON([pages sizeForNumberOfPages:wanted]));
    }
    return true;
  }
  return false;
}

static bool DatePickerCallMethod(UIDatePicker* picker, NSString* sel, const NacreArgs& args,
                                 std::string* out, std::string* error) {
  if ([sel isEqualToString:@"setDate:animated:"]) {
    NSDate* date = nil;
    BOOL animated = NACRE_BOOL(args.value(1), @"animated");
    if (DateValue(@"setDate", args.value(0), &date, error)) {
      [picker setDate:date animated:animated];
    }
    *out = "null";
    return true;
  }
  return false;
}

static bool ValueControlsCallMethod(id object, NSString* sel, const NacreArgs& args,
                                    std::string* out, std::string* error) {
  if ([object isKindOfClass:UISwitch.class]) {
    return SwitchCallMethod((UISwitch*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UISlider.class]) {
    return SliderCallMethod((UISlider*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UISegmentedControl.class]) {
    return SegmentedCallMethod((UISegmentedControl*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UIPageControl.class]) {
    return PageControlCallMethod((UIPageControl*)object, sel, args, out, error);
  }
  if ([object isKindOfClass:UIDatePicker.class]) {
    return DatePickerCallMethod((UIDatePicker*)object, sel, args, out, error);
  }
  return false;
}

// ---- 方法：返回原生对象（都是图）----

static bool ValueControlsCallObjectMethod(id object, NSString* sel, const NacreArgs& args,
                                          nacre::NativeObjectRef* out, std::string* error) {
  NSString* first = [sel componentsSeparatedByString:@":"].firstObject;
  if ([object isKindOfClass:UISlider.class]) {
    UISlider* slider = (UISlider*)object;
    BOOL wants = [sel isEqualToString:@"thumbImageForState:"] ||
                 [sel isEqualToString:@"minimumTrackImageForState:"] ||
                 [sel isEqualToString:@"maximumTrackImageForState:"];
    if (wants) {
      UIControlState state;
      if (!StateValue(@"state", args.value(0), &state, error)) return true;
      UIImage* image = nil;
      if ([sel isEqualToString:@"thumbImageForState:"]) {
        image = [slider thumbImageForState:state];
      } else if ([sel isEqualToString:@"minimumTrackImageForState:"]) {
        image = [slider minimumTrackImageForState:state];
      } else {
        image = [slider maximumTrackImageForState:state];
      }
      *out = {NacreKeep(image), "UIImage"};
      return true;
    }
  }
  if ([object isKindOfClass:UISegmentedControl.class]) {
    UISegmentedControl* seg = (UISegmentedControl*)object;
    if ([sel isEqualToString:@"imageForSegmentAtIndex:"]) {
      NSInteger index = 0;
      if (IndexValue(first, @"segment", args.value(0), (NSInteger)seg.numberOfSegments, &index,
                     error)) {
        *out = {NacreKeep([seg imageForSegmentAtIndex:(NSUInteger)index]), "UIImage"};
      }
      return true;
    }
  }
  if ([object isKindOfClass:UIPageControl.class]) {
    UIPageControl* pages = (UIPageControl*)object;
    BOOL wants = [sel isEqualToString:@"indicatorImageForPage:"] ||
                 [sel isEqualToString:@"currentPageIndicatorImageForPage:"];
    if (wants) {
      NSInteger page = 0;
      if (!IndexValue(first, @"page", args.value(0), pages.numberOfPages, &page, error)) {
        return true;
      }
      UIImage* image = [sel isEqualToString:@"indicatorImageForPage:"]
                           ? [pages indicatorImageForPage:page]
                           : [pages currentPageIndicatorImageForPage:page];
      *out = {NacreKeep(image), "UIImage"};
      return true;
    }
  }
  return false;
}

// ---- 构造 ----

static bool ValueControlsConstruct(const std::string& className, const NacreArgs& args,
                                   nacre::NativeObjectRef* out, std::string* error) {
  id made = nil;
  if (className == "UISwitch") {
    made = [[UISwitch alloc] init];
  } else if (className == "UISlider") {
    made = [[UISlider alloc] init];
  } else if (className == "UIStepper") {
    made = [[UIStepper alloc] init];
  } else if (className == "UIPageControl") {
    made = [[UIPageControl alloc] init];
  } else if (className == "UIDatePicker") {
    made = [[UIDatePicker alloc] init];
  } else if (className == "UISegmentedControl") {
    // initWithItems: 的每一项是字符串或者图。实测：混进别的东西（比如
    // NSNumber）UIKit 直接对它发 length，抛 unrecognized selector
    NSMutableArray* items = [NSMutableArray array];
    for (NSUInteger i = 0; i < args.values.count; i++) {
      id image = args.object(i);
      id text = args.value(i);
      if ([image isKindOfClass:UIImage.class]) {
        [items addObject:image];
      } else if (image == nil && [text isKindOfClass:NSString.class]) {
        [items addObject:text];
      } else {
        *error = [NSString stringWithFormat:
                     @"new UISegmentedControl: items[%lu] must be a string or a UIImage",
                     (unsigned long)i].UTF8String;
        return true;
      }
    }
    made = [[UISegmentedControl alloc] initWithItems:items];
  }
  if (made == nil) return false;
  *out = {NacreKeep(made), className};
  return true;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacreValueControlsDomain : NSObject
@end
@implementation NacreValueControlsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "value-controls";
  d.classes = {UISwitch.class, UISlider.class, UIStepper.class,
               UISegmentedControl.class, UIPageControl.class, UIDatePicker.class};
  d.read = nacre_bridge::ReadValueControlsProperty;
  d.write = nacre_bridge::WriteValueControlsProperty;
  d.readObject = nacre_bridge::ReadValueControlsObjectProperty;
  d.writeObject = nacre_bridge::WriteValueControlsObjectProperty;
  d.call = nacre_bridge::ValueControlsCallMethod;
  d.callObject = nacre_bridge::ValueControlsCallObjectMethod;
  d.construct = nacre_bridge::ValueControlsConstruct;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
