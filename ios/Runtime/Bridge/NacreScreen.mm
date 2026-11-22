// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 屏幕：UIScreen 和它的显示模式 UIScreenMode，加上场景上的 screen（拿屏幕的唯一入口）。
// 写法和手写的域一样，见 docs/internals/adding-classes.md。
//
// 没接的：UIScreen.mainScreen / screens（iOS 26 废弃，Apple 让从场景拿）；
// coordinateSpace（协议对象没接）；过扫描的两项（外接电视用的）；focus 一组（废弃）。
// 两个类都不能 new：屏幕和显示模式只能由系统给。
//
// 七个事件来自通知中心，按屏幕过滤，有监听器时才登记，见文件末尾的订阅。
// 键盘的三个（keyboardshow、keyboardhide、keyboardchange）当场派发：系统在键盘的
// 动画里发通知，监听器这时候改的布局跟着键盘一起动。iOS 16.1 起通知的发出对象
// 就是键盘所在的屏幕。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 通知中心的观察者。屏幕通过关联对象持有它，一个屏幕一个；它不持有任何 JS 函数
@interface NacreScreenObserver : NSObject
@property(nonatomic, copy) NSSet<NSString*>* types;
@end

@implementation NacreScreenObserver

- (void)forward:(NSNotification*)note type:(NSString*)type {
  UIScreen* screen = [note.object isKindOfClass:UIScreen.class] ? note.object : nil;
  if (screen != nil) nacre_bridge::NacreEmitEvent(screen, "UIScreen", type);
}
- (void)brightnessChanged:(NSNotification*)note { [self forward:note type:@"brightnesschange"]; }
- (void)modeChanged:(NSNotification*)note { [self forward:note type:@"modechange"]; }
- (void)capturedChanged:(NSNotification*)note { [self forward:note type:@"capturedchange"]; }
- (void)referenceStatusChanged:(NSNotification*)note {
  [self forward:note type:@"referencedisplaymodestatuschange"];
}

// 键盘的通知：当场派发，带上键盘动画结束、开始时的位置（屏幕坐标）和时长
- (void)keyboard:(NSNotification*)note type:(NSString*)type {
  UIScreen* screen = [note.object isKindOfClass:UIScreen.class] ? note.object : nil;
  if (screen == nil) return;
  NSDictionary* info = note.userInfo;
  CGRect end = [info[UIKeyboardFrameEndUserInfoKey] CGRectValue];
  CGRect begin = [info[UIKeyboardFrameBeginUserInfoKey] CGRectValue];
  double duration = [info[UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  NSDictionary* payload = @{
    @"frame" : @{@"x" : @(end.origin.x), @"y" : @(end.origin.y),
                 @"width" : @(end.size.width), @"height" : @(end.size.height)},
    @"previousFrame" : @{@"x" : @(begin.origin.x), @"y" : @(begin.origin.y),
                         @"width" : @(begin.size.width), @"height" : @(begin.size.height)},
    @"duration" : @(duration),
  };
  nacre_bridge::NacreEmitEventNow(screen, "UIScreen", type,
                                  @(nacre_bridge::EncodeJSON(payload).c_str()), "UIScreenKeyboardEvent");
}
- (void)keyboardShow:(NSNotification*)note { [self keyboard:note type:@"keyboardshow"]; }
- (void)keyboardHide:(NSNotification*)note { [self keyboard:note type:@"keyboardhide"]; }
- (void)keyboardChange:(NSNotification*)note { [self keyboard:note type:@"keyboardchange"]; }

- (void)dealloc {
  [NSNotificationCenter.defaultCenter removeObserver:self];
}

@end

static const void* kNacreScreenObserverKey = &kNacreScreenObserverKey;

namespace nacre_bridge {

NACRE_ENUM_MAP(ScreenUIScreenReferenceDisplayModeStatus, UIScreenReferenceDisplayModeStatus,
               @"notSupported": @(UIScreenReferenceDisplayModeStatusNotSupported),
               @"notEnabled": @(UIScreenReferenceDisplayModeStatusNotEnabled),
               @"limited": @(UIScreenReferenceDisplayModeStatusLimited),
               @"enabled": @(UIScreenReferenceDisplayModeStatusEnabled))

static bool ScreenObject(id value, Class cls, const char* className, bool nullable,
                    const std::string& name, std::string* error) {
  if ([value isKindOfClass:cls] || (nullable && value == nil)) return true;
  ObjectTypeError(name, className, nullable, error);
  return false;
}

static id ReadScreenProperty(id object, NSString* key) {
  // isCaptured：Apple 打算废弃它（让用外观特征里的 sceneCaptureState），但还没废弃；
  // 那个外观特征还没接，所以先照旧暴露
  if ([object isKindOfClass:UIScreen.class]) {
    UIScreen* o = (UIScreen*)object;
    if ([key isEqualToString:@"bounds"]) return RectToJSON(o.bounds);
    if ([key isEqualToString:@"scale"]) return @(o.scale);
    if ([key isEqualToString:@"isCaptured"]) return @(o.isCaptured);
    if ([key isEqualToString:@"brightness"]) return @(o.brightness);
    if ([key isEqualToString:@"wantsSoftwareDimming"]) return @(o.wantsSoftwareDimming);
    if ([key isEqualToString:@"nativeBounds"]) return RectToJSON(o.nativeBounds);
    if ([key isEqualToString:@"nativeScale"]) return @(o.nativeScale);
    if ([key isEqualToString:@"maximumFramesPerSecond"]) return @(o.maximumFramesPerSecond);
    if ([key isEqualToString:@"calibratedLatency"]) return @(o.calibratedLatency);
    if ([key isEqualToString:@"referenceDisplayModeStatus"]) return NameForScreenUIScreenReferenceDisplayModeStatus(o.referenceDisplayModeStatus) ?: NSNull.null;
    if ([key isEqualToString:@"currentEDRHeadroom"]) return @(o.currentEDRHeadroom);
    if ([key isEqualToString:@"potentialEDRHeadroom"]) return @(o.potentialEDRHeadroom);
  }
  if ([object isKindOfClass:UIScreenMode.class]) {
    UIScreenMode* o = (UIScreenMode*)object;
    if ([key isEqualToString:@"size"]) return SizeToJSON(o.size);
    if ([key isEqualToString:@"pixelAspectRatio"]) return @(o.pixelAspectRatio);
  }
  return nil;
}

static BOOL WriteScreenProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIScreen.class]) {
    UIScreen* o = (UIScreen*)object;
    if ([key isEqualToString:@"brightness"]) { o.brightness = NACRE_NUM(value, key); return YES; }
    if ([key isEqualToString:@"wantsSoftwareDimming"]) { o.wantsSoftwareDimming = NACRE_BOOL(value, key); return YES; }
  }
  return NO;
}

static nacre::NativeObjectRef ReadScreenObjectProperty(id object, const std::string& name) {
  // 场景上的 screen：拿屏幕的唯一入口。系统的屏幕一直活着，引擎只是借用
  if ([object isKindOfClass:UIWindowScene.class] && name == "screen") {
    return {NacreKeep(((UIWindowScene*)object).screen), "UIScreen"};
  }
  if ([object isKindOfClass:UIScreen.class]) {
    UIScreen* o = (UIScreen*)object;
    // 外观特征是不可变的值，每次读给当时的那一份
    if (name == "traitCollection") return {NacreKeep(o.traitCollection), "UITraitCollection"};
    if (name == "preferredMode") return {NacreKeep(o.preferredMode), "UIScreenMode"};
    if (name == "currentMode") return {NacreKeep(o.currentMode), "UIScreenMode"};
    if (name == "mirroredScreen") return {NacreKeep(o.mirroredScreen), "UIScreen"};
  }
  return {};
}

static bool WriteScreenObjectProperty(id object, const std::string& name, id value,
                                        std::string* error) {
  if ([object isKindOfClass:UIScreen.class]) {
    UIScreen* o = (UIScreen*)object;
    if (name == "currentMode") {
      if (ScreenObject(value, UIScreenMode.class, "UIScreenMode", true, name, error)) o.currentMode = value;
      return true;
    }
  }
  return false;
}

static void ReadScreenObjectArray(id object, const std::string& name,
                                  std::vector<nacre::NativeObjectRef>& refs) {
  if (![object isKindOfClass:UIScreen.class]) return;
  if (name == "availableModes") {
    for (UIScreenMode* mode in ((UIScreen*)object).availableModes) {
      refs.push_back({NacreKeep(mode), "UIScreenMode"});
    }
  }
}

static bool CallScreenObjectMethod(id object, NSString* sel, const NacreArgs& args,
                                   nacre::NativeObjectRef* out, std::string* error) {
  if ([object isKindOfClass:UIScreen.class]) {
    UIScreen* o = (UIScreen*)object;
    if ([sel isEqualToString:@"snapshotViewAfterScreenUpdates:"]) {
      BOOL a0 = NACRE_BOOL(args.value(0), @"snapshotViewAfterScreenUpdates");
      *out = {NacreKeep([o snapshotViewAfterScreenUpdates:a0]), "UIView"};
      return true;
    }
  }
  return false;
}

// ---- 订阅 ----
// 惰性：有监听器时才往通知中心登记，按发送者过滤（通知的 object 就是那块屏幕）
static NacreSubscribed ScreenSetSubscription(id object, NSString* type, BOOL on,
                                             std::string* error) {
  if (![object isKindOfClass:UIScreen.class]) return false;
  UIScreen* screen = (UIScreen*)object;
  NSDictionary<NSString*, NSArray*>* table = @{
    @"brightnesschange": @[UIScreenBrightnessDidChangeNotification, @"brightnessChanged:"],
    @"modechange": @[UIScreenModeDidChangeNotification, @"modeChanged:"],
    @"capturedchange": @[UIScreenCapturedDidChangeNotification, @"capturedChanged:"],
    @"referencedisplaymodestatuschange":
        @[UIScreenReferenceDisplayModeStatusDidChangeNotification, @"referenceStatusChanged:"],
    @"keyboardshow": @[UIKeyboardWillShowNotification, @"keyboardShow:"],
    @"keyboardhide": @[UIKeyboardWillHideNotification, @"keyboardHide:"],
    @"keyboardchange": @[UIKeyboardWillChangeFrameNotification, @"keyboardChange:"],
  };
  NSArray* entry = table[type];
  if (entry == nil) return NacreSubscribed::UnknownEvent;
  NacreScreenObserver* observer = objc_getAssociatedObject(screen, kNacreScreenObserverKey);
  if (observer == nil) {
    if (!on) return true;
    observer = [NacreScreenObserver new];
    observer.types = [NSSet set];
    objc_setAssociatedObject(screen, kNacreScreenObserverKey, observer,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  NSMutableSet<NSString*>* types = [observer.types mutableCopy];
  if (on) {
    if ([types containsObject:type]) return true;
    [NSNotificationCenter.defaultCenter addObserver:observer
                                           selector:NSSelectorFromString(entry[1])
                                               name:entry[0]
                                             object:screen];
    [types addObject:type];
  } else {
    if (![types containsObject:type]) return true;
    [NSNotificationCenter.defaultCenter removeObserver:observer name:entry[0] object:screen];
    [types removeObject:type];
  }
  observer.types = types;
  return true;
}

}  // namespace nacre_bridge

@interface NacreScreenDomain : NSObject
@end
@implementation NacreScreenDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "screen";
  d.classes = {UIScreen.class, UIScreenMode.class, UIWindowScene.class};
  d.read = nacre_bridge::ReadScreenProperty;
  d.write = nacre_bridge::WriteScreenProperty;
  d.readObject = nacre_bridge::ReadScreenObjectProperty;
  d.writeObject = nacre_bridge::WriteScreenObjectProperty;
  d.readObjectArray = nacre_bridge::ReadScreenObjectArray;
  d.callObject = nacre_bridge::CallScreenObjectMethod;
  d.subscribe = nacre_bridge::ScreenSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
