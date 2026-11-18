// 外观特征（trait）：当前环境是深色还是浅色、屏幕几倍、文字多大。
//
// 这个域在所有通道上的分支都在这一个文件里：UITraitCollection 的读取、
// 强制深浅色（overrideUserInterfaceStyle）、变化通知的订阅。

#import <UIKit/UIKit.h>
#import <objc/runtime.h>

#include "NacreBridge.h"

// 变化通知的 trampoline。iOS 17 起的注册方式是 target-action，和控件事件
// 同一种，所以不需要同步回调，也不需要覆写 traitCollectionDidChange:
// （那个已经废弃了）。action 可以带两个参数：谁的特征变了、变之前是什么。
@interface NacreTraitTarget : NSObject
@property(nonatomic, copy) NacreTraitEmit emit;
@property(nonatomic, strong) id<UITraitChangeRegistration> registration;
@end

@implementation NacreTraitTarget

- (void)traitsChanged:(id<UITraitEnvironment>)environment
             previous:(UITraitCollection*)previous {
  if (self.emit) self.emit(environment, previous);
}

@end

namespace nacre_bridge {

NACRE_ENUM_MAP(UserInterfaceStyle, UIUserInterfaceStyle,
               @"unspecified": @(UIUserInterfaceStyleUnspecified),
               @"light": @(UIUserInterfaceStyleLight),
               @"dark": @(UIUserInterfaceStyleDark))

NACRE_ENUM_MAP(UserInterfaceSizeClass, UIUserInterfaceSizeClass,
               @"unspecified": @(UIUserInterfaceSizeClassUnspecified),
               @"compact": @(UIUserInterfaceSizeClassCompact),
               @"regular": @(UIUserInterfaceSizeClassRegular))

NACRE_ENUM_MAP(AccessibilityContrast, UIAccessibilityContrast,
               @"unspecified": @(UIAccessibilityContrastUnspecified),
               @"normal": @(UIAccessibilityContrastNormal),
               @"high": @(UIAccessibilityContrastHigh))

NACRE_ENUM_MAP(TraitLayoutDirection, UITraitEnvironmentLayoutDirection,
               @"unspecified": @(UITraitEnvironmentLayoutDirectionUnspecified),
               @"leftToRight": @(UITraitEnvironmentLayoutDirectionLeftToRight),
               @"rightToLeft": @(UITraitEnvironmentLayoutDirectionRightToLeft))

// 文字大小的档位。原生是一组字符串常量，不是整数枚举，所以不能用
// NACRE_ENUM_MAP，自己列一张表。只读，所以只有「常量 → 名字」这一个方向
static NSArray<NSArray*>* ContentSizeCategoryPairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"unspecified", UIContentSizeCategoryUnspecified ],
      @[ @"extraSmall", UIContentSizeCategoryExtraSmall ],
      @[ @"small", UIContentSizeCategorySmall ],
      @[ @"medium", UIContentSizeCategoryMedium ],
      @[ @"large", UIContentSizeCategoryLarge ],
      @[ @"extraLarge", UIContentSizeCategoryExtraLarge ],
      @[ @"extraExtraLarge", UIContentSizeCategoryExtraExtraLarge ],
      @[ @"extraExtraExtraLarge", UIContentSizeCategoryExtraExtraExtraLarge ],
      @[ @"accessibilityMedium", UIContentSizeCategoryAccessibilityMedium ],
      @[ @"accessibilityLarge", UIContentSizeCategoryAccessibilityLarge ],
      @[ @"accessibilityExtraLarge", UIContentSizeCategoryAccessibilityExtraLarge ],
      @[ @"accessibilityExtraExtraLarge", UIContentSizeCategoryAccessibilityExtraExtraLarge ],
      @[ @"accessibilityExtraExtraExtraLarge",
         UIContentSizeCategoryAccessibilityExtraExtraExtraLarge ],
    ];
  });
  return pairs;
}

static NSString* NameForContentSizeCategory(UIContentSizeCategory category) {
  for (NSArray* pair in ContentSizeCategoryPairs()) {
    if ([pair[1] isEqualToString:category]) return pair[0];
  }
  return @"unspecified";
}

// 这三类对象有外观特征，也能注册变化通知
static BOOL HasTraits(id object) {
  return [object isKindOfClass:UIView.class] ||
         [object isKindOfClass:UIViewController.class] ||
         [object isKindOfClass:UIWindowScene.class];
}

bool TraitObservable(id object) { return HasTraits(object); }

id ReadTraitProperty(id object, NSString* key) {
  if ([object isKindOfClass:UITraitCollection.class]) {
    UITraitCollection* traits = (UITraitCollection*)object;
    if ([key isEqualToString:@"userInterfaceStyle"]) {
      return NameForUserInterfaceStyle(traits.userInterfaceStyle);
    }
    if ([key isEqualToString:@"displayScale"]) return @(traits.displayScale);
    if ([key isEqualToString:@"preferredContentSizeCategory"]) {
      return NameForContentSizeCategory(traits.preferredContentSizeCategory);
    }
    if ([key isEqualToString:@"horizontalSizeClass"]) {
      return NameForUserInterfaceSizeClass(traits.horizontalSizeClass);
    }
    if ([key isEqualToString:@"verticalSizeClass"]) {
      return NameForUserInterfaceSizeClass(traits.verticalSizeClass);
    }
    if ([key isEqualToString:@"accessibilityContrast"]) {
      return NameForAccessibilityContrast(traits.accessibilityContrast);
    }
    if ([key isEqualToString:@"layoutDirection"]) {
      return NameForTraitLayoutDirection(traits.layoutDirection);
    }
    return nil;
  }
  if ([key isEqualToString:@"overrideUserInterfaceStyle"]) {
    if ([object isKindOfClass:UIView.class]) {
      return NameForUserInterfaceStyle(((UIView*)object).overrideUserInterfaceStyle);
    }
    if ([object isKindOfClass:UIViewController.class]) {
      return NameForUserInterfaceStyle(
          ((UIViewController*)object).overrideUserInterfaceStyle);
    }
  }
  return nil;
}

BOOL WriteTraitProperty(id object, NSString* key, id value, std::string* error) {
  if (![key isEqualToString:@"overrideUserInterfaceStyle"]) return NO;
  const BOOL isView = [object isKindOfClass:UIView.class];
  if (!isView && ![object isKindOfClass:UIViewController.class]) return NO;
  UIUserInterfaceStyle style;
  if (!UserInterfaceStyleFromName(value, &style)) {
    *error = EnumError(@"overrideUserInterfaceStyle", value, NamesForUserInterfaceStyle());
    return YES;
  }
  if (isView) ((UIView*)object).overrideUserInterfaceStyle = style;
  else ((UIViewController*)object).overrideUserInterfaceStyle = style;
  return YES;
}

nacre::NativeObjectRef ReadTraitObjectProperty(id object, const std::string& name) {
  if (name == "traitCollection" && HasTraits(object)) {
    UITraitCollection* traits = [(id<UITraitEnvironment>)object traitCollection];
    return {NacreKeep(traits), "UITraitCollection"};
  }
  return {};
}

static const void* kNacreTraitTargetKey = &kNacreTraitTargetKey;

bool TraitSetSubscription(id object, NSString* type, BOOL on, NacreTraitEmit emit,
                          std::string* error) {
  if (![type isEqualToString:@"traitchange"] || !HasTraits(object)) return false;
  NacreTraitTarget* target = objc_getAssociatedObject(object, kNacreTraitTargetKey);
  if (on) {
    if (target != nil) return true;
    target = [NacreTraitTarget new];
    target.emit = emit;
    // 只注册 JS 读得到的那七个。别的特征变了 JS 也看不出哪里变了，
    // 为它们派发事件只会是噪音
    NSArray<UITrait>* watched = @[
      UITraitUserInterfaceStyle.class, UITraitDisplayScale.class,
      UITraitPreferredContentSizeCategory.class, UITraitHorizontalSizeClass.class,
      UITraitVerticalSizeClass.class, UITraitAccessibilityContrast.class,
      UITraitLayoutDirection.class
    ];
    target.registration =
        [(id<UITraitChangeObservable>)object registerForTraitChanges:watched
                                                         withTarget:target
                                                             action:@selector(traitsChanged:previous:)];
    objc_setAssociatedObject(object, kNacreTraitTargetKey, target,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  } else if (target != nil) {
    [(id<UITraitChangeObservable>)object unregisterForTraitChanges:target.registration];
    objc_setAssociatedObject(object, kNacreTraitTargetKey, nil,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  return true;
}

}  // namespace nacre_bridge
