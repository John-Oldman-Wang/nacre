// 定位：CLLocationManager，只做「使用 App 期间」的定位。
//
// 这是一个能力包（@nacrejs/core-location），编进的是另一个 framework，所以只用
// 给能力包的那个头，不碰核心的内部头 NacreBridge.h。核心里的取参宏
// （NACRE_NUM 一类）在内部头里，这里拿不到：JS 给的值在下面的 MetersFromJS
// 里自己校验——规矩是同一条，类型不对就报错，不转换。
//
// 登记用 NacreRegisterDomain（一张表），不是钥匙串那种旧的两个 handler。
//
// 做了的：
//   - 构造、授权状态（两个只读属性）、申请「使用期间」的授权
//   - desiredAccuracy、distanceFilter
//   - 连续更新（start / stop）、取一次（requestLocation）、最近一次的位置
//   - 委托的三个方法转成事件：locationupdate / locationerror /
//     authorizationchange
//
// 没做的（JS 那一侧根本没有这些名字）：始终定位、后台定位、地理围栏、
// 指南针、临时的精确位置、地理编码。
//
// 位置（CLLocation）不包装成原生对象：它是不可变的值，过桥的是一个 JSON 对象，
// JS 那一侧建成只读的值。
#import <Nacre/NacreExtension.h>

#import <CoreLocation/CoreLocation.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <objc/runtime.h>

#include <cmath>

// ---- 委托 ----
//
// CLLocationManager.delegate 是它自己的槽位，没有别的域要用，直接装。
// **建对象时就装**，不等第一个监听器：系统在建好对象之后会主动通知一次授权
// 状态，而它只通知那一刻已经装上的委托（在 Mac 上量的：建好就装的委托收到了，
// 1.5 秒之后才装的没收到，换一个委托也不会重新通知）。
//
// 它不持有任何 JS 函数。manager 通过关联对象持有它，manager.delegate 是弱的。
@interface NacreLocationDelegate : NSObject <CLLocationManagerDelegate>
// 三个事件各自有没有监听器。没有就不派发
@property(nonatomic) BOOL wantsUpdates;
@property(nonatomic) BOOL wantsErrors;
@property(nonatomic) BOOL wantsAuthorization;
// startUpdatingLocation 之后、stopUpdatingLocation 之前
@property(nonatomic) BOOL updating;
// 还没结算的 requestLocation() / requestWhenInUseAuthorization()
@property(nonatomic, strong) NSMutableArray<NacreAsyncDone>* locationWaiters;
@property(nonatomic, strong) NSMutableArray<NacreAsyncDone>* authorizationWaiters;
- (void)rejectLocationWaiters:(NacreAsyncResult*)failure;
@end

static const void* kNacreLocationDelegateKey = &kNacreLocationDelegateKey;

namespace nacre_bridge {

// 没有别名（kCLAuthorizationStatusAuthorized 是 authorizedAlways 的旧名字，
// iOS 8 起废弃，不收）
NACRE_ENUM_MAP(LocationAuthorizationStatus, CLAuthorizationStatus,
               @"notDetermined": @(kCLAuthorizationStatusNotDetermined),
               @"restricted": @(kCLAuthorizationStatusRestricted),
               @"denied": @(kCLAuthorizationStatusDenied),
               @"authorizedAlways": @(kCLAuthorizationStatusAuthorizedAlways),
               @"authorizedWhenInUse": @(kCLAuthorizationStatusAuthorizedWhenInUse))

NACRE_ENUM_MAP(LocationAccuracyAuthorization, CLAccuracyAuthorization,
               @"fullAccuracy": @(CLAccuracyAuthorizationFullAccuracy),
               @"reducedAccuracy": @(CLAccuracyAuthorizationReducedAccuracy))

namespace {

NSString* const kEventNames = @"locationupdate / locationerror / authorizationchange";
NSString* const kAccuracyNames = @"best / bestForNavigation / reduced";
NSString* const kDistanceFilterNames = @"none";
NSString* const kUsageKey = @"NSLocationWhenInUseUsageDescription";

NacreLocationDelegate* DelegateOf(CLLocationManager* manager) {
  return objc_getAssociatedObject(manager, kNacreLocationDelegateKey);
}

NSString* StatusName(CLAuthorizationStatus status) {
  return NameForLocationAuthorizationStatus(status) ?: @"notDetermined";
}

// ---- JSON ----
// 这个文件拿不到核心的 EncodeJSON，自己编。要编的都是下面几个函数造出来的
// 字典，里面的数先过了 Number()，不会有 NaN 和无穷大
NSString* JSONText(id value) {
  NSData* data = [NSJSONSerialization dataWithJSONObject:value
                                                 options:NSJSONWritingFragmentsAllowed
                                                   error:nil];
  return data != nil ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
                     : @"null";
}

id Number(double v) {
  return std::isfinite(v) ? @(v) : @0;
}

// 精度、速度、方向：头文件写的是「负数表示这个量无效」。负数不是一个量，
// 是「没有」的记号，所以给 JS 的是 null
id ValidOrNull(double v) {
  return std::isfinite(v) && v >= 0 ? (id) @(v) : (id)NSNull.null;
}

// 海拔：头文件写的是「垂直精度为负表示海拔无效」。这时 altitude 里那个数
// （模拟器上是 0）不是量出来的，所以两个海拔跟着给 null。和 Web 的
// coords.altitude 一致：取不到就是 null
id AltitudeOrNull(double altitude, double verticalAccuracy) {
  bool valid = std::isfinite(verticalAccuracy) && verticalAccuracy >= 0;
  return valid && std::isfinite(altitude) ? (id) @(altitude) : (id)NSNull.null;
}

NSDictionary* LocationToJSON(CLLocation* location) {
  CLLocationSourceInformation* source = location.sourceInformation;
  return @{
    @"latitude": Number(location.coordinate.latitude),
    @"longitude": Number(location.coordinate.longitude),
    @"altitude": AltitudeOrNull(location.altitude, location.verticalAccuracy),
    @"ellipsoidalAltitude": AltitudeOrNull(location.ellipsoidalAltitude,
                                           location.verticalAccuracy),
    @"horizontalAccuracy": ValidOrNull(location.horizontalAccuracy),
    @"verticalAccuracy": ValidOrNull(location.verticalAccuracy),
    @"speed": ValidOrNull(location.speed),
    @"speedAccuracy": ValidOrNull(location.speedAccuracy),
    @"course": ValidOrNull(location.course),
    @"courseAccuracy": ValidOrNull(location.courseAccuracy),
    // 毫秒，Date.prototype.getTime() 那个量。JS 那一侧建成 Date
    @"timestamp": Number(std::round(location.timestamp.timeIntervalSince1970 * 1000.0)),
    @"sourceInformation": source != nil
        ? (id) @{@"isSimulatedBySoftware": @(source.isSimulatedBySoftware),
                 @"isProducedByAccessory": @(source.isProducedByAccessory)}
        : (id)NSNull.null,
  };
}

// ---- desiredAccuracy / distanceFilter ----
// 「米，或者一个名字」。名字背后是系统的哨兵常量（best 是 -1、
// bestForNavigation 是 -2、reduced 是 6380000、none 是 -1，在 Mac 上量的），
// 它们是记号不是数量，所以 JS 写名字、读回来也是名字；映射留在这里，和别的
// 哨兵常量一个规矩（UIStackView 的 spacing = 'system'）
id AccuracyToJS(CLLocationAccuracy v) {
  if (v == kCLLocationAccuracyBest) return @"best";
  if (v == kCLLocationAccuracyBestForNavigation) return @"bestForNavigation";
  if (v == kCLLocationAccuracyReduced) return @"reduced";
  return Number(v);
}

id DistanceFilterToJS(CLLocationDistance v) {
  if (v == kCLDistanceFilterNone) return @"none";
  return Number(v);
}

// JS 一侧已经转成了「数，或者一个字符串」（toNumberOrName）。这里只校验：
// 字符串必须是认识的名字，数必须是有限的、不小于 0 的——负数是哨兵常量的
// 地盘，只能用名字写。不合格就填 error 返回 false，原生的属性不动
bool MetersFromJS(id value, NSString* key, NSDictionary<NSString*, NSNumber*>* names,
                  NSString* choices, double* out, std::string* error) {
  if ([value isKindOfClass:NSString.class]) {
    NSNumber* named = names[(NSString*)value];
    if (named == nil) {
      *error = EnumError(key, value, choices);
      return false;
    }
    *out = named.doubleValue;
    return true;
  }
  BOOL isNumber = [value isKindOfClass:NSNumber.class] &&
                  CFGetTypeID((__bridge CFTypeRef)value) != CFBooleanGetTypeID();
  double meters = isNumber ? ((NSNumber*)value).doubleValue : NAN;
  if (!std::isfinite(meters) || meters < 0) {
    *error = [NSString stringWithFormat:
                  @"%@ must be a non-negative number of meters or one of: %@", key, choices]
                 .UTF8String;
    return false;
  }
  *out = meters;
  return true;
}

// ---- 错误 ----
// 上层给好用的分类（name），底层把 NSError 的 code 和 domain 原样交出去——
// 和文件读写、钥匙串同一个分工
NSString* LocationErrorName(NSError* error) {
  if (![error.domain isEqualToString:kCLErrorDomain]) return @"NSError";
  switch ((CLError)error.code) {
    case kCLErrorDenied:
      return @"NotAllowedError";
    case kCLErrorLocationUnknown:
      return @"LocationUnknownError";
    case kCLErrorNetwork:
      return @"NetworkError";
    default:
      return @"NSError";
  }
}

NacreAsyncResult* Failure(NSString* name, NSString* message, NSInteger code,
                          NSString* domain) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = name;
  r.errorMessage = message;
  r.errorCode = code;
  r.errorDomain = domain;
  return r;
}

NacreAsyncResult* FailureFromError(NSError* error) {
  return Failure(LocationErrorName(error), error.localizedDescription ?: @"",
                 error.code, error.domain ?: @"");
}

NacreAsyncResult* DoneJSON(id value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.json = value;
  return r;
}

// requestLocation() 被 start / stop 取消。头文件：startUpdatingLocation 会
// 立刻取消还没完成的那一次，stopUpdatingLocation 可以用来主动取消；两种
// 情况系统都不再回调，所以由这里结算
NacreAsyncResult* Aborted(NSString* by) {
  return Failure(@"AbortError",
                 [NSString stringWithFormat:@"requestLocation was cancelled by %@", by], 0,
                 @"");
}

// ---- 构造 ----
bool CoreLocationConstruct(const std::string& className, const NacreArgs& args,
                           nacre::NativeObjectRef* out, std::string* error) {
  if (className != "CLLocationManager") return false;
  // 要在有 run loop 的线程上建，委托的回调也在这个线程上来。JS 在主线程
  CLLocationManager* manager = [[CLLocationManager alloc] init];
  NacreLocationDelegate* hop = [NacreLocationDelegate new];
  hop.locationWaiters = [NSMutableArray array];
  hop.authorizationWaiters = [NSMutableArray array];
  objc_setAssociatedObject(manager, kNacreLocationDelegateKey, hop,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  manager.delegate = hop;
  *out = {NacreKeep(manager), className};
  return true;
}

// ---- 属性 ----
id ReadCoreLocationProperty(id object, NSString* key) {
  if (![object isKindOfClass:CLLocationManager.class]) return nil;
  CLLocationManager* manager = (CLLocationManager*)object;
  if ([key isEqualToString:@"authorizationStatus"]) {
    return StatusName(manager.authorizationStatus);
  }
  if ([key isEqualToString:@"accuracyAuthorization"]) {
    return NameForLocationAccuracyAuthorization(manager.accuracyAuthorization)
               ?: @"fullAccuracy";
  }
  if ([key isEqualToString:@"desiredAccuracy"]) return AccuracyToJS(manager.desiredAccuracy);
  if ([key isEqualToString:@"distanceFilter"]) {
    return DistanceFilterToJS(manager.distanceFilter);
  }
  if ([key isEqualToString:@"location"]) {
    CLLocation* location = manager.location;
    return location != nil ? (id)LocationToJSON(location) : (id)NSNull.null;
  }
  return nil;
}

BOOL WriteCoreLocationProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:CLLocationManager.class]) return NO;
  CLLocationManager* manager = (CLLocationManager*)object;
  if ([key isEqualToString:@"desiredAccuracy"]) {
    double meters = 0;
    NSDictionary<NSString*, NSNumber*>* names = @{
      @"best": @(kCLLocationAccuracyBest),
      @"bestForNavigation": @(kCLLocationAccuracyBestForNavigation),
      @"reduced": @(kCLLocationAccuracyReduced),
    };
    if (MetersFromJS(value, key, names, kAccuracyNames, &meters, error)) {
      manager.desiredAccuracy = meters;
    }
    return YES;
  }
  if ([key isEqualToString:@"distanceFilter"]) {
    double meters = 0;
    NSDictionary<NSString*, NSNumber*>* names = @{@"none": @(kCLDistanceFilterNone)};
    if (MetersFromJS(value, key, names, kDistanceFilterNames, &meters, error)) {
      manager.distanceFilter = meters;
    }
    return YES;
  }
  return NO;
}

// ---- 方法 ----
bool CoreLocationCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                      std::string* error) {
  if (![object isKindOfClass:CLLocationManager.class]) return false;
  CLLocationManager* manager = (CLLocationManager*)object;
  NacreLocationDelegate* hop = DelegateOf(manager);
  if ([sel isEqualToString:@"startUpdatingLocation"]) {
    [hop rejectLocationWaiters:Aborted(@"startUpdatingLocation()")];
    hop.updating = YES;
    [manager startUpdatingLocation];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"stopUpdatingLocation"]) {
    [hop rejectLocationWaiters:Aborted(@"stopUpdatingLocation()")];
    hop.updating = NO;
    [manager stopUpdatingLocation];
    *out = "null";
    return true;
  }
  return false;
}

// ---- 返回 Promise 的两个 ----
//
// 系统的这两个方法都没有返回值，结果从委托来。它们是一次性的请求，所以 JS
// 那一侧是 Promise；这里把 done 存在委托上，委托的回调来了再结算。
//
// **每一条路都要结算。** 系统在几种情况下什么都不做、也不回调（头文件写的）：
// 状态已经定了、Info.plist 里没有那句说明、App 不在使用中。这几种都在调
// 系统之前先判断，当场结算，不留一个永远不结算的 Promise。
bool CoreLocationCallAsync(id object, const std::string& name, const std::string& argsJSON,
                           const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:CLLocationManager.class]) return false;
  CLLocationManager* manager = (CLLocationManager*)object;
  NacreLocationDelegate* hop = DelegateOf(manager);
  CLAuthorizationStatus status = manager.authorizationStatus;

  if (name == "requestWhenInUseAuthorization") {
    // 已经问过了：系统不会再弹框，也不会回调。给现在的状态
    if (status != kCLAuthorizationStatusNotDetermined) {
      done(DoneJSON(StatusName(status)));
      return true;
    }
    if ([NSBundle.mainBundle objectForInfoDictionaryKey:kUsageKey] == nil) {
      done(Failure(@"InvalidStateError",
                   @"requestWhenInUseAuthorization: NSLocationWhenInUseUsageDescription is "
                   @"missing from Info.plist, so the system will not ask; add it under "
                   @"ios.infoPlist in nacre.config.json",
                   0, @""));
      return true;
    }
    if (UIApplication.sharedApplication.applicationState == UIApplicationStateBackground) {
      done(Failure(@"InvalidStateError",
                   @"requestWhenInUseAuthorization: the app is in the background, and the "
                   @"system only asks while the app is in use",
                   0, @""));
      return true;
    }
    [hop.authorizationWaiters addObject:[done copy]];
    // 已经有一次在等了就不再调：提示框只有一个，等的人一起结算
    if (hop.authorizationWaiters.count == 1) [manager requestWhenInUseAuthorization];
    return true;
  }

  if (name == "requestLocation") {
    // 没授权时系统会不会回调，各个状态不一样，也没量过；这里不依赖它，
    // 当场拒绝。错误码和域用系统在「被拒绝」时给的那一对
    if (status != kCLAuthorizationStatusAuthorizedWhenInUse &&
        status != kCLAuthorizationStatusAuthorizedAlways) {
      NSString* why = status == kCLAuthorizationStatusNotDetermined
          ? @"requestLocation: location authorization has not been requested yet; call "
            @"requestWhenInUseAuthorization() first"
          : [NSString stringWithFormat:@"requestLocation: location access is %@",
                                       StatusName(status)];
      done(Failure(@"NotAllowedError", why, kCLErrorDenied, kCLErrorDomain));
      return true;
    }
    // 头文件：requestLocation 不能和 startUpdatingLocation 同时用
    if (hop.updating) {
      done(Failure(@"InvalidStateError",
                   @"requestLocation: location updates are running; read the locationupdate "
                   @"event instead, or call stopUpdatingLocation() first",
                   0, @""));
      return true;
    }
    [hop.locationWaiters addObject:[done copy]];
    // 头文件：同一时刻只能有一次没完成的请求。后来的和它一起结算
    if (hop.locationWaiters.count == 1) [manager requestLocation];
    return true;
  }
  return false;
}

// ---- 订阅 ----
// 委托一直装着，这里只记「这个事件有没有人听」
NacreSubscribed CoreLocationSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:CLLocationManager.class]) return false;
  NacreLocationDelegate* hop = DelegateOf((CLLocationManager*)object);
  if ([type isEqualToString:@"locationupdate"]) {
    hop.wantsUpdates = on;
  } else if ([type isEqualToString:@"locationerror"]) {
    hop.wantsErrors = on;
  } else if ([type isEqualToString:@"authorizationchange"]) {
    hop.wantsAuthorization = on;
  } else {
    return NacreSubscribed::UnknownEvent;
  }
  return true;
}

}  // namespace

}  // namespace nacre_bridge

@implementation NacreLocationDelegate

- (void)rejectLocationWaiters:(NacreAsyncResult*)failure {
  if (self.locationWaiters.count == 0) return;
  NSArray<NacreAsyncDone>* waiters = [self.locationWaiters copy];
  [self.locationWaiters removeAllObjects];
  for (NacreAsyncDone done in waiters) done(failure);
}

// locations 至少有一个，按时间从早到晚，最后一个是最新的。
// 事件带上这一批位置：事件延后一轮才派发，那时 manager.location 可能已经是
// 更新的一个，而这一批里前面的几个之后再也读不到
- (void)locationManager:(CLLocationManager*)manager
     didUpdateLocations:(NSArray<CLLocation*>*)locations {
  if (locations.count == 0) return;
  if (self.locationWaiters.count > 0) {
    NSArray<NacreAsyncDone>* waiters = [self.locationWaiters copy];
    [self.locationWaiters removeAllObjects];
    NacreAsyncResult* result = nacre_bridge::DoneJSON(
        nacre_bridge::LocationToJSON(locations.lastObject));
    for (NacreAsyncDone done in waiters) done(result);
  }
  if (!self.wantsUpdates) return;
  NSMutableArray* list = [NSMutableArray arrayWithCapacity:locations.count];
  for (CLLocation* location in locations) {
    [list addObject:nacre_bridge::LocationToJSON(location)];
  }
  nacre_bridge::NacreEmitEventWithJSON(manager, "CLLocationManager", @"locationupdate",
                                       nacre_bridge::JSONText(@{@"locations": list}));
}

- (void)locationManager:(CLLocationManager*)manager didFailWithError:(NSError*)error {
  BOOL promptDeclined = [error.domain isEqualToString:kCLErrorDomain] &&
                        error.code == kCLErrorPromptDeclined;
  if (promptDeclined && self.authorizationWaiters.count > 0) {
    // 系统说提示框没有展示给用户：申请授权的那一次到此为止
    NSArray<NacreAsyncDone>* waiters = [self.authorizationWaiters copy];
    [self.authorizationWaiters removeAllObjects];
    NacreAsyncResult* failure = nacre_bridge::FailureFromError(error);
    for (NacreAsyncDone done in waiters) done(failure);
  } else if (!promptDeclined) {
    // 等着的 requestLocation() 只在没有连续更新时才有（见上面），所以这个
    // 错误就是那一次请求的结果
    [self rejectLocationWaiters:nacre_bridge::FailureFromError(error)];
  }
  if (!self.wantsErrors) return;
  NSDictionary* fields = @{
    @"name": nacre_bridge::LocationErrorName(error),
    @"message": error.localizedDescription ?: @"",
    @"code": @(error.code),
    @"domain": error.domain ?: @"",
  };
  nacre_bridge::NacreEmitEventWithJSON(manager, "CLLocationManager", @"locationerror",
                                       nacre_bridge::JSONText(fields));
}

// 授权状态或者精度的授权变了；建好对象之后系统也会先调一次。
// 事件不带状态：派发时从 manager 上读得到，读到的就是那时的值
- (void)locationManagerDidChangeAuthorization:(CLLocationManager*)manager {
  CLAuthorizationStatus status = manager.authorizationStatus;
  if (status != kCLAuthorizationStatusNotDetermined && self.authorizationWaiters.count > 0) {
    NSArray<NacreAsyncDone>* waiters = [self.authorizationWaiters copy];
    [self.authorizationWaiters removeAllObjects];
    NacreAsyncResult* result = nacre_bridge::DoneJSON(nacre_bridge::StatusName(status));
    for (NacreAsyncDone done in waiters) done(result);
  }
  if (self.wantsAuthorization) {
    nacre_bridge::NacreEmitEvent(manager, "CLLocationManager", @"authorizationchange");
  }
}

@end

// ---- 登记 ----
// framework 被嵌进 App 就会走到，宿主不用写任何代码
@interface NacreCoreLocationRegistration : NSObject
@end
@implementation NacreCoreLocationRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "core-location";
  d.classes = {CLLocationManager.class};
  d.read = nacre_bridge::ReadCoreLocationProperty;
  d.write = nacre_bridge::WriteCoreLocationProperty;
  d.call = nacre_bridge::CoreLocationCall;
  d.callAsync = nacre_bridge::CoreLocationCallAsync;
  d.construct = nacre_bridge::CoreLocationConstruct;
  d.subscribe = nacre_bridge::CoreLocationSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
