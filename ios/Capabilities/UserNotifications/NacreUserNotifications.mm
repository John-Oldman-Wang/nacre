// 通知：UNUserNotificationCenter。发本地通知，查和撤，App 在前台时收到通知、
// 用户点了通知的两个事件。
//
// 这是一个能力包（@nacrejs/user-notifications），编进的是另一个 framework，所以
// 只用给能力包的那个头，不碰核心的内部头 NacreBridge.h。核心里的取参宏
// （NACRE_NUM 一类）、位掩码的宏、EncodeJSON 都在内部头里，这里拿不到：JS 给的
// 值在下面自己校验——规矩是同一条，类型不对就报错，不转换。
//
// 做了的：
//   - 申请授权、读设置
//   - 发通知（内容；过多少秒、匹配日期分量两种触发方式；不带就是立刻）
//   - 查和撤还没到的、已经送达的；设角标
//   - 委托的两个方法转成事件：notification /
//     notificationclick
//   - 「前台时要不要显示」：系统当场来问，按 JS 预先设好的值直接回答
//
// 没做的（JS 那一侧根本没有这些名字）：向苹果注册远程推送和设备令牌、
// 分类和自定义按钮、附件、按位置触发、自定义声音、通知的扩展。
//
// 只有通知中心是原生对象的包装。内容、触发器、请求、通知、用户的回应、设置
// 都不包装：它们不可变（或者一交给系统就被复制），过桥的是一个 JSON 对象，
// JS 那一侧建成只读的值。
#import <Nacre/NacreExtension.h>

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

#include <cmath>

// ---- 位掩码的表 ----
// 核心有一个同名的宏，在它的内部头里，能力包拿不到。这里照它的样子定义一份
// （名字一样，check-api.sh 就会拿表里的名字和类型定义里同名的联合类型核对）。
// 哪天它进了 NacreExtension.h，这一段自动让位
#ifndef NACRE_MASK_MAP
#define NACRE_MASK_MAP(FuncName, Type, ...)                                      \
  static NSDictionary<NSString*, NSNumber*>* FuncName##Table(void) {             \
    static NSDictionary<NSString*, NSNumber*>* table;                            \
    static dispatch_once_t once;                                                 \
    dispatch_once(&once, ^{ table = @{__VA_ARGS__}; });                          \
    return table;                                                                \
  }                                                                              \
  /* 「不是数组」和「名字不认识」是两种错，要分开报 */                              \
  __attribute__((unused))                                                        \
  static BOOL FuncName##FromNames(id value, Type* out, id* bad) {                \
    *bad = nil;                                                                  \
    if (![value isKindOfClass:NSArray.class]) return NO;                         \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();               \
    Type mask = (Type)0;                                                         \
    for (id name in (NSArray*)value) {                                           \
      NSNumber* bit = [name isKindOfClass:NSString.class] ? table[name] : nil;   \
      if (bit == nil) { *bad = name; return NO; }                                \
      mask = (Type)(mask | (Type)bit.unsignedIntegerValue);                      \
    }                                                                            \
    *out = mask;                                                                 \
    return YES;                                                                  \
  }                                                                              \
  /* 读出来按位的数值从小到大排 */                                                \
  __attribute__((unused))                                                        \
  static NSArray<NSString*>* NamesIn##FuncName(Type value) {                     \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();               \
    NSArray<NSString*>* keys = [table.allKeys                                    \
        sortedArrayUsingComparator:^NSComparisonResult(NSString* a, NSString* b) { \
          return [table[a] compare:table[b]];                                    \
        }];                                                                      \
    NSMutableArray<NSString*>* out = [NSMutableArray array];                     \
    for (NSString* key in keys) {                                                \
      if (value & (Type)table[key].unsignedIntegerValue) [out addObject:key];    \
    }                                                                            \
    return out;                                                                  \
  }                                                                              \
  __attribute__((unused))                                                        \
  static NSString* NamesFor##FuncName(void) {                                    \
    return nacre_bridge::JoinEnumNames(FuncName##Table());                       \
  }
#endif

// ---- 委托 ----
//
// 通知中心的委托。整个进程一个，**在这个 framework 被加载时就装上**（见文件
// 末尾的 +load），理由写在 docs/internals/user-notifications.md：系统要求它在
// App 启动完成之前就在，否则「点通知把 App 启动起来」的那一次点击不会交过来。
//
// 它不持有任何 JS 函数。两件事由它做：
//   - 系统问「前台时要不要显示」：直接按 presentation 回答，不进 JS
//   - 把两个委托方法转成事件。没人听「通知被点了」时先留着，等第一个监听器
//
// 装的时候槽位里已经有别人的委托（宿主的、别的 SDK 的）：不顶掉，记成 next，
// 系统调过来的每一次都原样转给它。
@interface NacreNotificationHub : NSObject <UNUserNotificationCenterDelegate>
// 第一次取到的那个通知中心。事件都发在它身上，JS 拿到的也是它。
// 取不到（系统抛了异常）时是 nil
@property(nonatomic, strong, readonly) UNUserNotificationCenter* center;
// 委托装上过没有。只装一次：之后被别人换掉了也不再装（见 checkStillInstalled）
@property(nonatomic) BOOL installed;
// 装之前就在槽位里的那个委托。通知中心对委托是弱引用，这里也一样
@property(atomic, weak) id<UNUserNotificationCenterDelegate> next;
// JS 预先设好的「前台时怎么显示」。默认是 0：不显示
@property(atomic) UNNotificationPresentationOptions presentation;
// 两个事件各自有没有监听器。只在主线程上读写
@property(nonatomic) BOOL wantsPresent;
@property(nonatomic) BOOL wantsResponse;
// 没人听的时候到的点击，一条是一段 JSON 文本。只在主线程上读写
@property(nonatomic, strong) NSMutableArray<NSString*>* heldResponses;
// 「委托被别人换掉了」只提醒一次
@property(nonatomic) BOOL warnedReplaced;
+ (instancetype)shared;
- (void)installIfNeeded;
- (void)checkStillInstalled;
- (void)flushHeldResponses;
@end

namespace nacre_bridge {

NACRE_ENUM_MAP(NotificationAuthorizationStatus, UNAuthorizationStatus,
               @"notDetermined": @(UNAuthorizationStatusNotDetermined),
               @"denied": @(UNAuthorizationStatusDenied),
               @"authorized": @(UNAuthorizationStatusAuthorized),
               @"provisional": @(UNAuthorizationStatusProvisional),
               @"ephemeral": @(UNAuthorizationStatusEphemeral))

NACRE_ENUM_MAP(NotificationSettingState, UNNotificationSetting,
               @"notSupported": @(UNNotificationSettingNotSupported),
               @"disabled": @(UNNotificationSettingDisabled),
               @"enabled": @(UNNotificationSettingEnabled))

NACRE_ENUM_MAP(NotificationAlertStyle, UNAlertStyle,
               @"none": @(UNAlertStyleNone),
               @"banner": @(UNAlertStyleBanner),
               @"alert": @(UNAlertStyleAlert))

NACRE_ENUM_MAP(NotificationShowPreviews, UNShowPreviewsSetting,
               @"always": @(UNShowPreviewsSettingAlways),
               @"whenAuthenticated": @(UNShowPreviewsSettingWhenAuthenticated),
               @"never": @(UNShowPreviewsSettingNever))

// 申请授权时要哪几样。announcement 和 timeSensitive 系统已经废弃（前一个现在
// 总是带着，后一个改成了 entitlement），不收
NACRE_MASK_MAP(NotificationAuthorizationOptions, UNAuthorizationOptions,
               @"badge": @(UNAuthorizationOptionBadge),
               @"sound": @(UNAuthorizationOptionSound),
               @"alert": @(UNAuthorizationOptionAlert),
               @"carPlay": @(UNAuthorizationOptionCarPlay),
               @"criticalAlert": @(UNAuthorizationOptionCriticalAlert),
               @"providesAppNotificationSettings":
                   @(UNAuthorizationOptionProvidesAppNotificationSettings),
               @"provisional": @(UNAuthorizationOptionProvisional))

// 前台时怎么显示。alert 是旧名字，系统把它拆成了 list 和 banner，不收
NACRE_MASK_MAP(NotificationPresentationOptions, UNNotificationPresentationOptions,
               @"badge": @(UNNotificationPresentationOptionBadge),
               @"sound": @(UNNotificationPresentationOptionSound),
               @"list": @(UNNotificationPresentationOptionList),
               @"banner": @(UNNotificationPresentationOptionBanner))

namespace {

NSString* const kPresentEvent = @"notification";
NSString* const kResponseEvent = @"notificationclick";
NSString* const kEventNames = @"notification / notificationclick";
const char* const kCenterClass = "UNUserNotificationCenter";

// 没人听的时候最多留几条点击。这个数没有外部依据：通常只有一条（点通知把
// App 启动起来的那一次），留几条是为了连着点了几条时不丢
const NSUInteger kMaxHeldResponses = 8;

// ---- JSON ----
// 这个文件拿不到核心的 EncodeJSON，自己编。要编的都是下面几个函数造出来的
// 字典，里面的值已经洗过（见 Plain）
NSString* JSONText(id value) {
  NSData* data = [NSJSONSerialization dataWithJSONObject:value
                                                 options:NSJSONWritingFragmentsAllowed
                                                   error:nil];
  return data != nil ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
                     : @"null";
}

BOOL IsBoolean(id value) {
  return [value isKindOfClass:NSNumber.class] &&
         CFGetTypeID((__bridge CFTypeRef)value) == CFBooleanGetTypeID();
}

BOOL IsNumber(id value) {
  return [value isKindOfClass:NSNumber.class] && !IsBoolean(value);
}

// JS 给的值只校验、不转换：是数才取数，是布尔才取布尔，别的一律不认
double NumberOrNaN(id value) {
  return IsNumber(value) ? ((NSNumber*)value).doubleValue : NAN;
}

BOOL IsTrue(id value) {
  return IsBoolean(value) && ((NSNumber*)value).boolValue;
}

// userInfo 交给 JS 之前洗一遍：它来自系统（远程推送的负载）或者别的原生代码，
// 里面可以有 JSON 写不出来的东西。字符串、数、布尔、数组、字典原样；日期给
// ISO 8601 的字符串；别的（NSData 一类）丢掉；不是字符串的键写成字符串
id Plain(id value) {
  if ([value isKindOfClass:NSString.class] || value == NSNull.null) return value;
  if ([value isKindOfClass:NSNumber.class]) {
    if (IsBoolean(value)) return value;
    return std::isfinite(((NSNumber*)value).doubleValue) ? value : (id)NSNull.null;
  }
  if ([value isKindOfClass:NSArray.class]) {
    NSMutableArray* out = [NSMutableArray array];
    for (id item in (NSArray*)value) [out addObject:Plain(item) ?: (id)NSNull.null];
    return out;
  }
  if ([value isKindOfClass:NSDictionary.class]) {
    NSMutableDictionary* out = [NSMutableDictionary dictionary];
    [(NSDictionary*)value enumerateKeysAndObjectsUsingBlock:^(id key, id item, BOOL* stop) {
      id plain = Plain(item);
      if (plain == nil) return;
      NSString* name = [key isKindOfClass:NSString.class] ? key : [key description];
      out[name] = plain;
    }];
    return out;
  }
  if ([value isKindOfClass:NSDate.class]) {
    return [[NSISO8601DateFormatter new] stringFromDate:(NSDate*)value];
  }
  return nil;
}

// ---- 日期的分量 ----
// 名字是 NSDateComponents 的属性名，JS 那一侧有同一张表（报错时要列出来）。
// 「没指定」在系统那边是 NSDateComponentUndefined，给 JS 的是没有这个键
NSArray<NSString*>* DateComponentNames() {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[
      @"era", @"year", @"month", @"day", @"hour", @"minute", @"second", @"nanosecond",
      @"weekday", @"weekdayOrdinal", @"quarter", @"weekOfMonth", @"weekOfYear",
      @"yearForWeekOfYear", @"dayOfYear",
    ];
  });
  return names;
}

NSDictionary* DateComponentsToJSON(NSDateComponents* components) {
  NSMutableDictionary* out = [NSMutableDictionary dictionary];
  for (NSString* name in DateComponentNames()) {
    // 十五个都是 NSInteger 的属性，按名字取
    NSNumber* value = [components valueForKey:name];
    if (value != nil && value.integerValue != NSDateComponentUndefined) out[name] = value;
  }
  return out;
}

// JS 一侧已经转成了整数。这里只校验：键要认识，值要是整数
NSDateComponents* DateComponentsFromJSON(id json, NSString** error) {
  if (![json isKindOfClass:NSDictionary.class]) {
    *error = @"dateComponents must be an object";
    return nil;
  }
  NSDateComponents* components = [NSDateComponents new];
  for (NSString* key in (NSDictionary*)json) {
    id value = ((NSDictionary*)json)[key];
    if (![DateComponentNames() containsObject:key]) {
      *error = [NSString stringWithFormat:@"dateComponents has no component \"%@\"", key];
      return nil;
    }
    double number = NumberOrNaN(value);
    if (!std::isfinite(number) || number != std::trunc(number)) {
      *error = [NSString stringWithFormat:@"dateComponents.%@ must be an integer", key];
      return nil;
    }
    [components setValue:@((NSInteger)number) forKey:key];
  }
  return components;
}

// ---- 系统的对象 → JSON ----
NSDictionary* SettingsToJSON(UNNotificationSettings* settings) {
  NSString* (^state)(UNNotificationSetting) = ^NSString*(UNNotificationSetting value) {
    return NameForNotificationSettingState(value) ?: @"notSupported";
  };
  return @{
    @"authorizationStatus":
        NameForNotificationAuthorizationStatus(settings.authorizationStatus) ?: @"notDetermined",
    @"soundSetting": state(settings.soundSetting),
    @"badgeSetting": state(settings.badgeSetting),
    @"alertSetting": state(settings.alertSetting),
    @"notificationCenterSetting": state(settings.notificationCenterSetting),
    @"lockScreenSetting": state(settings.lockScreenSetting),
    @"carPlaySetting": state(settings.carPlaySetting),
    @"criticalAlertSetting": state(settings.criticalAlertSetting),
    @"announcementSetting": state(settings.announcementSetting),
    @"timeSensitiveSetting": state(settings.timeSensitiveSetting),
    @"scheduledDeliverySetting": state(settings.scheduledDeliverySetting),
    @"directMessagesSetting": state(settings.directMessagesSetting),
    @"alertStyle": NameForNotificationAlertStyle(settings.alertStyle) ?: @"none",
    @"showPreviewsSetting":
        NameForNotificationShowPreviews(settings.showPreviewsSetting) ?: @"always",
    @"providesAppNotificationSettings": @(settings.providesAppNotificationSettings),
  };
}

NSDictionary* ContentToJSON(UNNotificationContent* content) {
  // 声音：没有、默认的、别的。系统没有公开声音的名字，所以「别的」只说得出
  // 这么多。默认的那个每次读是一个新对象（Mac 上量的），要用 isEqual: 比
  UNNotificationSound* sound = content.sound;
  id soundName = NSNull.null;
  if (sound != nil) {
    soundName = [sound isEqual:UNNotificationSound.defaultSound] ? @"default" : @"other";
  }
  NSNumber* badge = content.badge;
  id userInfo = Plain(content.userInfo ?: @{});
  return @{
    // 头文件标的是不可空，新建的内容读出来却是 nil（Mac 上量的）。给空串
    @"title": content.title ?: @"",
    @"subtitle": content.subtitle ?: @"",
    @"body": content.body ?: @"",
    @"badge": badge != nil ? (id)@(badge.integerValue) : (id)NSNull.null,
    @"sound": soundName,
    @"threadIdentifier": content.threadIdentifier ?: @"",
    @"userInfo": [userInfo isKindOfClass:NSDictionary.class] ? userInfo : @{},
  };
}

id TriggerToJSON(UNNotificationTrigger* trigger) {
  if (trigger == nil) return NSNull.null;
  if ([trigger isKindOfClass:UNTimeIntervalNotificationTrigger.class]) {
    return @{
      @"type": @"timeInterval",
      @"timeInterval": @(((UNTimeIntervalNotificationTrigger*)trigger).timeInterval),
      @"repeats": @(trigger.repeats),
    };
  }
  if ([trigger isKindOfClass:UNCalendarNotificationTrigger.class]) {
    return @{
      @"type": @"calendar",
      @"dateComponents":
          DateComponentsToJSON(((UNCalendarNotificationTrigger*)trigger).dateComponents),
      @"repeats": @(trigger.repeats),
    };
  }
  if ([trigger isKindOfClass:UNPushNotificationTrigger.class]) {
    return @{@"type": @"push", @"repeats": @(trigger.repeats)};
  }
  // 按位置触发的（这个包没做，别的原生代码排的才会有）
  return @{@"type": @"unknown", @"repeats": @(trigger.repeats)};
}

NSDictionary* RequestToJSON(UNNotificationRequest* request) {
  return @{
    @"identifier": request.identifier ?: @"",
    @"content": ContentToJSON(request.content),
    @"trigger": TriggerToJSON(request.trigger),
  };
}

NSDictionary* NotificationToJSON(UNNotification* notification) {
  return @{
    // 毫秒，Date.prototype.getTime() 那个量。JS 那一侧建成 Date
    @"date": @(std::round(notification.date.timeIntervalSince1970 * 1000.0)),
    @"request": RequestToJSON(notification.request),
  };
}

// 用户做的动作。系统的两个常量换成短名字，别的（自定义按钮的标识）原样给
NSString* ActionName(NSString* identifier) {
  if ([identifier isEqualToString:UNNotificationDefaultActionIdentifier]) return @"default";
  if ([identifier isEqualToString:UNNotificationDismissActionIdentifier]) return @"dismiss";
  return identifier ?: @"";
}

NSDictionary* ResponseToJSON(UNNotificationResponse* response) {
  return @{
    @"actionIdentifier": ActionName(response.actionIdentifier),
    @"notification": NotificationToJSON(response.notification),
  };
}

// ---- JSON → 系统的请求 ----
// JS 那一侧已经把每个字段转成了该有的类型，这里只校验。不合格就填 error
// 返回 nil。系统自己会抛异常的两种（间隔不大于 0、重复的间隔不到 60 秒）
// JS 那边已经拦过，这里再拦一次：这个函数不许抛
NSString* StringField(NSDictionary* from, NSString* key, NSString** error) {
  id value = from[key];
  if (![value isKindOfClass:NSString.class]) {
    *error = [NSString stringWithFormat:@"%@ must be a string", key];
    return nil;
  }
  return value;
}

UNNotificationRequest* RequestFromJSON(id json, NSString** error) {
  if (![json isKindOfClass:NSDictionary.class]) {
    *error = @"request must be a UNNotificationRequest";
    return nil;
  }
  NSDictionary* wire = (NSDictionary*)json;
  NSString* identifier = StringField(wire, @"identifier", error);
  if (identifier == nil) return nil;
  NSDictionary* from = wire[@"content"];
  if (![from isKindOfClass:NSDictionary.class]) {
    *error = @"content must be a UNNotificationContent";
    return nil;
  }

  UNMutableNotificationContent* content = [UNMutableNotificationContent new];
  // 一个一个取：第一个不对的就报它，不让后面的把报错盖掉
  NSString* title = StringField(from, @"title", error);
  if (title == nil) return nil;
  NSString* subtitle = StringField(from, @"subtitle", error);
  if (subtitle == nil) return nil;
  NSString* body = StringField(from, @"body", error);
  if (body == nil) return nil;
  NSString* thread = StringField(from, @"threadIdentifier", error);
  if (thread == nil) return nil;
  content.title = title;
  content.subtitle = subtitle;
  content.body = body;
  content.threadIdentifier = thread;

  id badge = from[@"badge"];
  if (badge != nil && badge != NSNull.null) {
    double number = NumberOrNaN(badge);
    if (!std::isfinite(number) || number < 0 || number != std::trunc(number)) {
      *error = @"badge must be a non-negative integer or null";
      return nil;
    }
    content.badge = @((NSInteger)number);
  }

  id sound = from[@"sound"];
  if ([sound isEqual:@"default"]) {
    content.sound = UNNotificationSound.defaultSound;
  } else if (sound != nil && sound != NSNull.null) {
    *error = @"sound must be UNNotificationSound.defaultSound or null";
    return nil;
  }

  id userInfo = from[@"userInfo"];
  if (![userInfo isKindOfClass:NSDictionary.class]) {
    *error = @"userInfo must be an object";
    return nil;
  }
  content.userInfo = userInfo;

  UNNotificationTrigger* trigger = nil;
  id how = wire[@"trigger"];
  if (how != nil && how != NSNull.null) {
    if (![how isKindOfClass:NSDictionary.class]) {
      *error = @"trigger must be a trigger or null";
      return nil;
    }
    NSDictionary* t = (NSDictionary*)how;
    BOOL repeats = IsTrue(t[@"repeats"]);
    if ([t[@"type"] isEqual:@"timeInterval"]) {
      double seconds = NumberOrNaN(t[@"timeInterval"]);
      if (!std::isfinite(seconds) || seconds <= 0) {
        *error = @"timeInterval must be greater than 0";
        return nil;
      }
      if (repeats && seconds < 60) {
        *error = @"timeInterval must be at least 60 seconds when repeats is true";
        return nil;
      }
      trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:seconds
                                                                   repeats:repeats];
    } else if ([t[@"type"] isEqual:@"calendar"]) {
      NSDateComponents* components = DateComponentsFromJSON(t[@"dateComponents"], error);
      if (components == nil) return nil;
      trigger = [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:components
                                                                         repeats:repeats];
    } else {
      *error = @"trigger must be a UNTimeIntervalNotificationTrigger or a "
               @"UNCalendarNotificationTrigger";
      return nil;
    }
  }
  return [UNNotificationRequest requestWithIdentifier:identifier content:content trigger:trigger];
}

// ---- 异步的结果 ----
// 上层给好用的分类（name），底层把 NSError 的 code 和 domain 原样交出去——
// 和文件读写、钥匙串、定位同一个分工
NSString* ErrorName(NSError* error) {
  if ([error.domain isEqualToString:UNErrorDomain] &&
      error.code == UNErrorCodeNotificationsNotAllowed) {
    return @"NotAllowedError";
  }
  return @"UNError";
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
  return Failure(ErrorName(error), error.localizedDescription ?: @"", error.code,
                 error.domain ?: @"");
}

// 参数不对。JS 那一侧已经校验过，走到这里说明两边的校验不一致
NacreAsyncResult* BadArgument(NSString* message) {
  return Failure(@"TypeError", message, 0, @"");
}

NacreAsyncResult* DoneJSON(id value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.json = value;
  return r;
}

// 没有结果的（addNotificationRequest、setBadgeCount）和结果是布尔的
// （申请授权）都走这一条。前一种 JS 那一侧不看这个值
NacreAsyncResult* DoneBool(BOOL value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.boolValue = value;
  return r;
}

// 一组标识：数组，里面都是字符串。JS 一侧已经转过
NSArray<NSString*>* IdentifiersFrom(id value, NSString* what, std::string* error) {
  BOOL ok = [value isKindOfClass:NSArray.class];
  if (ok) {
    for (id item in (NSArray*)value) ok = ok && [item isKindOfClass:NSString.class];
  }
  if (!ok) {
    *error = [NSString stringWithFormat:@"%@: identifiers must be an array of strings", what]
                 .UTF8String;
    return nil;
  }
  return value;
}

// ---- 类级：currentNotificationCenter ----
bool UserNotificationsClassCallObject(const std::string& className, NSString* sel,
                                      const NacreArgs& args, nacre::NativeObjectRef* out,
                                      std::string* error) {
  if (className != kCenterClass) return false;
  if ([sel isEqualToString:@"currentNotificationCenter"]) {
    NacreNotificationHub* hub = NacreNotificationHub.shared;
    // 正常情况下 +load 里已经装过，这一句什么都不做
    [hub installIfNeeded];
    if (hub.center == nil) {
      *error = "UNUserNotificationCenter.currentNotificationCenter is not available in this "
               "process";
      return true;
    }
    // 被别人换掉了就提醒一次
    [hub checkStillInstalled];
    *out = {NacreKeep(hub.center), kCenterClass};
    return true;
  }
  return false;
}

// ---- 属性：前台时怎么显示 ----
id ReadUserNotificationsProperty(id object, NSString* key) {
  if (![object isKindOfClass:UNUserNotificationCenter.class]) return nil;
  if ([key isEqualToString:@"foregroundPresentationOptions"]) {
    return NamesInNotificationPresentationOptions(NacreNotificationHub.shared.presentation);
  }
  return nil;
}

BOOL WriteUserNotificationsProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:UNUserNotificationCenter.class]) return NO;
  if ([key isEqualToString:@"foregroundPresentationOptions"]) {
    UNNotificationPresentationOptions options = 0;
    id bad = nil;
    if (NotificationPresentationOptionsFromNames(value, &options, &bad)) {
      NacreNotificationHub.shared.presentation = options;
    } else if (bad != nil) {
      *error = EnumError(key, bad, NamesForNotificationPresentationOptions());
    } else {
      *error = "foregroundPresentationOptions must be an array of names";
    }
    return YES;
  }
  return NO;
}

// ---- 同步的方法 ----
bool UserNotificationsCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                           std::string* error) {
  if (![object isKindOfClass:UNUserNotificationCenter.class]) return false;
  UNUserNotificationCenter* center = (UNUserNotificationCenter*)object;

  // 申请授权之前先验一遍选项的名字：写错要同步抛，而申请本身走异步的通道。
  // 这一步不到系统，不会弹提示框
  if ([sel isEqualToString:@"nacre:checkAuthorizationOptions:"]) {
    UNAuthorizationOptions options = 0;
    id bad = nil;
    if (!NotificationAuthorizationOptionsFromNames(args.value(0), &options, &bad)) {
      *error = bad != nil
          ? EnumError(@"requestAuthorizationWithOptions", bad,
                      NamesForNotificationAuthorizationOptions())
          : std::string("requestAuthorizationWithOptions: options must be an array of names");
      return true;
    }
    *out = "null";
    return true;
  }
  // 下面四个系统都是马上返回、另起线程去做的（Apple 的文档）
  if ([sel isEqualToString:@"removePendingNotificationRequestsWithIdentifiers:"]) {
    NSArray<NSString*>* ids = IdentifiersFrom(
        args.value(0), @"removePendingNotificationRequestsWithIdentifiers", error);
    if (ids != nil) [center removePendingNotificationRequestsWithIdentifiers:ids];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeAllPendingNotificationRequests"]) {
    [center removeAllPendingNotificationRequests];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeDeliveredNotificationsWithIdentifiers:"]) {
    NSArray<NSString*>* ids = IdentifiersFrom(
        args.value(0), @"removeDeliveredNotificationsWithIdentifiers", error);
    if (ids != nil) [center removeDeliveredNotificationsWithIdentifiers:ids];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeAllDeliveredNotifications"]) {
    [center removeAllDeliveredNotifications];
    *out = "null";
    return true;
  }
  return false;
}

// ---- 返回 Promise 的方法 ----
//
// 系统的这几个方法都带一个完成时调的 block，它可能在后台线程上来（Apple 的
// 文档写的；Mac 上量到的也是后台线程）。done 可以在任何线程上调，回主线程
// 兑现是核心的事。
//
// **每一条路都要结算，而且只结算一次**：参数不对当场拒绝；调系统的那一下
// 包在 @try 里，系统抛了异常就拒绝，不让它穿出去
bool UserNotificationsCallAsync(id object, const std::string& name,
                                const std::string& argsJSON,
                                const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:UNUserNotificationCenter.class]) return false;
  UNUserNotificationCenter* center = (UNUserNotificationCenter*)object;
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id first = args.count > 0 ? args[0] : nil;
  NacreAsyncDone finish = [done copy];

  @try {
    if (name == "requestAuthorizationWithOptions:") {
      UNAuthorizationOptions options = 0;
      id bad = nil;
      if (!NotificationAuthorizationOptionsFromNames(first, &options, &bad)) {
        finish(BadArgument(@"requestAuthorizationWithOptions: options must be an array of "
                           @"known names"));
        return true;
      }
      [center requestAuthorizationWithOptions:options
                            completionHandler:^(BOOL granted, NSError* error) {
                              finish(error != nil ? FailureFromError(error) : DoneBool(granted));
                            }];
      return true;
    }

    if (name == "getNotificationSettings") {
      [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings* settings) {
        finish(DoneJSON(SettingsToJSON(settings)));
      }];
      return true;
    }

    if (name == "addNotificationRequest:") {
      NSString* why = nil;
      UNNotificationRequest* request = RequestFromJSON(first, &why);
      if (request == nil) {
        finish(BadArgument([@"addNotificationRequest: " stringByAppendingString:why ?: @""]));
        return true;
      }
      [center addNotificationRequest:request
               withCompletionHandler:^(NSError* error) {
                 finish(error != nil ? FailureFromError(error) : DoneBool(YES));
               }];
      return true;
    }

    if (name == "getPendingNotificationRequests") {
      [center getPendingNotificationRequestsWithCompletionHandler:^(
                  NSArray<UNNotificationRequest*>* requests) {
        NSMutableArray* list = [NSMutableArray arrayWithCapacity:requests.count];
        for (UNNotificationRequest* request in requests) [list addObject:RequestToJSON(request)];
        finish(DoneJSON(list));
      }];
      return true;
    }

    if (name == "getDeliveredNotifications") {
      [center getDeliveredNotificationsWithCompletionHandler:^(
                  NSArray<UNNotification*>* notifications) {
        NSMutableArray* list = [NSMutableArray arrayWithCapacity:notifications.count];
        for (UNNotification* notification in notifications) {
          [list addObject:NotificationToJSON(notification)];
        }
        finish(DoneJSON(list));
      }];
      return true;
    }

    if (name == "setBadgeCount:") {
      double number = NumberOrNaN(first);
      if (!std::isfinite(number) || number < 0 || number != std::trunc(number)) {
        finish(BadArgument(@"setBadgeCount: count must be a non-negative integer"));
        return true;
      }
      [center setBadgeCount:(NSInteger)number
          withCompletionHandler:^(NSError* error) {
            finish(error != nil ? FailureFromError(error) : DoneBool(YES));
          }];
      return true;
    }
  } @catch (NSException* exception) {
    // 异常是在调系统的那一下里同步抛的，这时完成的 block 还没被调过
    finish(Failure(@"TypeError",
                   [NSString stringWithFormat:@"%s raised %@: %@", name.c_str(), exception.name,
                                              exception.reason ?: @"(no reason)"],
                   0, @""));
    return true;
  }
  return false;
}

// ---- 订阅 ----
// 委托一直装着，这里只记「这个事件有没有人听」。
// 「通知被点了」从没人听变成有人听的那一刻，把留着的补发出去：事件延后一轮
// 才派发，那时这个监听器已经登记好了
NacreSubscribed UserNotificationsSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UNUserNotificationCenter.class]) return false;
  NacreNotificationHub* hub = NacreNotificationHub.shared;
  if ([type isEqualToString:kPresentEvent]) {
    hub.wantsPresent = on;
  } else if ([type isEqualToString:kResponseEvent]) {
    hub.wantsResponse = on;
    if (on) [hub flushHeldResponses];
  } else {
    return NacreSubscribed::UnknownEvent;
  }
  if (on) [hub checkStillInstalled];
  return true;
}

void OnMain(dispatch_block_t block) {
  if (NSThread.isMainThread) {
    block();
  } else {
    dispatch_async(dispatch_get_main_queue(), block);
  }
}

}  // namespace

}  // namespace nacre_bridge

@implementation NacreNotificationHub

@synthesize center = _center;

+ (instancetype)shared {
  static NacreNotificationHub* hub;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    hub = [NacreNotificationHub new];
    hub.heldResponses = [NSMutableArray array];
  });
  return hub;
}

// 第一次用到时才取，取到之后一直是这一个。只在主线程上调（+load 和 JS 都在
// 主线程）。取的那一下包在 @try 里：第一次调用是在 +load 里，main() 还没
// 开始，取不到不能让 App 起不来
- (UNUserNotificationCenter*)center {
  if (_center == nil) {
    @try {
      _center = [UNUserNotificationCenter currentNotificationCenter];
    } @catch (NSException* exception) {
      NSLog(@"[nacre] @nacrejs/user-notifications could not get the notification center: %@",
            exception.reason);
    }
  }
  return _center;
}

// 把自己装成通知中心的委托。槽位里已经有别人的：记成 next，之后每一次都
// 转给它，不顶掉
- (void)installIfNeeded {
  if (self.installed) return;
  UNUserNotificationCenter* center = self.center;
  if (center == nil) return;
  self.installed = YES;
  id<UNUserNotificationCenterDelegate> existing = center.delegate;
  if (existing == self) return;
  if (existing != nil) {
    self.next = existing;
    NSLog(@"[nacre] UNUserNotificationCenter already had a delegate (%@). "
          @"@nacrejs/user-notifications forwards every callback to it; it also keeps deciding "
          @"how notifications are presented in the foreground when it implements "
          @"willPresentNotification, so foregroundPresentationOptions has no effect then.",
          NSStringFromClass([(NSObject*)existing class]));
  }
  center.delegate = self;
}

// 装好之后委托被别人换掉了（宿主或者别的 SDK 直接赋了值）。不抢回来：抢回来
// 再转给它的话，它要是也把原来的委托（就是这里）记下来往回转，就成了死循环。
// 只说一声。它把回调转给原来的委托的话，事件照常到 JS；不转就到不了
- (void)checkStillInstalled {
  if (!self.installed || self.warnedReplaced) return;
  id<UNUserNotificationCenterDelegate> now = self.center.delegate;
  if (now == self) return;
  self.warnedReplaced = YES;
  NSLog(@"[nacre] UNUserNotificationCenter.delegate is now %@, not the one "
        @"@nacrejs/user-notifications installed at launch. The notification and "
        @"notificationclick events reach JS only if that delegate forwards its "
        @"callbacks to the previous delegate, and foregroundPresentationOptions is ignored "
        @"unless it does.",
        now != nil ? NSStringFromClass([(NSObject*)now class]) : @"nil");
}

- (void)applicationDidFinishLaunching:(NSNotification*)note {
  [self checkStillInstalled];
}

- (void)flushHeldResponses {
  if (self.heldResponses.count == 0) return;
  NSArray<NSString*>* held = [self.heldResponses copy];
  [self.heldResponses removeAllObjects];
  for (NSString* json in held) {
    nacre_bridge::NacreEmitEventWithJSON(self.center, nacre_bridge::kCenterClass,
                                         nacre_bridge::kResponseEvent, json);
  }
}

// ---- 没有实现的委托方法转给 next ----
// 现在只有 openSettingsForNotification: 一个；系统以后加了新的也照样转
- (BOOL)respondsToSelector:(SEL)selector {
  return [super respondsToSelector:selector] || [(id)self.next respondsToSelector:selector];
}

- (id)forwardingTargetForSelector:(SEL)selector {
  id next = self.next;
  return [next respondsToSelector:selector] ? next : nil;
}

// App 在前台时到了一条通知，系统问要怎么显示。这个回调在哪个线程上来，
// 文档和头文件都没说，所以这里不假设是主线程。
//
// 事件带上这条通知：事件延后一轮才派发，而且前台显示是空的时候，这条通知
// 之后哪儿都读不到
- (void)userNotificationCenter:(UNUserNotificationCenter*)center
       willPresentNotification:(UNNotification*)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  NSString* json =
      nacre_bridge::JSONText(@{@"notification": nacre_bridge::NotificationToJSON(notification)});
  nacre_bridge::OnMain(^{
    if (!self.wantsPresent) return;
    nacre_bridge::NacreEmitEventWithJSON(self.center, nacre_bridge::kCenterClass,
                                         nacre_bridge::kPresentEvent, json);
  });
  id<UNUserNotificationCenterDelegate> next = self.next;
  if ([next respondsToSelector:_cmd]) {
    // 原来的委托自己会回答系统，怎么显示由它定
    [next userNotificationCenter:center
         willPresentNotification:notification
           withCompletionHandler:completionHandler];
    return;
  }
  // 按 JS 预先设好的值回答，不进 JS
  completionHandler(self.presentation);
}

// 用户对一条通知做了动作：点开、划掉、点了自定义的按钮。本地的和远程推送的
// 通知都走这里。
//
// 有人听就派发；没人听先留着，最多 kMaxHeldResponses 条，超出丢最旧的。
// 「点通知把 App 启动起来」的那一次就是这种情况：系统交过来时 JS 还没跑到
// 注册监听器的那一行
- (void)userNotificationCenter:(UNUserNotificationCenter*)center
    didReceiveNotificationResponse:(UNNotificationResponse*)response
             withCompletionHandler:(void (^)(void))completionHandler {
  NSString* json =
      nacre_bridge::JSONText(@{@"response": nacre_bridge::ResponseToJSON(response)});
  id<UNUserNotificationCenterDelegate> next = self.next;
  BOOL forwards = [next respondsToSelector:_cmd];
  nacre_bridge::OnMain(^{
    if (self.wantsResponse) {
      nacre_bridge::NacreEmitEventWithJSON(self.center, nacre_bridge::kCenterClass,
                                           nacre_bridge::kResponseEvent, json);
    } else {
      [self.heldResponses addObject:json];
      while (self.heldResponses.count > nacre_bridge::kMaxHeldResponses) {
        [self.heldResponses removeObjectAtIndex:0];
      }
    }
    // 「处理完了」告诉系统。排在事件后面一轮：监听器是在那一轮里同步跑的，
    // 所以系统收到「处理完了」时，监听器里同步做的事已经做完
    if (!forwards) dispatch_async(dispatch_get_main_queue(), completionHandler);
  });
  if (forwards) {
    // 原来的委托自己会告诉系统「处理完了」
    [next userNotificationCenter:center
        didReceiveNotificationResponse:response
                 withCompletionHandler:completionHandler];
  }
}

@end

// ---- 登记 ----
// framework 被嵌进 App 就会走到，宿主不用写任何代码
@interface NacreUserNotificationsRegistration : NSObject
@end
@implementation NacreUserNotificationsRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "user-notifications";
  d.classes = {UNUserNotificationCenter.class};
  d.read = nacre_bridge::ReadUserNotificationsProperty;
  d.write = nacre_bridge::WriteUserNotificationsProperty;
  d.call = nacre_bridge::UserNotificationsCall;
  d.callAsync = nacre_bridge::UserNotificationsCallAsync;
  d.classCallObject = nacre_bridge::UserNotificationsClassCallObject;
  d.subscribe = nacre_bridge::UserNotificationsSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
  nacre_bridge::NacreRegisterBuiltinParts(self);

  // 委托现在就装。头文件的原话：The delegate must be set before the
  // application returns from application:didFinishLaunchingWithOptions:。
  // 一个嵌进来的 framework 改不了宿主的启动壳，能赶在那之前的时机只有这里；
  // 系统的「启动完成」通知是在那个方法返回**之后**才发的（Apple 的文档）。
  // 这时 main() 还没开始，所以取通知中心的那一下是包在 @try 里的（见 center）：
  // 这里装不上的话，JS 第一次取通知中心时会再装一次
  [NacreNotificationHub.shared installIfNeeded];
  // 宿主的启动代码跑完之后看一眼：委托被换掉了就提醒
  [NSNotificationCenter.defaultCenter addObserver:NacreNotificationHub.shared
                                         selector:@selector(applicationDidFinishLaunching:)
                                             name:UIApplicationDidFinishLaunchingNotification
                                           object:nil];
}
@end
