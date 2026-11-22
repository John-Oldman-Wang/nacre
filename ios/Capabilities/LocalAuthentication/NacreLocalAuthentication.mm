// 面容 ID / 触控 ID 认证：LAContext。
//
// 这是一个能力包，不在核心里：用它的 App 要在 Info.plist 里写
// NSFaceIDUsageDescription，而不是每个 App 都有认证这件事（project.md 3.8 节）。
// 所以它编进单独的 framework，项目装了 @nacrejs/local-authentication 才嵌进去。
//
// 只用给能力包的那个头，不碰核心的内部头 NacreBridge.h。那边的取参宏
// （NACRE_NUM / NACRE_BOOL）因此拿不到，类型校验在这个文件里自己写：规矩
// 一样——转换在 JS 一侧做完，这里只校验，类型不对就填报错。
//
// 暴露的面：
//   new LAContext()
//   canEvaluatePolicy:error:            同步，拆成两个方法：canEvaluatePolicy() 返回
//                                       布尔，canEvaluatePolicyError() 返回出参的那个
//                                       错误（能认证时是 null）
//   evaluatePolicy:localizedReason:reply:   异步，Promise
//   invalidate
//   biometryType（只读）、localizedFallbackTitle、localizedCancelTitle、
//   touchIDAuthenticationAllowableReuseDuration、interactionNotAllowed
#import <Nacre/NacreExtension.h>

#import <Foundation/Foundation.h>
#import <LocalAuthentication/LocalAuthentication.h>

#include <cmath>

namespace nacre_bridge {

// 认证策略。iOS 上还有配套设备（手表）的两种（iOS 18 起），没有暴露：
// 手边没有能验的设备。
NACRE_ENUM_MAP(LocalAuthPolicy, LAPolicy,
               @"deviceOwnerAuthenticationWithBiometrics":
                   @(LAPolicyDeviceOwnerAuthenticationWithBiometrics),
               @"deviceOwnerAuthentication": @(LAPolicyDeviceOwnerAuthentication))

// 设备支持哪一种生物认证。opticID 在 iPhone 上不会出现，但读出来的值必须
// 每一个都叫得出名字
NACRE_ENUM_MAP(LocalAuthBiometryType, LABiometryType,
               @"none": @(LABiometryTypeNone),
               @"touchID": @(LABiometryTypeTouchID),
               @"faceID": @(LABiometryTypeFaceID),
               @"opticID": @(LABiometryTypeOpticID))

// ---- 校验 ----
// JSON 解出来的布尔是 CFBoolean 那两个单例，数是别的 NSNumber
static BOOL IsBoolean(id given) {
  return given == (__bridge id)kCFBooleanTrue || given == (__bridge id)kCFBooleanFalse;
}

static BOOL IsFiniteNumber(id given) {
  if (![given isKindOfClass:NSNumber.class] || IsBoolean(given)) return NO;
  NSNumber* number = (NSNumber*)given;
  return std::isfinite(number.doubleValue);
}

static std::string TypeMessage(NSString* what, NSString* expected) {
  return [NSString stringWithFormat:@"%@ must be %@", what, expected].UTF8String;
}

// ---- 属性 ----
static id ReadLocalAuthenticationProperty(id object, NSString* key) {
  if (![object isKindOfClass:LAContext.class]) return nil;
  LAContext* context = (LAContext*)object;
  if ([key isEqualToString:@"biometryType"]) {
    return NameForLocalAuthBiometryType(context.biometryType);
  }
  if ([key isEqualToString:@"localizedFallbackTitle"]) {
    return context.localizedFallbackTitle ?: (id)NSNull.null;
  }
  if ([key isEqualToString:@"localizedCancelTitle"]) {
    return context.localizedCancelTitle ?: (id)NSNull.null;
  }
  if ([key isEqualToString:@"touchIDAuthenticationAllowableReuseDuration"]) {
    return @(context.touchIDAuthenticationAllowableReuseDuration);
  }
  if ([key isEqualToString:@"interactionNotAllowed"]) {
    return context.interactionNotAllowed ? @YES : @NO;
  }
  return nil;
}

static BOOL WriteLocalAuthenticationProperty(id object, NSString* key, id value,
                                             std::string* error) {
  if (![object isKindOfClass:LAContext.class]) return NO;
  LAContext* context = (LAContext*)object;
  BOOL isFallback = [key isEqualToString:@"localizedFallbackTitle"];
  if (isFallback || [key isEqualToString:@"localizedCancelTitle"]) {
    NSString* title = nil;
    if ([value isKindOfClass:NSString.class]) {
      title = (NSString*)value;
    } else if (value != nil && value != NSNull.null) {
      *error = TypeMessage(key, @"a string or null");
      return YES;
    }
    if (isFallback) {
      context.localizedFallbackTitle = title;
    } else {
      context.localizedCancelTitle = title;
    }
    return YES;
  }
  if ([key isEqualToString:@"touchIDAuthenticationAllowableReuseDuration"]) {
    if (!IsFiniteNumber(value)) {
      *error = TypeMessage(key, @"a finite number");
      return YES;
    }
    NSNumber* seconds = (NSNumber*)value;
    // 系统自己不拦负数（实测写 -5 读回 -5），而负的时长没有含义。超过五分钟
    // 的不拦：头文件写的是「超过了也不会更久」，那是系统的事实
    if (seconds.doubleValue < 0) {
      *error = "touchIDAuthenticationAllowableReuseDuration must not be negative";
      return YES;
    }
    context.touchIDAuthenticationAllowableReuseDuration = seconds.doubleValue;
    return YES;
  }
  if ([key isEqualToString:@"interactionNotAllowed"]) {
    if (!IsBoolean(value)) {
      *error = TypeMessage(key, @"true or false");
      return YES;
    }
    context.interactionNotAllowed = value == (__bridge id)kCFBooleanTrue;
    return YES;
  }
  return NO;
}

// ---- 构造 ----
static bool LocalAuthenticationConstruct(const std::string& className, const NacreArgs& args,
                                         nacre::NativeObjectRef* out, std::string* error) {
  if (className != "LAContext") return false;
  *out = {NacreKeep([[LAContext alloc] init]), className};
  return true;
}

static NSString* LocalAuthenticationErrorName(NSError* error);

// 出参的 NSError → 给 JS 的那份字段。和 evaluatePolicy 拒绝时的错误是同一套：
// name 是哪一种，code / domain 是系统的原值
static std::string PolicyErrorJSON(NSError* error) {
  NSString* message = error.localizedDescription.length ? error.localizedDescription
                                                        : @"Policy cannot be evaluated";
  NSDictionary* fields = @{
    // 返回 NO 却没给 error：头文件不承诺这种情况不发生，给一个认得出来的兜底
    @"name": error != nil ? LocalAuthenticationErrorName(error) : @"NSError",
    @"message": message,
    @"code": @(error != nil ? error.code : 0),
    @"domain": error.domain ?: LAErrorDomain,
  };
  NSData* data = [NSJSONSerialization dataWithJSONObject:fields options:0 error:nil];
  NSString* text = data != nil ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
                               : nil;
  return text != nil ? std::string(text.UTF8String) : "null";
}

// ---- 同步的方法 ----
static bool LocalAuthenticationCallMethod(id object, NSString* sel, const NacreArgs& args,
                                          std::string* out, std::string* error) {
  if (![object isKindOfClass:LAContext.class]) return false;
  LAContext* context = (LAContext*)object;
  *out = "null";
  if ([sel isEqualToString:@"canEvaluatePolicy:"]) {
    LAPolicy policy;
    if (!LocalAuthPolicyFromName(args.value(0), &policy)) {
      *error = EnumError(@"canEvaluatePolicy", args.value(0), NamesForLocalAuthPolicy());
      return true;
    }
    // 出参的 NSError 说的是「为什么不行」，从 canEvaluatePolicyError() 给
    *out = [context canEvaluatePolicy:policy error:nil] ? "true" : "false";
    return true;
  }
  // canEvaluatePolicy:error: 的出参那一半。能认证时是 null，不能时是错误的
  // 字段（JS 那一侧建成 Error 返回，不抛：「不能」是正常的答案）
  if ([sel isEqualToString:@"canEvaluatePolicyError:"]) {
    LAPolicy policy;
    if (!LocalAuthPolicyFromName(args.value(0), &policy)) {
      *error = EnumError(@"canEvaluatePolicyError", args.value(0), NamesForLocalAuthPolicy());
      return true;
    }
    NSError* why = nil;
    BOOL can = [context canEvaluatePolicy:policy error:&why];
    *out = can ? "null" : PolicyErrorJSON(why);
    return true;
  }
  if ([sel isEqualToString:@"invalidate"]) {
    [context invalidate];
    return true;
  }
  // evaluatePolicy 是异步的那条通道，写错策略只能拒绝 Promise。JS 那一侧先
  // 走这里把策略验一遍，这样参数错误一律是同步抛的 TypeError
  if ([sel isEqualToString:@"nacre:checkPolicy:"]) {
    LAPolicy policy;
    if (!LocalAuthPolicyFromName(args.value(0), &policy)) {
      *error = EnumError(@"evaluatePolicy", args.value(0), NamesForLocalAuthPolicy());
    }
    return true;
  }
  return false;
}

// ---- 认证 ----
// LAError → err.name。名字是常量去掉 LAError 前缀、加 Error 后缀；原值在
// err.code 里。只列 iOS 上、这两种策略会出现的；其余的统一叫 NSError
static NSString* LocalAuthenticationErrorName(NSError* error) {
  if (![error.domain isEqualToString:LAErrorDomain]) return @"NSError";
  switch (error.code) {
    case LAErrorAuthenticationFailed: return @"AuthenticationFailedError";
    case LAErrorUserCancel: return @"UserCancelError";
    case LAErrorUserFallback: return @"UserFallbackError";
    case LAErrorSystemCancel: return @"SystemCancelError";
    case LAErrorPasscodeNotSet: return @"PasscodeNotSetError";
    case LAErrorBiometryNotAvailable: return @"BiometryNotAvailableError";
    case LAErrorBiometryNotEnrolled: return @"BiometryNotEnrolledError";
    case LAErrorBiometryLockout: return @"BiometryLockoutError";
    case LAErrorAppCancel: return @"AppCancelError";
    case LAErrorInvalidContext: return @"InvalidContextError";
    case LAErrorNotInteractive: return @"NotInteractiveError";
    default: return @"NSError";
  }
}

static NacreAsyncResult* ArgumentFailure(const std::string& message) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = @"TypeError";
  r.errorMessage = @(message.c_str());
  r.errorCode = 0;
  r.errorDomain = @"";
  return r;
}

static bool LocalAuthenticationCallAsync(id object, const std::string& name,
                                         const std::string& argsJSON,
                                         const std::vector<void*>& argPtrs,
                                         NacreAsyncDone done) {
  if (![object isKindOfClass:LAContext.class]) return false;
  NSString* sel = @(name.c_str());
  if (![sel isEqualToString:@"evaluatePolicy:localizedReason:"]) return false;
  LAContext* context = (LAContext*)object;
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id policyName = args.count > 0 ? args[0] : nil;
  id reason = args.count > 1 ? args[1] : nil;

  // JS 那一侧已经同步验过一遍，这里是原生自己的底线：这两种情况系统的做法
  // 是抛 NSInvalidArgumentException（实测），不能让它走到那一步
  LAPolicy policy;
  if (!LocalAuthPolicyFromName(policyName, &policy)) {
    done(ArgumentFailure(EnumError(@"evaluatePolicy", policyName, NamesForLocalAuthPolicy())));
    return true;
  }
  if (![reason isKindOfClass:NSString.class] || [(NSString*)reason length] == 0) {
    done(ArgumentFailure("evaluatePolicy: localizedReason must be a non-empty string"));
    return true;
  }

  // reply 在系统的私有队列上调（实测不在主线程）。done 可以在任何线程调，
  // 回主线程兑现是核心的事。block 捕获 context，认证期间它不会被释放
  [context evaluatePolicy:policy
          localizedReason:(NSString*)reason
                    reply:^(BOOL success, NSError* error) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    if (success) {
      r.boolValue = YES;
    } else {
      r.isError = YES;
      r.errorName = LocalAuthenticationErrorName(error);
      r.errorMessage = error.localizedDescription.length ? error.localizedDescription
                                                         : @"Authentication failed";
      r.errorCode = error.code;
      r.errorDomain = error.domain ?: LAErrorDomain;
    }
    (void)context;
    done(r);
  }];
  return true;
}

}  // namespace nacre_bridge

// ---- 登记 ----
// +load 在 framework 被加载时自动调用：嵌进 App 就一定走到，宿主不用写代码。
@interface NacreLocalAuthenticationRegistration : NSObject
@end

@implementation NacreLocalAuthenticationRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "local-authentication";
  d.classes = {LAContext.class};
  d.read = nacre_bridge::ReadLocalAuthenticationProperty;
  d.write = nacre_bridge::WriteLocalAuthenticationProperty;
  d.call = nacre_bridge::LocalAuthenticationCallMethod;
  d.callAsync = nacre_bridge::LocalAuthenticationCallAsync;
  d.construct = nacre_bridge::LocalAuthenticationConstruct;
  nacre_bridge::NacreRegisterDomain(d);
  // JS 那一半（LAContext 类）在这个 framework 自己的 Builtin/parts/ 下
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
