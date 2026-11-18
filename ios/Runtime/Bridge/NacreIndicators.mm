// 表示「正在进行」的两个视图：UIActivityIndicatorView（转圈）和
// UIProgressView（进度条）。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个域是**登记进来的**（文件末尾的 +load，见 NacreExtension.h 的
// NacreRegisterDomain），核心不认识它，所以函数全是 static。
//
// 两个类都是 UIView 的子类，不是 UIControl：没有事件，这里也就没有订阅。
// UIView 的那些成员（frame、isHidden、sizeToFit…）不在这里——这个域对不认识
// 的名字一律说「不认领」，分发器接着去问核心的视图域。
//
// 没接的：
//   - 两个带样式的初始化器（initWithActivityIndicatorStyle: /
//     initWithProgressViewStyle:）。它们和「init 之后再写样式」的差别只在
//     初始的 frame（实测：转圈 20×20 对 0×0，进度条宽 160 对 0），JS 那边
//     sizeToFit() 或者约束都拿得到同样的结果
//   - UIProgressView.observedProgress：要先有 NSProgress
//   - UIActivityIndicatorViewStyle 里 iOS 13 起废弃的三个值

#import "NacreBridge.h"

namespace nacre_bridge {

// 只有这两个。头文件里另外三个（WhiteLarge / White / Gray）从 iOS 13 起废弃，
// 实测写进去还会连颜色一起改掉，不接
NACRE_ENUM_MAP(ActivityIndicatorStyle, UIActivityIndicatorViewStyle,
               @"medium": @(UIActivityIndicatorViewStyleMedium),
               @"large": @(UIActivityIndicatorViewStyleLarge))

NACRE_ENUM_MAP(ProgressViewStyle, UIProgressViewStyle,
               @"default": @(UIProgressViewStyleDefault),
               @"bar": @(UIProgressViewStyleBar))

// ---- 构造 ----
// 都走 init。带样式的初始化器没接，理由见文件开头
static bool IndicatorsConstruct(const std::string& className, const NacreArgs& args,
                                nacre::NativeObjectRef* out, std::string* error) {
  if (className == "UIActivityIndicatorView") {
    *out = {NacreKeep([[UIActivityIndicatorView alloc] init]), className};
    return true;
  }
  if (className == "UIProgressView") {
    *out = {NacreKeep([[UIProgressView alloc] init]), className};
    return true;
  }
  return false;
}

// ---- 属性 ----
static id ReadIndicatorsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIActivityIndicatorView.class]) {
    UIActivityIndicatorView* spinner = (UIActivityIndicatorView*)object;
    if ([key isEqualToString:@"activityIndicatorViewStyle"]) {
      // 废弃的那三个值从 JS 写不进去，所以这里读不到表外的值
      return NameForActivityIndicatorStyle(spinner.activityIndicatorViewStyle) ?: @"medium";
    }
    if ([key isEqualToString:@"hidesWhenStopped"]) return @(spinner.hidesWhenStopped);
    if ([key isEqualToString:@"isAnimating"]) return @(spinner.isAnimating);
    return nil;
  }
  if ([object isKindOfClass:UIProgressView.class]) {
    UIProgressView* bar = (UIProgressView*)object;
    if ([key isEqualToString:@"progressViewStyle"]) {
      return NameForProgressViewStyle(bar.progressViewStyle) ?: @"default";
    }
    // 原生存的是 float。先转成 double 再交出去：JS 那边读到的就是这个
    // 32 位数的精确值（0.3 读回来是 0.30000001192092896），和
    // Math.fround(0.3) 相等，不依赖 JSON 编码怎么写 float
    if ([key isEqualToString:@"progress"]) return @((double)bar.progress);
    return nil;
  }
  return nil;
}

static BOOL WriteIndicatorsProperty(id object, NSString* key, id value,
                                    std::string* error) {
  if ([object isKindOfClass:UIActivityIndicatorView.class]) {
    UIActivityIndicatorView* spinner = (UIActivityIndicatorView*)object;
    if ([key isEqualToString:@"activityIndicatorViewStyle"]) {
      UIActivityIndicatorViewStyle style;
      if (!ActivityIndicatorStyleFromName(value, &style)) {
        *error = EnumError(key, value, NamesForActivityIndicatorStyle());
        return YES;
      }
      spinner.activityIndicatorViewStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"hidesWhenStopped"]) {
      spinner.hidesWhenStopped = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UIProgressView.class]) {
    UIProgressView* bar = (UIProgressView*)object;
    if ([key isEqualToString:@"progressViewStyle"]) {
      UIProgressViewStyle style;
      if (!ProgressViewStyleFromName(value, &style)) {
        *error = EnumError(key, value, NamesForProgressViewStyle());
        return YES;
      }
      bar.progressViewStyle = style;
      return YES;
    }
    // 0 到 1 之外的值不拒：头文件写明「values outside are pinned」，
    // 实测也是收到两端。这是平台自己定的范围处理，照它的
    if ([key isEqualToString:@"progress"]) {
      bar.progress = (float)NACRE_NUM(value, key);
      return YES;
    }
    return NO;
  }
  return NO;
}

// ---- 对象属性：颜色和图片 ----
// 颜色在 JS 那一侧是字符串，过桥的是 UIColor 对象（字符串在 JS 里解析、
// 池化，见 16-color.js），所以走的是对象通道
static nacre::NativeObjectRef ReadIndicatorsObjectProperty(id object,
                                                           const std::string& name) {
  if ([object isKindOfClass:UIActivityIndicatorView.class]) {
    // null_resettable：读出来永远有值，没设过就是系统的默认色
    if (name == "color") {
      return {NacreKeep(((UIActivityIndicatorView*)object).color), "UIColor"};
    }
    return {};
  }
  if ([object isKindOfClass:UIProgressView.class]) {
    UIProgressView* bar = (UIProgressView*)object;
    if (name == "progressTintColor") return {NacreKeep(bar.progressTintColor), "UIColor"};
    if (name == "trackTintColor") return {NacreKeep(bar.trackTintColor), "UIColor"};
    if (name == "progressImage") return {NacreKeep(bar.progressImage), "UIImage"};
    if (name == "trackImage") return {NacreKeep(bar.trackImage), "UIImage"};
    return {};
  }
  return {};
}

// 对象值的取法。照 Web IDL：对象不转换，nil 可以（这几个属性都可空），
// 给了对象就得是要求的那个类。返回 false 表示类型不对，error 已经填好。
// 核心里同样用途的宏 NACRE_OBJECT_OR_NIL 是给返回 void 的函数写的
// （它失败时 `return;`），这条通道返回 bool，用不了
static bool TypedOrNil(id value, Class cls, const char* className, const std::string& name,
                       std::string* error) {
  if (value == nil || [value isKindOfClass:cls]) return true;
  ObjectTypeError(name, className, true, error);
  return false;
}

static bool WriteIndicatorsObjectProperty(id object, const std::string& name, id value,
                                          std::string* error) {
  if ([object isKindOfClass:UIActivityIndicatorView.class]) {
    if (name == "color") {
      // 写 nil 是退回默认色，不是「没有颜色」
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        ((UIActivityIndicatorView*)object).color = (UIColor*)value;
      }
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UIProgressView.class]) {
    UIProgressView* bar = (UIProgressView*)object;
    if (name == "progressTintColor") {
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        bar.progressTintColor = (UIColor*)value;
      }
      return true;
    }
    if (name == "trackTintColor") {
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        bar.trackTintColor = (UIColor*)value;
      }
      return true;
    }
    if (name == "progressImage") {
      if (TypedOrNil(value, UIImage.class, "UIImage", name, error)) {
        bar.progressImage = (UIImage*)value;
      }
      return true;
    }
    if (name == "trackImage") {
      if (TypedOrNil(value, UIImage.class, "UIImage", name, error)) {
        bar.trackImage = (UIImage*)value;
      }
      return true;
    }
    return false;
  }
  return false;
}

// ---- 方法 ----
static bool IndicatorsCallMethod(id object, NSString* sel, const NacreArgs& args,
                                 std::string* out, std::string* error) {
  if ([object isKindOfClass:UIActivityIndicatorView.class]) {
    UIActivityIndicatorView* spinner = (UIActivityIndicatorView*)object;
    if ([sel isEqualToString:@"startAnimating"]) {
      [spinner startAnimating];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"stopAnimating"]) {
      [spinner stopAnimating];
      *out = "null";
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UIProgressView.class]) {
    if ([sel isEqualToString:@"setProgress:animated:"]) {
      *out = "null";
      float progress = (float)NACRE_NUM(args.value(0), @"progress");
      BOOL animated = NACRE_BOOL(args.value(1), @"animated");
      [(UIProgressView*)object setProgress:progress animated:animated];
      return true;
    }
    return false;
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacreIndicatorsDomain : NSObject
@end
@implementation NacreIndicatorsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "indicators";
  d.classes = {UIActivityIndicatorView.class, UIProgressView.class};
  d.read = nacre_bridge::ReadIndicatorsProperty;
  d.write = nacre_bridge::WriteIndicatorsProperty;
  d.readObject = nacre_bridge::ReadIndicatorsObjectProperty;
  d.writeObject = nacre_bridge::WriteIndicatorsObjectProperty;
  d.call = nacre_bridge::IndicatorsCallMethod;
  d.construct = nacre_bridge::IndicatorsConstruct;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
