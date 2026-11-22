// 远程推送：application.remoteNotifications（@nacrejs/push）。
//
// 向 Apple 注册、拿设备令牌，和静默推送（后台唤醒 App 拉数据）。能看见的推送
// （横幅、声音）到了和被点了，由 @nacrejs/user-notifications 的通知中心派发，
// 远程的和本地的走同一条路，这个包不管。
//
// 系统把这三件事交给 **App 的委托**（UIApplicationDelegate），不是通知中心：
//   application:didRegisterForRemoteNotificationsWithDeviceToken:     拿到令牌
//   application:didFailToRegisterForRemoteNotificationsWithError:     注册失败
//   application:didReceiveRemoteNotification:fetchCompletionHandler:  静默推送
//
// App 的委托是启动壳里的类，启动壳要设计成不需要被改。所以照 openurl 给场景
// 委托补方法的做法（NacreOpenURL.mm），由这个包在运行期给那个类补上这三个方法：
// 它没实现的就加上，实现了的就包一层，先调原来的再转给 JS。
//
// 补的时机是 -[UIApplication setDelegate:]：UIKit 在设委托的那一刻记下委托会
// 回答哪些方法，之后才补上的它不一定来问。所以 +load 里换掉 setDelegate:，
// 在原来的实现之前先把委托的类补好。+load 在 main() 之前，委托那时还没设。
//
// 这是一个能力包，编进另一个 framework，只用给能力包的那个头（NacreExtension.h）。
#import <Nacre/NacreExtension.h>

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <objc/runtime.h>

namespace {

const char* const kClass = "RemoteNotifications";

NSString* HexFromData(NSData* data) {
  const unsigned char* bytes = (const unsigned char*)data.bytes;
  NSMutableString* hex = [NSMutableString stringWithCapacity:data.length * 2];
  for (NSUInteger i = 0; i < data.length; i++) [hex appendFormat:@"%02x", bytes[i]];
  return hex;
}

NacreAsyncResult* Failure(NSString* name, NSString* message) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = name;
  r.errorMessage = message;
  return r;
}

}  // namespace

// application.remoteNotifications 包的原生对象。App 级的单例，只在主线程上用
@interface NacrePushHub : NSObject
+ (instancetype)shared;
@property(nonatomic, copy, nullable) NSString* token;
// 在等 register() 结果的
@property(nonatomic, strong) NSMutableArray<NacreAsyncDone>* pending;
// JS 那一侧订着的事件
@property(nonatomic) BOOL wantsTokenChange;
@property(nonatomic) BOOL wantsPush;
// 静默推送：号 → 系统给的完成回调。JS 那边的 waitUntil 都落定了再调
@property(nonatomic, strong) NSMutableDictionary<NSNumber*, void (^)(UIBackgroundFetchResult)>* fetches;
@property(nonatomic) NSInteger nextFetch;
@end

@implementation NacrePushHub

+ (instancetype)shared {
  static NacrePushHub* shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [NacrePushHub new];
    shared.pending = [NSMutableArray array];
    shared.fetches = [NSMutableDictionary dictionary];
  });
  return shared;
}

- (void)receivedToken:(NSData*)data {
  NSString* hex = HexFromData(data);
  const BOOL changed = ![hex isEqualToString:self.token ?: @""];
  self.token = hex;
  NSArray<NacreAsyncDone>* waiting = [self.pending copy];
  [self.pending removeAllObjects];
  for (NacreAsyncDone done in waiting) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    r.json = hex;
    done(r);
  }
  if (changed && self.wantsTokenChange) {
    nacre_bridge::NacreEmitEvent(self, kClass, @"tokenchange");
  }
}

- (void)failedToRegister:(NSError*)error {
  NSArray<NacreAsyncDone>* waiting = [self.pending copy];
  [self.pending removeAllObjects];
  for (NacreAsyncDone done in waiting) {
    // 映射不到 Web 的哪个名字：上层的兜底是 OperationError，系统的原值进 cause
    NacreAsyncResult* r = Failure(@"OperationError", error.localizedDescription ?: @"registration failed");
    r.errorCode = error.code;
    r.errorDomain = error.domain ?: @"";
    done(r);
  }
}

// 静默推送。没人听就当场告诉系统「没有新数据」；有人听就记下完成回调，发一个
// 内部事件给 JS（JS 在那边建 PushEvent、等 waitUntil，落定了再调回来）
- (void)receivedPush:(NSDictionary*)payload
          completion:(void (^)(UIBackgroundFetchResult))completion {
  if (!self.wantsPush) {
    completion(UIBackgroundFetchResultNoData);
    return;
  }
  const NSInteger number = ++self.nextFetch;
  self.fetches[@(number)] = [completion copy];
  id data = [NSJSONSerialization isValidJSONObject:payload] ? payload : @{};
  NSString* json = @(nacre_bridge::EncodeJSON(@{@"id": @(number), @"data": data}).c_str());
  nacre_bridge::NacreEmitEventWithJSON(self, kClass, @"@push", json);
}

- (void)finishPush:(NSInteger)number result:(NSString*)result {
  void (^completion)(UIBackgroundFetchResult) = self.fetches[@(number)];
  if (completion == nil) return;   // 已经交过了
  [self.fetches removeObjectForKey:@(number)];
  UIBackgroundFetchResult value = UIBackgroundFetchResultNoData;
  if ([result isEqualToString:@"newData"]) value = UIBackgroundFetchResultNewData;
  if ([result isEqualToString:@"failed"]) value = UIBackgroundFetchResultFailed;
  completion(value);
}

@end

// ---- 给 App 的委托补方法 ----
namespace {

// 补过的类。一个类只补一次
NSMutableSet<Class>* PatchedClasses(void) {
  static NSMutableSet<Class>* set = [NSMutableSet set];
  return set;
}

// 给 cls 补上 selector：它（或父类）有实现就包一层，先调原来的；没有就加上
void Patch(Class cls, SEL selector, id block) {
  Method existing = class_getInstanceMethod(cls, selector);
  struct objc_method_description description = protocol_getMethodDescription(
      @protocol(UIApplicationDelegate), selector, NO, YES);
  const char* types = existing != NULL ? method_getTypeEncoding(existing) : description.types;
  IMP replacement = imp_implementationWithBlock(block);
  if (existing == NULL) {
    class_addMethod(cls, selector, replacement, types);
    return;
  }
  // 实现可能在父类上：先在这个类上加一份，再换掉这个类自己的
  IMP original = method_getImplementation(existing);
  if (!class_addMethod(cls, selector, replacement, types)) {
    method_setImplementation(existing, replacement);
  }
  objc_setAssociatedObject(cls, selector, [NSValue valueWithPointer:(const void*)original],
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

IMP OriginalOf(Class cls, SEL selector) {
  for (Class c = cls; c != Nil; c = class_getSuperclass(c)) {
    NSValue* value = objc_getAssociatedObject(c, selector);
    if (value != nil) return (IMP)value.pointerValue;
  }
  return NULL;
}

void PatchDelegateClass(Class cls) {
  if (cls == Nil || [PatchedClasses() containsObject:cls]) return;
  [PatchedClasses() addObject:cls];

  SEL token = @selector(application:didRegisterForRemoteNotificationsWithDeviceToken:);
  Patch(cls, token, ^(id me, UIApplication* app, NSData* data) {
    IMP original = OriginalOf(object_getClass(me), token);
    if (original != NULL) ((void (*)(id, SEL, UIApplication*, NSData*))original)(me, token, app, data);
    [NacrePushHub.shared receivedToken:data];
  });

  SEL fail = @selector(application:didFailToRegisterForRemoteNotificationsWithError:);
  Patch(cls, fail, ^(id me, UIApplication* app, NSError* error) {
    IMP original = OriginalOf(object_getClass(me), fail);
    if (original != NULL) ((void (*)(id, SEL, UIApplication*, NSError*))original)(me, fail, app, error);
    [NacrePushHub.shared failedToRegister:error];
  });

  // 静默推送：完成回调只能调一次。委托自己实现了这个方法，就由它回答系统，
  // JS 的 push 事件照样派发，但它的 waitUntil 不再决定结果
  SEL fetch = @selector(application:didReceiveRemoteNotification:fetchCompletionHandler:);
  Patch(cls, fetch, ^(id me, UIApplication* app, NSDictionary* payload,
                      void (^completion)(UIBackgroundFetchResult)) {
    IMP original = OriginalOf(object_getClass(me), fetch);
    if (original != NULL) {
      ((void (*)(id, SEL, UIApplication*, NSDictionary*, void (^)(UIBackgroundFetchResult)))original)(
          me, fetch, app, payload, completion);
      [NacrePushHub.shared receivedPush:payload completion:^(UIBackgroundFetchResult) {}];
      return;
    }
    [NacrePushHub.shared receivedPush:payload completion:completion];
  });
}

}  // namespace

namespace nacre_bridge {

static id ReadPushProperty(id object, NSString* key) {
  if (![object isKindOfClass:NacrePushHub.class]) return nil;
  if ([key isEqualToString:@"token"]) return NacrePushHub.shared.token ?: (id)NSNull.null;
  if ([key isEqualToString:@"isRegistered"]) {
    return @(UIApplication.sharedApplication.isRegisteredForRemoteNotifications);
  }
  return nil;
}

static bool PushCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                     std::string* error) {
  if (![object isKindOfClass:NacrePushHub.class]) return false;
  if ([sel isEqualToString:@"unregisterForRemoteNotifications"]) {
    [UIApplication.sharedApplication unregisterForRemoteNotifications];
    *out = "null";
    return true;
  }
  // JS 那边的 waitUntil 都落定了：参数是号和结果的名字
  if ([sel isEqualToString:@"nacre:finishPush"]) {
    id number = args.value(0);
    id result = args.value(1);
    if (![number isKindOfClass:NSNumber.class] || ![result isKindOfClass:NSString.class]) {
      *error = "nacre:finishPush needs an id and a result name";
      return true;
    }
    [NacrePushHub.shared finishPush:[number integerValue] result:result];
    *out = "null";
    return true;
  }
  return false;
}

static bool PushCallAsync(id object, const std::string& name, const std::string& argsJSON,
                          const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacrePushHub.class]) return false;
  if (name != "registerForRemoteNotifications") return false;
  // 同时等着的几个一起兑现，只向系统注册一次：系统每注册一次就回一次，多注册的
  // 那几次回应会晚到，那时已经没有人在等了
  const BOOL first = NacrePushHub.shared.pending.count == 0;
  [NacrePushHub.shared.pending addObject:[done copy]];
  if (!first) return true;
  // 委托万一是在这个包加载之前就设好的（宿主自己在别处设），这里再补一次
  PatchDelegateClass(object_getClass(UIApplication.sharedApplication.delegate));
  [UIApplication.sharedApplication registerForRemoteNotifications];
  return true;
}

static nacre::NativeObjectRef PushClassObject(const std::string& className, const std::string& name) {
  if (className != kClass || name != "shared") return {};
  return {NacreKeep(NacrePushHub.shared), kClass};
}

static NacreSubscribed PushSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:NacrePushHub.class]) return false;
  if ([type isEqualToString:@"tokenchange"]) {
    NacrePushHub.shared.wantsTokenChange = on;
    return true;
  }
  if ([type isEqualToString:@"push"]) {
    NacrePushHub.shared.wantsPush = on;
    return true;
  }
  return NacreSubscribed::UnknownEvent;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacrePushRegistration : NSObject
@end
@implementation NacrePushRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "push";
  d.classes = {NacrePushHub.class};
  d.read = nacre_bridge::ReadPushProperty;
  d.call = nacre_bridge::PushCall;
  d.callAsync = nacre_bridge::PushCallAsync;
  d.classObject = nacre_bridge::PushClassObject;
  d.subscribe = nacre_bridge::PushSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
  nacre_bridge::NacreRegisterBuiltinParts(self);

  // 在 UIKit 记下委托会回答哪些方法之前，先把委托的类补好
  Method setDelegate = class_getInstanceMethod(UIApplication.class, @selector(setDelegate:));
  __block IMP original = method_getImplementation(setDelegate);
  method_setImplementation(setDelegate, imp_implementationWithBlock(^(UIApplication* app, id delegate) {
    if (delegate != nil) PatchDelegateClass(object_getClass(delegate));
    ((void (*)(id, SEL, id))original)(app, @selector(setDelegate:), delegate);
  }));
}
@end
