// 跟踪授权和广告标识：ATTrackingManager、ASIdentifierManager。
//
// 这是一个能力包，不在核心里：它编进单独的 framework，装了
// @nacrejs/app-tracking-transparency 的项目才嵌它。拆出来的原因是这两个系统
// 框架一旦被链接，App 就得在 Info.plist 里写 NSUserTrackingUsageDescription
// （一句给用户看的话），而大多数 App 用不到广告标识。
//
// 只用给能力包的那个头，不碰核心的内部头 NacreBridge.h。
//
// 两个类都没有实例要管：
//   ATTrackingManager    全是类级的成员，不能创建（头文件里 init 和 new 都标了不可用）
//   ASIdentifierManager  从 +sharedManager 取。名字叫 shared，实测系统每次给的是
//                        一个新对象；「每次同一个」是 JS 那一侧保住的（见 part）
#import <Nacre/NacreExtension.h>

#import <AdSupport/AdSupport.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>
#import <Foundation/Foundation.h>

namespace nacre_bridge {

// 授权状态。JS 那一侧是字符串，名字是常量去掉前缀、首字母小写
NACRE_ENUM_MAP(TrackingAuthorizationStatus, ATTrackingManagerAuthorizationStatus,
               @"notDetermined": @(ATTrackingManagerAuthorizationStatusNotDetermined),
               @"restricted": @(ATTrackingManagerAuthorizationStatusRestricted),
               @"denied": @(ATTrackingManagerAuthorizationStatusDenied),
               @"authorized": @(ATTrackingManagerAuthorizationStatusAuthorized))

// 没有这一句权限文案时，系统在申请授权的那一刻直接终止 App，JS 接不住。
// CLI 生成工程时已经核对过（这个包的清单里写了 requires.infoPlist），这里
// 再拦一次是给不走 CLI、自己搭宿主工程的情况：把终止换成一个报错
static BOOL HasUsageDescription() {
  id text = [NSBundle.mainBundle objectForInfoDictionaryKey:@"NSUserTrackingUsageDescription"];
  return [text isKindOfClass:NSString.class] && ((NSString*)text).length > 0;
}

// ---- ATTrackingManager：类级的两个成员 ----
static bool AppTrackingClassCall(const std::string& className, NSString* sel,
                                 const NacreArgs& args, std::string* out,
                                 std::string* error) {
  if (className != "ATTrackingManager") return false;

  // @property(class, readonly) trackingAuthorizationStatus
  if ([sel isEqualToString:@"trackingAuthorizationStatus"]) {
    const ATTrackingManagerAuthorizationStatus status =
        ATTrackingManager.trackingAuthorizationStatus;
    NSString* name = NameForTrackingAuthorizationStatus(status);
    if (name == nil) {
      // 表里没有的数值：系统以后加了新的状态。不编一个名字出来
      *error = "trackingAuthorizationStatus has a value this runtime does not know (" +
               std::to_string((unsigned long)status) + ")";
      return true;
    }
    // 名字只有英文字母，直接拼成 JSON 的字符串
    *out = std::string("\"") + name.UTF8String + "\"";
    return true;
  }

  // +requestTrackingAuthorizationWithCompletionHandler:
  // 参数是 JS 那一侧登记的代码块的号，系统答复之后按号调回去
  if ([sel isEqualToString:@"requestTrackingAuthorizationWithCompletionHandler:"]) {
    id given = args.value(0);
    if (![given isKindOfClass:NSNumber.class]) {
      *error = "requestTrackingAuthorization: completion must be a block id";
      return true;
    }
    const NSInteger completion = ((NSNumber*)given).integerValue;
    if (!HasUsageDescription()) {
      *error = "requestTrackingAuthorization needs NSUserTrackingUsageDescription in "
               "Info.plist; without it the system terminates the app";
      return true;
    }
    [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(
                           ATTrackingManagerAuthorizationStatus status) {
      NSString* name = NameForTrackingAuthorizationStatus(status);
      // 认不出的数值交 null 和原值，JS 那一侧拒掉 Promise
      NSString* json = name != nil
                           ? [NSString stringWithFormat:@"[\"%@\"]", name]
                           : [NSString stringWithFormat:@"[null,%lu]", (unsigned long)status];
      // 头文件没说这个回调在哪个线程上来，所以先回主线程。NacreCallBlockLater
      // 再延后一轮：状态已经定了的时候系统可能在上面那次调用里面就答复，
      // 那时 JS 还在调原生的半路上
      dispatch_async(dispatch_get_main_queue(), ^{
        NacreCallBlockLater(completion, json);
      });
    }];
    *out = "null";
    return true;
  }
  return false;
}

// ---- ASIdentifierManager ----
// +sharedManager。头文件里它是类方法，不是类属性。JS 那一侧只调一次
static bool AppTrackingClassCallObject(const std::string& className, NSString* sel,
                                       const NacreArgs& args, nacre::NativeObjectRef* out,
                                       std::string* error) {
  if (className != "ASIdentifierManager") return false;
  if ([sel isEqualToString:@"sharedManager"]) {
    *out = {NacreKeep([ASIdentifierManager sharedManager]), "ASIdentifierManager"};
    return true;
  }
  return false;
}

static id ReadAppTrackingProperty(id object, NSString* key) {
  if (![object isKindOfClass:ASIdentifierManager.class]) return nil;
  ASIdentifierManager* manager = (ASIdentifierManager*)object;
  // NSUUID 过不了桥，给它的字符串形式（大写，带连字符）。没授权时系统给的
  // 是全零的那个值，照实交出去，不换成 null
  if ([key isEqualToString:@"advertisingIdentifier"]) {
    return manager.advertisingIdentifier.UUIDString ?: (id)NSNull.null;
  }
  // advertisingTrackingEnabled 不接：iOS 14 起废弃，替代品是上面的
  // trackingAuthorizationStatus
  return nil;
}

}  // namespace nacre_bridge

// ---- 登记 ----
//
// +load 在类被加载时自动调用：framework 被嵌进 App 就一定会走到，宿主不用写
// 任何代码。放在文件末尾是因为要取上面几个函数的地址。
@interface NacreAppTrackingTransparencyDomain : NSObject
@end
@implementation NacreAppTrackingTransparencyDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "app-tracking-transparency";
  d.classes = {ASIdentifierManager.class};
  d.read = nacre_bridge::ReadAppTrackingProperty;
  d.classCall = nacre_bridge::AppTrackingClassCall;
  d.classCallObject = nacre_bridge::AppTrackingClassCallObject;
  nacre_bridge::NacreRegisterDomain(d);
  // JS 那一半（两个类的定义）在这个 framework 自己的 Builtin/parts/ 下
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
