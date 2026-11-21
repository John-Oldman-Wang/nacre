// 一个域：无障碍。读屏（VoiceOver）念给用户听的那一组属性，挂在 UIView 上。
//
// UIKit 里它们是 NSObject 的非正式协议 UIAccessibility（任何对象都有），外加
// UIAccessibilityIdentification 的 accessibilityIdentifier。界面上能被读屏读到
// 的只有视图，所以 JS 那一侧只挂在 UIView 上；这里的 classes 也只列 UIView。
//
//   isAccessibilityElement            读屏把它当成一个可以停留的元素
//   accessibilityLabel / Hint / Value 念什么：是什么、怎么操作、现在的值
//   accessibilityIdentifier           给 UI 自动化测试找元素用，不念
//   accessibilityTraits               是什么样的东西（按钮、标题、已选中…），位掩码
//   accessibilityElementsHidden       子视图都不给读屏
//   accessibilityViewIsModal          读屏只在它里面转（弹层）
//   shouldGroupAccessibilityChildren  子视图按它分组念
//
// 都是只有自己会改的值，没有变化通知可给（UILabel 的标签默认取它的文字，那是
// getter 现算的，读的时候就是新的）。
//
// 特征（accessibilityTraits）有一处要小心：系统控件身上可能带着头文件里没有
// 的私有位。写的时候只换掉认识的那些位，不认识的原样留着；读的时候只报认识的。
#import "NacreBridge.h"

namespace nacre_bridge {

// 名字是常量去掉 UIAccessibilityTrait 前缀、首字母小写。头文件里的这些是
// extern 常量不是枚举字面量，表在第一次用到时才建，所以可以直接写
NACRE_MASK_MAP(AccessibilityTraits, UIAccessibilityTraits,
               @"button": @(UIAccessibilityTraitButton),
               @"link": @(UIAccessibilityTraitLink),
               @"header": @(UIAccessibilityTraitHeader),
               @"searchField": @(UIAccessibilityTraitSearchField),
               @"image": @(UIAccessibilityTraitImage),
               @"selected": @(UIAccessibilityTraitSelected),
               @"playsSound": @(UIAccessibilityTraitPlaysSound),
               @"keyboardKey": @(UIAccessibilityTraitKeyboardKey),
               @"staticText": @(UIAccessibilityTraitStaticText),
               @"summaryElement": @(UIAccessibilityTraitSummaryElement),
               @"notEnabled": @(UIAccessibilityTraitNotEnabled),
               @"updatesFrequently": @(UIAccessibilityTraitUpdatesFrequently),
               @"startsMediaSession": @(UIAccessibilityTraitStartsMediaSession),
               @"adjustable": @(UIAccessibilityTraitAdjustable),
               @"allowsDirectInteraction": @(UIAccessibilityTraitAllowsDirectInteraction),
               @"causesPageTurn": @(UIAccessibilityTraitCausesPageTurn),
               @"tabBar": @(UIAccessibilityTraitTabBar),
               @"toggleButton": @(UIAccessibilityTraitToggleButton),
               @"supportsZoom": @(UIAccessibilityTraitSupportsZoom))

// 表里全部位的并集：写的时候用它把认识的位清掉
static UIAccessibilityTraits KnownAccessibilityTraits(void) {
  UIAccessibilityTraits all = 0;
  for (NSNumber* bit in AccessibilityTraitsTable().allValues) all |= bit.unsignedLongLongValue;
  return all;
}

// 可空的字符串：JS 那一侧已经按 String() 转过，null 和 undefined 都是 nil
static bool AccessibilityText(id value, NSString* what, NSString** out, std::string* error) {
  if ([value isKindOfClass:NSString.class]) { *out = value; return true; }
  if (value == nil || value == NSNull.null) { *out = nil; return true; }
  *error = [NSString stringWithFormat:@"%@ must be a string or null", what].UTF8String;
  return false;
}

static id ReadAccessibilityProperty(id object, NSString* key) {
  if (![object isKindOfClass:UIView.class]) return nil;
  UIView* view = (UIView*)object;
  if ([key isEqualToString:@"isAccessibilityElement"]) return @(view.isAccessibilityElement);
  if ([key isEqualToString:@"accessibilityLabel"]) return view.accessibilityLabel ?: NSNull.null;
  if ([key isEqualToString:@"accessibilityHint"]) return view.accessibilityHint ?: NSNull.null;
  if ([key isEqualToString:@"accessibilityValue"]) return view.accessibilityValue ?: NSNull.null;
  if ([key isEqualToString:@"accessibilityIdentifier"]) {
    return view.accessibilityIdentifier ?: NSNull.null;
  }
  if ([key isEqualToString:@"accessibilityTraits"]) {
    return NamesInAccessibilityTraits(view.accessibilityTraits);
  }
  if ([key isEqualToString:@"accessibilityElementsHidden"]) {
    return @(view.accessibilityElementsHidden);
  }
  if ([key isEqualToString:@"accessibilityViewIsModal"]) return @(view.accessibilityViewIsModal);
  if ([key isEqualToString:@"shouldGroupAccessibilityChildren"]) {
    return @(view.shouldGroupAccessibilityChildren);
  }
  return nil;
}

static BOOL WriteAccessibilityProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:UIView.class]) return NO;
  UIView* view = (UIView*)object;
  NSString* text = nil;
  if ([key isEqualToString:@"isAccessibilityElement"]) {
    view.isAccessibilityElement = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"accessibilityLabel"]) {
    if (AccessibilityText(value, key, &text, error)) view.accessibilityLabel = text;
    return YES;
  }
  if ([key isEqualToString:@"accessibilityHint"]) {
    if (AccessibilityText(value, key, &text, error)) view.accessibilityHint = text;
    return YES;
  }
  if ([key isEqualToString:@"accessibilityValue"]) {
    if (AccessibilityText(value, key, &text, error)) view.accessibilityValue = text;
    return YES;
  }
  if ([key isEqualToString:@"accessibilityIdentifier"]) {
    if (AccessibilityText(value, key, &text, error)) view.accessibilityIdentifier = text;
    return YES;
  }
  if ([key isEqualToString:@"accessibilityTraits"]) {
    UIAccessibilityTraits traits = 0;
    id bad = nil;
    if (!AccessibilityTraitsFromNames(value, &traits, &bad)) {
      // 不认识的名字：属性位上是警告、整次赋值不生效（EnumError 让入口把它变成
      // 警告）。不是数组在 JS 那一侧已经抛了，走到这里只是兜底
      *error = bad != nil ? EnumError(key, bad, NamesForAccessibilityTraits())
                          : "accessibilityTraits must be an array of trait names";
      return YES;
    }
    view.accessibilityTraits = (view.accessibilityTraits & ~KnownAccessibilityTraits()) | traits;
    return YES;
  }
  if ([key isEqualToString:@"accessibilityElementsHidden"]) {
    view.accessibilityElementsHidden = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"accessibilityViewIsModal"]) {
    view.accessibilityViewIsModal = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"shouldGroupAccessibilityChildren"]) {
    view.shouldGroupAccessibilityChildren = NACRE_BOOL(value, key);
    return YES;
  }
  return NO;
}

}  // namespace nacre_bridge

@interface NacreAccessibilityDomain : NSObject
@end
@implementation NacreAccessibilityDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "accessibility";
  d.classes = {UIView.class};
  d.read = nacre_bridge::ReadAccessibilityProperty;
  d.write = nacre_bridge::WriteAccessibilityProperty;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
