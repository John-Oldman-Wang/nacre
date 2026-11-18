// 剪贴板：UIPasteboard.generalPasteboard 上的字符串。
//
// 一个域一个文件，每个入口返回「认不认领」。这个域是**登记进来的**
// （文件末尾的 +load，见 NacreExtension.h 的 NacreRegisterDomain），核心不
// 认识它，所以函数全是 static。事件从 NacreEmitEvent 出去。
//
// 这一步只有字符串。图片、URL、颜色、多条内容、自定义剪贴板都没做。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 通知中心的观察者。不持有任何 JS 函数；剪贴板对象通过关联对象持有它
@interface NacrePasteboardObserver : NSObject
@end

@implementation NacrePasteboardObserver

- (void)pasteboardChanged:(NSNotification*)note {
  UIPasteboard* pasteboard = [note.object isKindOfClass:UIPasteboard.class] ? note.object : nil;
  if (pasteboard != nil) nacre_bridge::NacreEmitEvent(pasteboard, "UIPasteboard", @"change");
}

- (void)dealloc {
  [NSNotificationCenter.defaultCenter removeObserver:self];
}

@end

static const void* kNacrePasteboardObserverKey = &kNacrePasteboardObserverKey;

namespace nacre_bridge {

// 类级的单例：UIPasteboard.generalPasteboard
static nacre::NativeObjectRef PasteboardClassObject(const std::string& className,
                                                    const std::string& name) {
  if (className == "UIPasteboard" && name == "generalPasteboard") {
    return {NacreKeep(UIPasteboard.generalPasteboard), "UIPasteboard"};
  }
  return {};
}

static id ReadPasteboardProperty(id object, NSString* key) {
  if (![object isKindOfClass:UIPasteboard.class]) return nil;
  UIPasteboard* pasteboard = (UIPasteboard*)object;
  // 读 string 是真的去取内容：内容来自别的 App 时系统可能先问用户。
  // hasStrings 和 changeCount 只是查询，不取内容
  if ([key isEqualToString:@"string"]) return pasteboard.string ?: (id)NSNull.null;
  if ([key isEqualToString:@"hasStrings"]) return @(pasteboard.hasStrings);
  if ([key isEqualToString:@"changeCount"]) return @(pasteboard.changeCount);
  return nil;
}

static BOOL WritePasteboardProperty(id object, NSString* key, id value,
                                    std::string* error) {
  if (![object isKindOfClass:UIPasteboard.class]) return NO;
  UIPasteboard* pasteboard = (UIPasteboard*)object;
  if ([key isEqualToString:@"string"]) {
    // JSON 的 null 解出来是 nil。原样交给 UIKit——ObjC 那边这个属性就是
    // nullable 的，写 nil 是什么效果由它定，我们不另外发明「清空」的语义
    if (value != nil && ![value isKindOfClass:NSString.class]) {
      *error = "string must be a string or null";
      return YES;
    }
    pasteboard.string = value;
    return YES;
  }
  return NO;
}

// ---- 订阅 ----
// 只有一个事件：change。惰性——有监听器时才往通知中心登记
static NacreSubscribed PasteboardSetSubscription(id object, NSString* type, BOOL on,
                                      std::string* error) {
  if (![object isKindOfClass:UIPasteboard.class]) return false;
  UIPasteboard* pasteboard = (UIPasteboard*)object;
  if (![type isEqualToString:@"change"]) {
    return NacreSubscribed::UnknownEvent;
  }
  NacrePasteboardObserver* observer =
      objc_getAssociatedObject(pasteboard, kNacrePasteboardObserverKey);
  if (on) {
    if (observer != nil) return true;
    observer = [NacrePasteboardObserver new];
    objc_setAssociatedObject(pasteboard, kNacrePasteboardObserverKey, observer,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    // 按发送者过滤：通知的 object 就是变了的那个剪贴板
    [NSNotificationCenter.defaultCenter addObserver:observer
                                           selector:@selector(pasteboardChanged:)
                                               name:UIPasteboardChangedNotification
                                             object:pasteboard];
  } else if (observer != nil) {
    [NSNotificationCenter.defaultCenter removeObserver:observer];
    objc_setAssociatedObject(pasteboard, kNacrePasteboardObserverKey, nil,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  return true;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacrePasteboardDomain : NSObject
@end
@implementation NacrePasteboardDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "pasteboard";
  d.classes = {UIPasteboard.class};
  d.read = nacre_bridge::ReadPasteboardProperty;
  d.write = nacre_bridge::WritePasteboardProperty;
  d.classObject = nacre_bridge::PasteboardClassObject;
  d.subscribe = nacre_bridge::PasteboardSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
