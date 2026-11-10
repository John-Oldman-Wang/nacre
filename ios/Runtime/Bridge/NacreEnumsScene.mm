// 模态呈现、导航事件、Keychain 的访问级别
//
// 字符串 ↔ 数值的映射。
//
// 名字 ↔ 数值只能放原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1、macOS 上是 2），JS 里按下标映射换个平台就全错。
// 宏在 NacreBridge.h 里，所以每个能力域可以单独成文件。
#import "NacreBridge.h"

namespace nacre_bridge {

NACRE_ENUM_MAP(ModalPresentationStyle, UIModalPresentationStyle,
               @"automatic": @(UIModalPresentationAutomatic),
               @"fullScreen": @(UIModalPresentationFullScreen),
               @"pageSheet": @(UIModalPresentationPageSheet),
               @"formSheet": @(UIModalPresentationFormSheet),
               @"currentContext": @(UIModalPresentationCurrentContext),
               @"overFullScreen": @(UIModalPresentationOverFullScreen),
               @"overCurrentContext": @(UIModalPresentationOverCurrentContext),
               @"popover": @(UIModalPresentationPopover),
               @"custom": @(UIModalPresentationCustom),
               @"none": @(UIModalPresentationNone))

NACRE_ENUM_MAP(ModalTransitionStyle, UIModalTransitionStyle,
               @"coverVertical": @(UIModalTransitionStyleCoverVertical),
               @"flipHorizontal": @(UIModalTransitionStyleFlipHorizontal),
               @"crossDissolve": @(UIModalTransitionStyleCrossDissolve),
               @"partialCurl": @(UIModalTransitionStylePartialCurl))

// UINavigationController 的事件名。和滚动一样派生自 delegate 方法名，
// 所以全小写。区别是这两条**带数据**——「哪个页面」在那一刻从 nav 上读不到
// （willShow 时 topViewController 还没换过去），所以原生送什么就给什么。
// 模态页被关掉的三条通知。都派发到**被呈现的那个 VC** 上，而不是
// UIPresentationController 上——那个类对 JS 没有别的用处，暴露出来只为挂一个
// delegate。形状和 ObjC 不一样，但底层承诺的是能力对齐不是形状一致。
//
// 第四条 presentationControllerShouldDismiss: 要同步返回 BOOL，没做——
// UIKit 自己给了「预先声明的状态」版本，就是 isModalInPresentation。
static NSArray<NSString*>* PresentationEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[ @"willdismiss", @"diddismiss", @"dismissattempted" ];
  });
  return names;
}

BOOL IsPresentationEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [PresentationEventNamesList() containsObject:name];
}

NSString* NamesForPresentationEvent(void) {
  return [PresentationEventNamesList() componentsJoinedByString:@" / "];
}

static NSArray<NSString*>* NavEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ names = @[ @"willshow", @"didshow" ]; });
  return names;
}

BOOL IsNavEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [NavEventNamesList() containsObject:name];
}

NSString* NamesForNavEvent(void) {
  return [NavEventNamesList() componentsJoinedByString:@" / "];
}

// Keychain 的访问级别。原生侧那五个是 CFStringRef 常量，NACRE_ENUM_MAP 的
// 值必须是数字，所以这里映射成序号，NacreKeychain.mm 再按序号换成常量。
//
// kSecAttrAccessibleAlways 和 AlwaysThisDeviceOnly **不暴露**：iOS 12 起
// API_DEPRECATED，头文件原话是 "Use an accessibility level that provides
// some user protection"。
NACRE_ENUM_MAP(KeychainAccessible, NacreKeychainAccessible,
               @"whenUnlocked": @(NacreKeychainAccessibleWhenUnlocked),
               @"whenUnlockedThisDeviceOnly":
                   @(NacreKeychainAccessibleWhenUnlockedThisDeviceOnly),
               @"afterFirstUnlock": @(NacreKeychainAccessibleAfterFirstUnlock),
               @"afterFirstUnlockThisDeviceOnly":
                   @(NacreKeychainAccessibleAfterFirstUnlockThisDeviceOnly),
               @"whenPasscodeSetThisDeviceOnly":
                   @(NacreKeychainAccessibleWhenPasscodeSetThisDeviceOnly))

}  // namespace nacre_bridge
