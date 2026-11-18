// 毛玻璃：UIVisualEffectView，和它显示的效果——UIVisualEffect（基类）、
// UIBlurEffect、UIVibrancyEffect、UIGlassEffect、UIGlassContainerEffect。
//
// 一个域一个文件，每个入口返回「认不认领」。这个域是**登记进来的**
// （文件末尾的 +load，见 NacreExtension.h 的 NacreRegisterDomain），核心不
// 认识它，所以函数全是 static。
//
// 几条量出来的事实（iPhone Air 模拟器，iOS 27.2），下面的写法都是照它们来的：
//
//   - 模糊和鲜明是不可变的：copy 返回自己，赋给视图再读回来是同一个指针。
//     玻璃和玻璃容器带可写的属性：视图的 effect 是 copy 语义，存的是赋值
//     那一刻的副本，**每次读 effect 给的又是一个新对象**。所以读回来按类
//     现包一个，不去找「写进去的那个」——那个对象之后可以被改得和视图里的
//     不一样，拿它冒充读回来的值就是给错答案。
//   - 直接往效果视图上 addSubview / insertSubview，UIKit 抛
//     NSInternalInconsistencyException（没有效果的视图也一样）。这里在调用
//     之前拦掉，给一句指到 contentView 的报错，不靠入口的异常保底。
//   - contentView 是惰性建的（没读过它的玻璃视图 subviews 是空的），建出来
//     之后换效果、清效果都还是同一个。
//
// 没做的：UIColorEffect（它唯一的工厂方法 +effectWithColor: 是 iOS 26.1
// 才有的，而最低版本是 26.0）。

#import "NacreBridge.h"

namespace nacre_bridge {

// 没有 extraDark：头文件里它标着 API_UNAVAILABLE(ios)，只有 tvOS 有。
// 这张表里没有别名，也没有已废弃的值
NACRE_ENUM_MAP(BlurEffectStyle, UIBlurEffectStyle,
               @"extraLight": @(UIBlurEffectStyleExtraLight),
               @"light": @(UIBlurEffectStyleLight),
               @"dark": @(UIBlurEffectStyleDark),
               @"regular": @(UIBlurEffectStyleRegular),
               @"prominent": @(UIBlurEffectStyleProminent),
               @"systemUltraThinMaterial": @(UIBlurEffectStyleSystemUltraThinMaterial),
               @"systemThinMaterial": @(UIBlurEffectStyleSystemThinMaterial),
               @"systemMaterial": @(UIBlurEffectStyleSystemMaterial),
               @"systemThickMaterial": @(UIBlurEffectStyleSystemThickMaterial),
               @"systemChromeMaterial": @(UIBlurEffectStyleSystemChromeMaterial),
               @"systemUltraThinMaterialLight": @(UIBlurEffectStyleSystemUltraThinMaterialLight),
               @"systemThinMaterialLight": @(UIBlurEffectStyleSystemThinMaterialLight),
               @"systemMaterialLight": @(UIBlurEffectStyleSystemMaterialLight),
               @"systemThickMaterialLight": @(UIBlurEffectStyleSystemThickMaterialLight),
               @"systemChromeMaterialLight": @(UIBlurEffectStyleSystemChromeMaterialLight),
               @"systemUltraThinMaterialDark": @(UIBlurEffectStyleSystemUltraThinMaterialDark),
               @"systemThinMaterialDark": @(UIBlurEffectStyleSystemThinMaterialDark),
               @"systemMaterialDark": @(UIBlurEffectStyleSystemMaterialDark),
               @"systemThickMaterialDark": @(UIBlurEffectStyleSystemThickMaterialDark),
               @"systemChromeMaterialDark": @(UIBlurEffectStyleSystemChromeMaterialDark))

NACRE_ENUM_MAP(VibrancyEffectStyle, UIVibrancyEffectStyle,
               @"label": @(UIVibrancyEffectStyleLabel),
               @"secondaryLabel": @(UIVibrancyEffectStyleSecondaryLabel),
               @"tertiaryLabel": @(UIVibrancyEffectStyleTertiaryLabel),
               @"quaternaryLabel": @(UIVibrancyEffectStyleQuaternaryLabel),
               @"fill": @(UIVibrancyEffectStyleFill),
               @"secondaryFill": @(UIVibrancyEffectStyleSecondaryFill),
               @"tertiaryFill": @(UIVibrancyEffectStyleTertiaryFill),
               @"separator": @(UIVibrancyEffectStyleSeparator))

NACRE_ENUM_MAP(GlassEffectStyle, UIGlassEffectStyle,
               @"regular": @(UIGlassEffectStyleRegular),
               @"clear": @(UIGlassEffectStyleClear))

// 读回来的效果没有现成包装时，用哪个 JS 类包它
static const char* EffectClassName(UIVisualEffect* effect) {
  if ([effect isKindOfClass:UIBlurEffect.class]) return "UIBlurEffect";
  if ([effect isKindOfClass:UIVibrancyEffect.class]) return "UIVibrancyEffect";
  if ([effect isKindOfClass:UIGlassEffect.class]) return "UIGlassEffect";
  if ([effect isKindOfClass:UIGlassContainerEffect.class]) return "UIGlassContainerEffect";
  return "UIVisualEffect";
}

// ---- 工厂（类方法）----
static bool EffectsClassCall(const std::string& className, NSString* sel,
                             const NacreArgs& args, nacre::NativeObjectRef* out,
                             std::string* error) {
  if (className == "UIBlurEffect" && [sel isEqualToString:@"effectWithStyle:"]) {
    id given = args.value(0);
    UIBlurEffectStyle style;
    if (!BlurEffectStyleFromName(given, &style)) {
      *error = EnumError(@"style", given, NamesForBlurEffectStyle());
      return true;
    }
    *out = {NacreKeep([UIBlurEffect effectWithStyle:style]), "UIBlurEffect"};
    return true;
  }
  if (className == "UIGlassEffect" && [sel isEqualToString:@"effectWithStyle:"]) {
    id given = args.value(0);
    UIGlassEffectStyle style;
    if (!GlassEffectStyleFromName(given, &style)) {
      *error = EnumError(@"style", given, NamesForGlassEffectStyle());
      return true;
    }
    *out = {NacreKeep([UIGlassEffect effectWithStyle:style]), "UIGlassEffect"};
    return true;
  }
  // 鲜明效果要照着一个模糊效果来建。建完之后读不回那个模糊效果（头文件里
  // 没有这样的属性），所以 JS 那一侧没有可记的所有权边
  // nacre:ownership-exempt effectForBlurEffect: —— 建完读不回来，没有要保住身份的边
  // nacre:ownership-exempt effectForBlurEffect:style: —— 同上
  if (className == "UIVibrancyEffect" &&
      ([sel isEqualToString:@"effectForBlurEffect:"] ||
       [sel isEqualToString:@"effectForBlurEffect:style:"])) {
    id given = args.object(0);
    // 实测传 nil 不崩、给一个没有依据的效果；这里不放它过去
    if (![given isKindOfClass:UIBlurEffect.class]) {
      *error = "effectForBlurEffect needs a UIBlurEffect";
      return true;
    }
    UIBlurEffect* blur = (UIBlurEffect*)given;
    if ([sel isEqualToString:@"effectForBlurEffect:"]) {
      *out = {NacreKeep([UIVibrancyEffect effectForBlurEffect:blur]), "UIVibrancyEffect"};
      return true;
    }
    id styleName = args.value(1);
    UIVibrancyEffectStyle style;
    if (!VibrancyEffectStyleFromName(styleName, &style)) {
      *error = EnumError(@"style", styleName, NamesForVibrancyEffectStyle());
      return true;
    }
    *out = {NacreKeep([UIVibrancyEffect effectForBlurEffect:blur style:style]),
            "UIVibrancyEffect"};
    return true;
  }
  return false;
}

// ---- 构造 ----
static bool EffectsConstruct(const std::string& className, const NacreArgs& args,
                             nacre::NativeObjectRef* out, std::string* error) {
  if (className == "UIVisualEffectView") {
    // 效果可空。对象不转换：给了就得是 UIVisualEffect；给的是字符串、数字
    // 这类标量（对象位是空的，标量位不是 null）同样拒，不当成「没给」
    id effect = args.object(0);
    id scalar = args.value(0);
    BOOL scalarGiven = scalar != nil && scalar != NSNull.null;
    if (scalarGiven || (effect != nil && ![effect isKindOfClass:UIVisualEffect.class])) {
      *error = "UIVisualEffectView needs a UIVisualEffect or null";
      return true;
    }
    *out = {NacreKeep([[UIVisualEffectView alloc] initWithEffect:(UIVisualEffect*)effect]),
            className};
    return true;
  }
  // 头文件里没有给它工厂方法，就是普通的 init
  if (className == "UIGlassContainerEffect") {
    *out = {NacreKeep([[UIGlassContainerEffect alloc] init]), className};
    return true;
  }
  return false;
}

// ---- 属性 ----
static id ReadEffectsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIGlassEffect.class]) {
    if ([key isEqualToString:@"isInteractive"]) return @(((UIGlassEffect*)object).isInteractive);
  }
  if ([object isKindOfClass:UIGlassContainerEffect.class]) {
    if ([key isEqualToString:@"spacing"]) return @(((UIGlassContainerEffect*)object).spacing);
  }
  return nil;
}

static BOOL WriteEffectsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIGlassEffect.class]) {
    if ([key isEqualToString:@"isInteractive"]) {
      ((UIGlassEffect*)object).interactive = NACRE_BOOL(value, key);
      return YES;
    }
  }
  if ([object isKindOfClass:UIGlassContainerEffect.class]) {
    if ([key isEqualToString:@"spacing"]) {
      double spacing = NACRE_NUM(value, key);
      // 它是「相距多近开始融合」的距离。实测负数 UIKit 照存不误，但头文件
      // 没说负的距离是什么意思，所以拦掉，不交给系统去猜
      if (spacing < 0) {
        *error = "spacing must be a non-negative number";
        return YES;
      }
      ((UIGlassContainerEffect*)object).spacing = spacing;
      return YES;
    }
  }
  return NO;
}

static nacre::NativeObjectRef ReadEffectsObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIVisualEffectView.class]) {
    UIVisualEffectView* view = (UIVisualEffectView*)object;
    if (name == "effect") {
      UIVisualEffect* effect = view.effect;
      return {NacreKeep(effect), EffectClassName(effect)};
    }
    // 实际的类是私有的 _UIVisualEffectContentView，按 UIView 包
    if (name == "contentView") return {NacreKeep(view.contentView), "UIView"};
  }
  if ([object isKindOfClass:UIGlassEffect.class] && name == "tintColor") {
    return {NacreKeep(((UIGlassEffect*)object).tintColor), "UIColor"};
  }
  return {};
}

// 对象值的写入。照 Web IDL：对象不转换，null 可以，给了对象就得是要求的
// 那个类。这条通道返回 bool（认不认领），所以用不了 NACRE_OBJECT_OR_NIL
// ——那个宏是给返回 void 的函数写的，这里把同一件事展开写
static bool WriteEffectsObjectProperty(id object, const std::string& name, id value,
                                       std::string* error) {
  if ([object isKindOfClass:UIVisualEffectView.class] && name == "effect") {
    if (value != nil && ![value isKindOfClass:UIVisualEffect.class]) {
      ObjectTypeError(name, "UIVisualEffect", true, error);
      return true;
    }
    ((UIVisualEffectView*)object).effect = (UIVisualEffect*)value;
    return true;
  }
  if ([object isKindOfClass:UIGlassEffect.class] && name == "tintColor") {
    if (value != nil && ![value isKindOfClass:UIColor.class]) {
      ObjectTypeError(name, "UIColor", true, error);
      return true;
    }
    ((UIGlassEffect*)object).tintColor = (UIColor*)value;
    return true;
  }
  return false;
}

// ---- 方法 ----
// 只做一件事：把「直接往效果视图上加子视图」拦在调用之前。这个域排在 UIView
// 所在的域前面（继承层数深的先问），所以轮得到它。
//
// 不拦的话 UIKit 自己抛 NSInternalInconsistencyException，入口的异常保底会
// 接住——但那一层是保底，不是该走的路；而且这是这个类最常见的写错方式，
// 值得一句说清楚该往哪加的报错
static bool EffectsCallMethod(id object, NSString* sel, const NacreArgs& args,
                              std::string* out, std::string* error) {
  if (![object isKindOfClass:UIVisualEffectView.class]) return false;
  if ([sel isEqualToString:@"addSubview:"] || [sel hasPrefix:@"insertSubview:"]) {
    NSString* method = [sel componentsSeparatedByString:@":"].firstObject;
    *error = [NSString stringWithFormat:@"%@: a UIVisualEffectView takes no subviews of "
                                        @"its own; add them to its contentView",
                                        method]
                 .UTF8String;
    *out = "null";
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
// 列了两个类：效果视图，和效果的基类（四种效果都是它的子类）
@interface NacreEffectsDomain : NSObject
@end
@implementation NacreEffectsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "effects";
  d.classes = {UIVisualEffectView.class, UIVisualEffect.class};
  d.read = nacre_bridge::ReadEffectsProperty;
  d.write = nacre_bridge::WriteEffectsProperty;
  d.readObject = nacre_bridge::ReadEffectsObjectProperty;
  d.writeObject = nacre_bridge::WriteEffectsObjectProperty;
  d.call = nacre_bridge::EffectsCallMethod;
  d.construct = nacre_bridge::EffectsConstruct;
  d.classCallObject = nacre_bridge::EffectsClassCall;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
