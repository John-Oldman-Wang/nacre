// 页面的覆写点：方向和状态栏；场景的几何信息、转屏、状态栏的现状。
//
// UIKit 里「这个页面允许哪些方向」「状态栏藏不藏、什么样式」只能靠写子类覆写几个
// 只读的 getter 拿到。运行时给 JS 能 new 的三种页面各预先写好一个子类
// （NacreViewController、NacreNavigationController、NacreTabBarController），
// new UIViewController() 这三处造出来的就是它们。子类覆写这五个 getter：页面在 JS 里
// 设过值，返回设的值；没设过，调父类的实现，和原生的页面一样。
//
// 为什么是预置子类，不是替换 UIViewController 基类上的 getter（出现、消失那样）：
// UIKit 对状态栏会先看页面的类有没有自己覆写 prefersStatusBarHidden，没覆写就不来问
// （实测：替换基类之后，系统一直在问 childViewControllerForStatusBarHidden，从不调
// prefersStatusBarHidden）。预置子类是真的覆写，系统照常来问。
// 系统自己的页面（弹窗、分享面板、选图、拍照）不是这三个子类，在它们上面设这几个
// 属性会抛：原生开发者也改不了它们的这几项。
//
// 场景这一侧：effectiveGeometry（UIWindowSceneGeometry）、statusBarManager、
// requestGeometryUpdateWithPreferences:（系统不支持时出错回调是当场调的，实测），
// 和 geometrychange 事件。事件来自场景委托的 windowScene:didUpdateEffectiveGeometry:，
// 系统在转屏动画里调它（实测），所以当场派发，监听器里改的布局跟着转。

#import "NacreBridge.h"

#import <objc/runtime.h>

@interface NacreViewController : UIViewController
@end
@interface NacreNavigationController : UINavigationController
@end
@interface NacreTabBarController : UITabBarController
@end

namespace nacre_bridge {

NACRE_ENUM_MAP(PageInterfaceOrientation, UIInterfaceOrientation,
               @"unknown": @(UIInterfaceOrientationUnknown),
               @"portrait": @(UIInterfaceOrientationPortrait),
               @"portraitUpsideDown": @(UIInterfaceOrientationPortraitUpsideDown),
               @"landscapeLeft": @(UIInterfaceOrientationLandscapeLeft),
               @"landscapeRight": @(UIInterfaceOrientationLandscapeRight))

NACRE_ENUM_MAP(PageStatusBarStyle, UIStatusBarStyle,
               @"default": @(UIStatusBarStyleDefault),
               @"lightContent": @(UIStatusBarStyleLightContent),
               @"darkContent": @(UIStatusBarStyleDarkContent))

// 一组方向。写入时认合称，读出时拆成单个的方向
static NSArray<NSArray*>* MaskSingles(void) {
  return @[
    @[ @"portrait", @(UIInterfaceOrientationMaskPortrait) ],
    @[ @"portraitUpsideDown", @(UIInterfaceOrientationMaskPortraitUpsideDown) ],
    @[ @"landscapeLeft", @(UIInterfaceOrientationMaskLandscapeLeft) ],
    @[ @"landscapeRight", @(UIInterfaceOrientationMaskLandscapeRight) ],
  ];
}
static NSDictionary<NSString*, NSNumber*>* MaskNames(void) {
  static NSDictionary* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSMutableDictionary* t = [NSMutableDictionary dictionary];
    for (NSArray* pair in MaskSingles()) t[pair[0]] = pair[1];
    t[@"landscape"] = @(UIInterfaceOrientationMaskLandscape);
    t[@"all"] = @(UIInterfaceOrientationMaskAll);
    t[@"allButUpsideDown"] = @(UIInterfaceOrientationMaskAllButUpsideDown);
    table = t;
  });
  return table;
}
static NSString* MaskChoices(void) {
  return @"portrait / portraitUpsideDown / landscapeLeft / landscapeRight / landscape / all / "
         @"allButUpsideDown";
}
static NSArray<NSString*>* NamesInMask(UIInterfaceOrientationMask mask) {
  NSMutableArray* out = [NSMutableArray array];
  for (NSArray* pair in MaskSingles()) {
    if (mask & [pair[1] unsignedIntegerValue]) [out addObject:pair[0]];
  }
  return out;
}
// 名字数组 → 掩码。不是数组：error（抛）；有不认识的名字：EnumError（警告，不动）；
// emptyIsError 时空数组也按写错处理（页面允许的方向一个都没有时系统会抛异常）
static bool MaskFromNames(id value, const char* what, bool emptyIsError,
                          UIInterfaceOrientationMask* out, std::string* error) {
  if (![value isKindOfClass:NSArray.class]) {
    *error = std::string(what) + " needs an array of orientation names";
    return false;
  }
  UIInterfaceOrientationMask mask = 0;
  for (id name in (NSArray*)value) {
    NSNumber* bit = [name isKindOfClass:NSString.class] ? MaskNames()[name] : nil;
    if (bit == nil) {
      *error = EnumError(@(what), name, MaskChoices());
      return false;
    }
    mask |= bit.unsignedIntegerValue;
  }
  if (emptyIsError && mask == 0) {
    EnumError(@(what), @"", MaskChoices());   // 置上「写了不认识的值」：警告，值不动
    *error = std::string(what) + " needs at least one orientation; expected some of: " +
             MaskChoices().UTF8String;
    return false;
  }
  *out = mask;
  return true;
}

// ---- 页面上设过的值 ----
static const void* kNacrePageOverridesKey = &kNacrePageOverridesKey;
NSNumber* PageOverride(UIViewController* vc, NSString* key);
static NSMutableDictionary* Overrides(UIViewController* vc, BOOL create) {
  NSMutableDictionary* d = objc_getAssociatedObject(vc, kNacrePageOverridesKey);
  if (d == nil && create) {
    d = [NSMutableDictionary dictionary];
    objc_setAssociatedObject(vc, kNacrePageOverridesKey, d, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  return d;
}

NSNumber* PageOverride(UIViewController* vc, NSString* key) { return Overrides(vc, NO)[key]; }

// ---- 场景的几何变化：替场景委托补 windowScene:didUpdateEffectiveGeometry: ----
static const void* kNacreGeometrySubscribedKey = &kNacreGeometrySubscribedKey;

static void EmitGeometryChange(UIWindowScene* scene, UIWindowSceneGeometry* previous) {
  if (![objc_getAssociatedObject(scene, kNacreGeometrySubscribedKey) boolValue]) return;
  NSString* before = NameForPageInterfaceOrientation(previous.interfaceOrientation) ?: @"unknown";
  NacreEmitEventNow(scene, "UIWindowScene", @"geometrychange",
                    @(EncodeJSON(@{@"previousInterfaceOrientation" : before}).c_str()));
}

static NSMutableSet<Class>* PatchedDelegates(void) {
  static NSMutableSet* set;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ set = [NSMutableSet set]; });
  return set;
}

static void PatchDelegateClass(Class cls) {
  if (cls == Nil || [PatchedDelegates() containsObject:cls]) return;
  [PatchedDelegates() addObject:cls];
  SEL sel = @selector(windowScene:didUpdateEffectiveGeometry:);
  Method existing = class_getInstanceMethod(cls, sel);
  IMP original = existing != NULL ? method_getImplementation(existing) : NULL;
  IMP replacement = imp_implementationWithBlock(^(id self, UIWindowScene* scene, UIWindowSceneGeometry* previous) {
    if (original != NULL) ((void (*)(id, SEL, id, id))original)(self, sel, scene, previous);
    if ([scene isKindOfClass:UIWindowScene.class]) EmitGeometryChange(scene, previous);
  });
  if (!class_addMethod(cls, sel, replacement, "v@:@@")) method_setImplementation(existing, replacement);
}

// Info.plist 里写的场景委托类。要在场景接入之前补上：实测接入之后再补，系统不来调
static void PatchDeclaredDelegates(void) {
  NSDictionary* manifest = [NSBundle.mainBundle objectForInfoDictionaryKey:@"UIApplicationSceneManifest"];
  NSDictionary* roles = [manifest isKindOfClass:NSDictionary.class] ? manifest[@"UISceneConfigurations"] : nil;
  if (![roles isKindOfClass:NSDictionary.class]) return;
  for (id configurations in roles.allValues) {
    if (![configurations isKindOfClass:NSArray.class]) continue;
    for (id configuration in (NSArray*)configurations) {
      if (![configuration isKindOfClass:NSDictionary.class]) continue;
      NSString* name = ((NSDictionary*)configuration)[@"UISceneDelegateClassName"];
      if ([name isKindOfClass:NSString.class]) PatchDelegateClass(NSClassFromString(name));
    }
  }
}

static bool IsNacrePage(UIViewController* vc) {
  return [vc isKindOfClass:NacreViewController.class] || [vc isKindOfClass:NacreNavigationController.class] ||
         [vc isKindOfClass:NacreTabBarController.class];
}

// ---- 属性 ----
static id ReadPageProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIViewController.class]) {
    UIViewController* vc = (UIViewController*)object;
    if ([key isEqualToString:@"supportedInterfaceOrientations"]) return NamesInMask(vc.supportedInterfaceOrientations);
    if ([key isEqualToString:@"preferredInterfaceOrientationForPresentation"]) {
      return NameForPageInterfaceOrientation(vc.preferredInterfaceOrientationForPresentation) ?: @"unknown";
    }
    if ([key isEqualToString:@"prefersInterfaceOrientationLocked"]) return @(vc.prefersInterfaceOrientationLocked);
    if ([key isEqualToString:@"prefersStatusBarHidden"]) return @(vc.prefersStatusBarHidden);
    if ([key isEqualToString:@"preferredStatusBarStyle"]) {
      return NameForPageStatusBarStyle(vc.preferredStatusBarStyle) ?: @"default";
    }
    return nil;
  }
  if ([object isKindOfClass:UIWindowSceneGeometry.class]) {
    UIWindowSceneGeometry* g = (UIWindowSceneGeometry*)object;
    if ([key isEqualToString:@"interfaceOrientation"]) {
      return NameForPageInterfaceOrientation(g.interfaceOrientation) ?: @"unknown";
    }
    if ([key isEqualToString:@"isInterfaceOrientationLocked"]) return @(g.isInterfaceOrientationLocked);
    if ([key isEqualToString:@"isInteractivelyResizing"]) return @(g.isInteractivelyResizing);
    return nil;
  }
  if ([object isKindOfClass:UIStatusBarManager.class]) {
    UIStatusBarManager* m = (UIStatusBarManager*)object;
    if ([key isEqualToString:@"isStatusBarHidden"]) return @(m.isStatusBarHidden);
    if ([key isEqualToString:@"statusBarStyle"]) return NameForPageStatusBarStyle(m.statusBarStyle) ?: @"default";
    if ([key isEqualToString:@"statusBarFrame"]) return RectToJSON(m.statusBarFrame);
    return nil;
  }
  if ([object isKindOfClass:UIWindowSceneGeometryPreferencesIOS.class]) {
    if ([key isEqualToString:@"interfaceOrientations"]) {
      return NamesInMask(((UIWindowSceneGeometryPreferencesIOS*)object).interfaceOrientations);
    }
    return nil;
  }
  return nil;
}

static BOOL WritePageProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIWindowSceneGeometryPreferencesIOS.class]) {
    if (![key isEqualToString:@"interfaceOrientations"]) return NO;
    UIInterfaceOrientationMask mask = 0;
    if (MaskFromNames(value, "interfaceOrientations", false, &mask, error)) {
      ((UIWindowSceneGeometryPreferencesIOS*)object).interfaceOrientations = mask;
    }
    return YES;
  }
  if (![object isKindOfClass:UIViewController.class]) return NO;
  UIViewController* vc = (UIViewController*)object;
  static NSSet<NSString*>* keys = [NSSet setWithArray:@[
    @"supportedInterfaceOrientations", @"preferredInterfaceOrientationForPresentation",
    @"prefersInterfaceOrientationLocked", @"prefersStatusBarHidden", @"preferredStatusBarStyle"
  ]];
  if (![keys containsObject:key]) return NO;
  if (!IsNacrePage(vc)) {
    *error = std::string(NSStringFromClass(vc.class).UTF8String) + "." + key.UTF8String +
             " cannot be set: only pages made with new UIViewController(), new UINavigationController() "
             "or new UITabBarController() take it from JS";
    return YES;
  }
  if ([key isEqualToString:@"supportedInterfaceOrientations"]) {
    UIInterfaceOrientationMask mask = 0;
    if (!MaskFromNames(value, "supportedInterfaceOrientations", true, &mask, error)) return YES;
    Overrides(vc, YES)[key] = @(mask);
    [vc setNeedsUpdateOfSupportedInterfaceOrientations];
    return YES;
  }
  if ([key isEqualToString:@"preferredInterfaceOrientationForPresentation"]) {
    UIInterfaceOrientation o;
    if (!PageInterfaceOrientationFromName(value, &o)) {
      *error = EnumError(key, value, NamesForPageInterfaceOrientation());
      return YES;
    }
    Overrides(vc, YES)[key] = @(o);
    return YES;
  }
  if ([key isEqualToString:@"prefersInterfaceOrientationLocked"]) {
    Overrides(vc, YES)[key] = @(NACRE_BOOL(value, key));
    [vc setNeedsUpdateOfPrefersInterfaceOrientationLocked];
    return YES;
  }
  if ([key isEqualToString:@"prefersStatusBarHidden"]) {
    Overrides(vc, YES)[key] = @(NACRE_BOOL(value, key));
    [vc setNeedsStatusBarAppearanceUpdate];
    return YES;
  }
  if ([key isEqualToString:@"preferredStatusBarStyle"]) {
    UIStatusBarStyle style;
    if (!PageStatusBarStyleFromName(value, &style)) {
      *error = EnumError(key, value, NamesForPageStatusBarStyle());
      return YES;
    }
    Overrides(vc, YES)[key] = @(style);
    [vc setNeedsStatusBarAppearanceUpdate];
    return YES;
  }
  return NO;
}

static nacre::NativeObjectRef ReadPageObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:UIWindowScene.class]) return {};
  UIWindowScene* scene = (UIWindowScene*)object;
  if (name == "effectiveGeometry") return {NacreKeep(scene.effectiveGeometry), "UIWindowSceneGeometry"};
  if (name == "statusBarManager") return {NacreKeep(scene.statusBarManager), "UIStatusBarManager"};
  return {};
}

// ---- 方法 ----
static bool CallPageVoid(id object, const std::string& name) {
  if (![object isKindOfClass:UIViewController.class]) return false;
  UIViewController* vc = (UIViewController*)object;
  if (name == "setNeedsUpdateOfSupportedInterfaceOrientations") {
    [vc setNeedsUpdateOfSupportedInterfaceOrientations];
    return true;
  }
  if (name == "setNeedsStatusBarAppearanceUpdate") {
    [vc setNeedsStatusBarAppearanceUpdate];
    return true;
  }
  if (name == "setNeedsUpdateOfPrefersInterfaceOrientationLocked") {
    [vc setNeedsUpdateOfPrefersInterfaceOrientationLocked];
    return true;
  }
  return false;
}

// 偏好对象系统当场用完，不持有。
// 返回 null（系统接受了）或者 { message, code }（系统拒绝）。系统拒绝时出错回调是
// 当场调的（实测），所以同步取得到；万一以后变成晚一点才调，只记一行日志
static bool CallPage(id object, NSString* sel, const NacreArgs& args, std::string* out,
                     std::string* error) {
  if (![object isKindOfClass:UIWindowScene.class] ||
      ![sel isEqualToString:@"requestGeometryUpdateWithPreferences:"]) {
    return false;
  }
  *out = "null";
  id prefs = args.object(0);
  if (![prefs isKindOfClass:UIWindowSceneGeometryPreferencesIOS.class]) {
    *error = "requestGeometryUpdateWithPreferences needs a UIWindowSceneGeometryPreferencesIOS";
    return true;
  }
  __block NSError* failure = nil;
  __block BOOL returned = NO;
  [(UIWindowScene*)object requestGeometryUpdateWithPreferences:prefs
                                                  errorHandler:^(NSError* e) {
                                                    if (returned) {
                                                      WriteRuntimeLog([@"requestGeometryUpdate failed late: "
                                                          stringByAppendingString:e.localizedDescription ?: @""]);
                                                      return;
                                                    }
                                                    failure = e;
                                                  }];
  returned = YES;
  if (failure != nil) {
    *out = EncodeJSON(@{@"message" : failure.localizedDescription ?: @"",
                        @"domain" : failure.domain ?: @"",
                        @"code" : @(failure.code)});
  }
  return true;
}

// ---- 构造：new UIWindowSceneGeometryPreferencesIOS([方向…]) ----
static bool ConstructPage(const std::string& className, const NacreArgs& args,
                          nacre::NativeObjectRef* out, std::string* error) {
  // 三种页面：造预置的子类。参数和核心原来的写法一样（导航控制器可以带根页面）
  if (className == "UIViewController") {
    *out = {NacreKeep([[NacreViewController alloc] init]), "UIViewController"};
    return true;
  }
  if (className == "UITabBarController") {
    *out = {NacreKeep([[NacreTabBarController alloc] init]), "UITabBarController"};
    return true;
  }
  if (className == "UINavigationController") {
    id root = args.object(0);
    UINavigationController* nav = nil;
    if ([root isKindOfClass:UIViewController.class]) {
      // 根页面如果正当着某个窗口的根，UIKit 会抛。接住，返回空：JS 侧拿不到句柄会抛
      @try {
        nav = [[NacreNavigationController alloc] initWithRootViewController:root];
      } @catch (NSException* e) {
        nav = nil;
      }
      if (nav == nil) return true;
    } else {
      nav = [[NacreNavigationController alloc] init];
    }
    *out = {NacreKeep(nav), "UINavigationController"};
    return true;
  }
  if (className != "UIWindowSceneGeometryPreferencesIOS") return false;
  id names = args.value(0);
  UIInterfaceOrientationMask mask = 0;
  if (names != nil && names != NSNull.null && !MaskFromNames(names, "interfaceOrientations", false, &mask, error)) {
    return true;
  }
  *out = {NacreKeep([[UIWindowSceneGeometryPreferencesIOS alloc] initWithInterfaceOrientations:mask]),
          "UIWindowSceneGeometryPreferencesIOS"};
  return true;
}

// ---- 订阅：场景上的 geometrychange ----
static NacreSubscribed SubscribePage(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UIWindowScene.class] || ![type isEqualToString:@"geometrychange"]) return false;
  objc_setAssociatedObject(object, kNacreGeometrySubscribedKey, on ? @YES : nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  return true;
}

}  // namespace nacre_bridge

// 三个预置子类。五个 getter：设过值返回设的值，没设过调父类
#define NACRE_PAGE_OVERRIDES                                                                     \
  -(UIInterfaceOrientationMask)supportedInterfaceOrientations {                                  \
    NSNumber* v = nacre_bridge::PageOverride(self, @"supportedInterfaceOrientations");            \
    return v != nil ? (UIInterfaceOrientationMask)v.unsignedIntegerValue                          \
                    : [super supportedInterfaceOrientations];                                     \
  }                                                                                              \
  -(UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {                        \
    NSNumber* v = nacre_bridge::PageOverride(self, @"preferredInterfaceOrientationForPresentation"); \
    return v != nil ? (UIInterfaceOrientation)v.integerValue                                     \
                    : [super preferredInterfaceOrientationForPresentation];                      \
  }                                                                                              \
  -(BOOL)prefersInterfaceOrientationLocked {                                                     \
    NSNumber* v = nacre_bridge::PageOverride(self, @"prefersInterfaceOrientationLocked");         \
    return v != nil ? v.boolValue : [super prefersInterfaceOrientationLocked];                   \
  }                                                                                              \
  -(BOOL)prefersStatusBarHidden {                                                                \
    NSNumber* v = nacre_bridge::PageOverride(self, @"prefersStatusBarHidden");                    \
    return v != nil ? v.boolValue : [super prefersStatusBarHidden];                              \
  }                                                                                              \
  -(UIStatusBarStyle)preferredStatusBarStyle {                                                   \
    NSNumber* v = nacre_bridge::PageOverride(self, @"preferredStatusBarStyle");                   \
    return v != nil ? (UIStatusBarStyle)v.integerValue : [super preferredStatusBarStyle];         \
  }

@implementation NacreViewController
NACRE_PAGE_OVERRIDES
@end
@implementation NacreNavigationController
NACRE_PAGE_OVERRIDES
@end
@implementation NacreTabBarController
NACRE_PAGE_OVERRIDES
@end

@interface NacrePageOverridesDomain : NSObject
@end
@implementation NacrePageOverridesDomain
+ (void)load {
  nacre_bridge::PatchDeclaredDelegates();
  nacre_bridge::NacreDomain d;
  d.name = "page-overrides";
  d.classes = {UIViewController.class, UIWindowScene.class, UIWindowSceneGeometry.class, UIStatusBarManager.class,
               UIWindowSceneGeometryPreferencesIOS.class};
  d.read = nacre_bridge::ReadPageProperty;
  d.write = nacre_bridge::WritePageProperty;
  d.readObject = nacre_bridge::ReadPageObjectProperty;
  d.callVoid = nacre_bridge::CallPageVoid;
  d.call = nacre_bridge::CallPage;
  d.construct = nacre_bridge::ConstructPage;
  d.subscribe = nacre_bridge::SubscribePage;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
