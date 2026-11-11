// 能力暴露的内部接口。
//
// 这里只放**声明**：把 iOS 能力交给 JS 的那些分发函数，以及它们之间共享的
// 小工具。实现分在 Bridge/ 下的几个 .mm 里，按能力域分（见 docs/project.md
// 第 5 节的拆分规则）。
//
// 这是运行时的内部头，不对外。对外的面是 ios/Runtime/NacreRuntime.h。
#pragma once

#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>

#include <memory>
#include <mutex>
#include <string>
#include <vector>

#include "../Engine/Engine.h"

// Blob：JS 侧只拿一个句柄，字节留在这边的 NSData 里。
//
// Chrome 为此要跨进程、要 UUID、要配额管理，因为它的数据在 browser 进程、
// JS 在渲染进程。我们同进程，直接持指针——而且这套包装机制已经在跑了，
// UIView、UIColor 都是「JS 侧小包装 + 原生侧真数据 + 弱引用句柄表」。
@interface NacreBlob : NSObject
@property(nonatomic, strong) NSData* data;
@property(nonatomic, copy) NSString* type;
@end

// 异步调用的结果。四种兑现方式对应 Engine 的四个 Settle*，只会给一次。
// 文件读写和 Keychain 共用——两边都是「派到后台做完再兑现」。
// ObjC 的声明只能在全局作用域，所以和 NacreBlob 一样放在 namespace 外面。
@interface NacreAsyncResult : NSObject
@property(nonatomic) BOOL isError;
@property(nonatomic, copy, nullable) NSString* errorName;
@property(nonatomic, copy, nullable) NSString* errorMessage;
/// NSError 的原值，留给名字映射盖不住的那部分事实
@property(nonatomic) NSInteger errorCode;
@property(nonatomic, copy, nullable) NSString* errorDomain;
/// 非 nil → SettleJSON
@property(nonatomic, strong, nullable) id json;
/// 非 nil → SettleBytes（零拷贝）
@property(nonatomic, strong, nullable) NSData* bytes;
/// 其余 → SettleBool
@property(nonatomic) BOOL boolValue;
@end

typedef void (^NacreAsyncDone)(NacreAsyncResult* result);

// WebSocket 的事件出口。NacreWebSocket.mm 不认识 NacreRuntime，所以由它在
// 启动时塞进来——和文件读写的 done 块一个路子。
// json 为 nil 表示没有负载；blob 非 nil 表示负载是个 Blob（二进制消息）。
@class NacreBlob;
typedef void (^NacreWebSocketEmit)(id task, NSString* type, NSString* json,
                                   NacreBlob* blob);

// Keychain 的载体。iOS 上没有「钥匙串对象」这种东西，SecItem* 是一组 C 函数，
// 所以自己给一个单例当包装表里的那个原生指针。
// CADisplayLink 的 trampoline。
//
// ObjC 那边是 target-action，而 target 和 selector 在 JS 里没有对应物
// （和控件事件一样），所以运行时自己当 target，JS 侧只看到事件。
//
// **link 对 target 是强持有**（头文件写着 invalidate 会 release 掉 target），
// 所以这里反过来只能弱引用，否则成环。runtime 要等 JS 订阅时才填。
@interface NacreDisplayLinkTarget : NSObject
@property(nonatomic, weak) id runtime;
@property(nonatomic, weak) CADisplayLink* link;
@property(nonatomic, assign) BOOL subscribed;
- (void)tick:(CADisplayLink*)sender;
@end

// 关联对象的 key：CADisplayLink → NacreDisplayLinkTarget。
// link 本来就强持有 target，但 CADisplayLink **没有公开的 target 属性**，
// 所以订阅时要靠这个关联把 trampoline 找回来
extern const void* kNacreDisplayLinkTargetKey;

@interface NacreKeychain : NSObject
@property(class, readonly) NacreKeychain* shared;
@end

namespace nacre_bridge {

// application 的数据快照：主线程写，JS 线程读。
// UIKit 只能在主线程访问，所以这里缓存值，JS 线程上的回调只读缓存，绝不碰 UIKit。
struct AppSnapshot {
  std::string infoJSON;                 // 启动时抓一次，之后不变
  std::mutex mutex;                     // 保护下面这个
  std::string environmentJSON = "{}";   // 主线程在相关通知到达时重建
};

// ---- 日志、时间 ----
void WriteJSLog(nacre::LogLevel level, const std::string& message);
void WriteRuntimeLog(NSString* message);
double NowMs();

// ---- JSON 和结构体 ----
id SanitizeForJSON(id value);
std::string EncodeJSON(id value);
id DecodeJSON(const std::string& json);
NSDictionary* PointToJSON(CGPoint p);
NSDictionary* SizeToJSON(CGSize z);
NSDictionary* InsetsToJSON(UIEdgeInsets i);
NSDictionary* RectToJSON(CGRect r);
NSDictionary* FrameRateRangeToJSON(CAFrameRateRange r);
CAFrameRateRange JSONToFrameRateRange(id v);
CGPoint JSONToPoint(id v);
CGSize JSONToSize(id v);
CGRect JSONToRect(id v);
UIEdgeInsets JSONToInsets(id v);
NSDictionary* TransformToJSON(CGAffineTransform t);
CGAffineTransform JSONToTransform(id v);

// ---- 环境快照 ----
NSString* BackgroundRefreshName(UIBackgroundRefreshStatus status);
NSString* SceneActivationName(UISceneActivationState state);
const char* StateName(int state);
void RebuildEnvironment(const std::shared_ptr<AppSnapshot>& snapshot);
std::string InfoDictionaryJSON();

// ---- 枚举 ----
// 名字 ↔ 数值的映射只能放在原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1，macOS 上是 2），在 JS 里按下标映射换个平台就全错。
NSString* JoinEnumNames(NSDictionary<NSString*, NSNumber*>* table);

// 枚举表的两个宏放在头文件里，这样每个能力域可以单独成一个 .mm——
// 拆分发表的同一条规矩：按能力域分文件，共享的只放声明。
#define NACRE_ENUM_MAP(FuncName, Type, ...)                                   \
  static NSDictionary<NSString*, NSNumber*>* FuncName##Table(void) {          \
    static NSDictionary<NSString*, NSNumber*>* table;                         \
    static dispatch_once_t once;                                              \
    dispatch_once(&once, ^{ table = @{__VA_ARGS__}; });                       \
    return table;                                                             \
  }                                                                           \
  BOOL FuncName##FromName(NSString* name, Type* out) {                        \
    if (![name isKindOfClass:NSString.class]) return NO;                      \
    NSNumber* v = FuncName##Table()[name];                                    \
    if (v == nil) return NO;                                                  \
    *out = (Type)v.integerValue;                                              \
    return YES;                                                               \
  }                                                                           \
  NSString* NameFor##FuncName(Type value) {                                   \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();            \
    for (NSString* key in table) {                                            \
      if (table[key].integerValue == (NSInteger)value) return key;            \
    }                                                                         \
    return nil;                                                               \
  }                                                                           \
  NSString* NamesFor##FuncName(void) { return JoinEnumNames(FuncName##Table()); }
// 值是 NSString 常量的枚举（kCAFillRuleNonZero、kCACornerCurveCircular…）。
// 和 NACRE_ENUM_MAP 的区别只有一处：那个宏的值必须是数字（NS_ENUM）。
//
// 用**有序 pairs** 不用字典，和 StackAlignment 同一个理由：一个值挂两个
// 名字时反查必须有确定答案，无序字典给不了。抽宏之前这是七份一模一样的
// 拷贝，而抄串了（NamesForLineJoin 里遍历 LineCapPairs）三边核对**看不见**
// ——它从 LineJoinPairs 的源码文本抽名字，不看函数体里用的是谁。
// 名字只出现一次，那类错就不可能了。
#define NACRE_STRING_ENUM_MAP(FuncName, ...)                                  \
  static NSArray<NSArray*>* FuncName##Pairs(void) {                           \
    static NSArray<NSArray*>* pairs;                                          \
    static dispatch_once_t once;                                              \
    dispatch_once(&once, ^{ pairs = @[__VA_ARGS__]; });                       \
    return pairs;                                                             \
  }                                                                           \
  NSString* FuncName##FromName(NSString* name) {                              \
    if (![name isKindOfClass:NSString.class]) return nil;                     \
    for (NSArray* pair in FuncName##Pairs()) {                                \
      if ([pair[0] isEqualToString:name]) return pair[1];                     \
    }                                                                         \
    return nil;                                                               \
  }                                                                           \
  NSString* NameFor##FuncName(NSString* value) {                              \
    for (NSArray* pair in FuncName##Pairs()) {                                \
      if ([pair[1] isEqualToString:value]) return pair[0];                    \
    }                                                                         \
    return nil;                                                               \
  }                                                                           \
  NSString* NamesFor##FuncName(void) {                                        \
    NSMutableArray<NSString*>* names = [NSMutableArray array];                \
    for (NSArray* pair in FuncName##Pairs()) [names addObject:pair[0]];       \
    return [names componentsJoinedByString:@" / "];                           \
  }

// 位掩码。一个数值拆成一组名字，所以 JS 侧是字符串数组。
// 单值枚举那套宏不够用：它一个名字对一个值，这里要双向拆合。
#define NACRE_MASK_MAP(FuncName, Type, ...)                                   \
  static NSDictionary<NSString*, NSNumber*>* FuncName##Table(void) {          \
    static NSDictionary<NSString*, NSNumber*>* table;                         \
    static dispatch_once_t once;                                              \
    dispatch_once(&once, ^{ table = @{__VA_ARGS__}; });                       \
    return table;                                                             \
  }                                                                           \
  BOOL FuncName##FromNames(id value, Type* out, id* bad) {                    \
    *bad = nil;                                                               \
    /* 「不是数组」和「名字不认识」是两种错，要分开报 */                        \
    if (![value isKindOfClass:NSArray.class]) return NO;                      \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();            \
    Type mask = (Type)0;                                                      \
    for (id name in (NSArray*)value) {                                        \
      NSNumber* bit = [name isKindOfClass:NSString.class] ? table[name] : nil; \
      if (bit == nil) { *bad = name; return NO; }                             \
      mask = (Type)(mask | (Type)bit.unsignedIntegerValue);                   \
    }                                                                         \
    *out = mask;                                                              \
    return YES;                                                               \
  }                                                                           \
  NSArray<NSString*>* NamesIn##FuncName(Type value) {                         \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();            \
    NSArray<NSString*>* keys = [table.allKeys                                 \
        sortedArrayUsingComparator:^NSComparisonResult(NSString* a, NSString* b) { \
          return [table[a] compare:table[b]];                                 \
        }];                                                                   \
    NSMutableArray<NSString*>* out = [NSMutableArray array];                  \
    for (NSString* key in keys) {                                             \
      if (value & (Type)table[key].unsignedIntegerValue) [out addObject:key]; \
    }                                                                         \
    return out;                                                               \
  }                                                                           \
  NSString* NamesFor##FuncName(void) { return JoinEnumNames(FuncName##Table()); }

std::string EnumError(NSString* what, id given, NSString* choices);

// Keychain 的访问级别。顺序就是 NACRE_ENUM_MAP 里的值，别重排
typedef NS_ENUM(NSInteger, NacreKeychainAccessible) {
  NacreKeychainAccessibleWhenUnlocked = 0,
  NacreKeychainAccessibleWhenUnlockedThisDeviceOnly,
  NacreKeychainAccessibleAfterFirstUnlock,
  NacreKeychainAccessibleAfterFirstUnlockThisDeviceOnly,
  NacreKeychainAccessibleWhenPasscodeSetThisDeviceOnly,
};

// 字符串枚举的声明，和 NACRE_STRING_ENUM_MAP 配对
#define NACRE_STRING_ENUM_DECL(FuncName)                \
  NSString* FuncName##FromName(NSString* name);         \
  NSString* NameFor##FuncName(NSString* value);         \
  NSString* NamesFor##FuncName(void);

#define NACRE_ENUM_DECL(FuncName, Type)                 \
  BOOL FuncName##FromName(NSString* name, Type* out);   \
  NSString* NameFor##FuncName(Type value);              \
  NSString* NamesFor##FuncName(void);

// 位掩码。和单值枚举的区别只有一处：一个数值对应**一组**名字，所以 JS 侧
// 是字符串数组。空数组是合法的（表示一个都不选），但「不是数组」要抛。
#define NACRE_MASK_DECL(FuncName, Type)                 \
  BOOL FuncName##FromNames(id value, Type* out, id* bad); \
  NSArray<NSString*>* NamesIn##FuncName(Type value);    \
  NSString* NamesFor##FuncName(void);

NACRE_ENUM_DECL(TextAlignment, NSTextAlignment)
NACRE_ENUM_DECL(LineBreakMode, NSLineBreakMode)
NACRE_ENUM_DECL(ContentMode, UIViewContentMode)
NACRE_ENUM_DECL(BaselineAdjustment, UIBaselineAdjustment)
NACRE_ENUM_DECL(ImageOrientation, UIImageOrientation)
NACRE_ENUM_DECL(ImageRenderingMode, UIImageRenderingMode)
NACRE_ENUM_DECL(ImageResizingMode, UIImageResizingMode)
NACRE_ENUM_DECL(LayoutRelation, NSLayoutRelation)
NACRE_ENUM_DECL(LayoutAttribute, NSLayoutAttribute)
NACRE_ENUM_DECL(LayoutConstraintAxis, UILayoutConstraintAxis)
NACRE_MASK_DECL(CornerMask, CACornerMask)
NACRE_MASK_DECL(ControlState, UIControlState)
// 控件事件：值本身是位，但 JS 侧一次只订阅一个类型，所以按单值查
NACRE_ENUM_DECL(ControlEvent, UIControlEvents)
NACRE_ENUM_DECL(ControlHorizontalAlignment, UIControlContentHorizontalAlignment)
NACRE_ENUM_DECL(ControlVerticalAlignment, UIControlContentVerticalAlignment)
NACRE_ENUM_DECL(ButtonType, UIButtonType)
NACRE_ENUM_DECL(ButtonRole, UIButtonRole)
// Keychain 的访问级别。原生侧是 CFStringRef 常量，这里先映射成序号，
// 再由 NacreKeychain.mm 换成常量——NACRE_ENUM_MAP 的值必须是数字
NACRE_ENUM_DECL(KeychainAccessible, NacreKeychainAccessible)
// ---- 输入框 ----
NACRE_ENUM_DECL(KeyboardType, UIKeyboardType)
NACRE_ENUM_DECL(ReturnKeyType, UIReturnKeyType)
NACRE_ENUM_DECL(TextAutocapitalizationType, UITextAutocapitalizationType)
NACRE_ENUM_DECL(TextAutocorrectionType, UITextAutocorrectionType)
NACRE_ENUM_DECL(TextSpellCheckingType, UITextSpellCheckingType)
NACRE_ENUM_DECL(KeyboardAppearance, UIKeyboardAppearance)
NACRE_ENUM_DECL(TextBorderStyle, UITextBorderStyle)
NACRE_ENUM_DECL(TextFieldViewMode, UITextFieldViewMode)
// textContentType 是 NSString 常量不是 NS_ENUM，所以不走那个宏
BOOL TextContentTypeFromName(NSString* name, UITextContentType* out);
NSString* NameForTextContentType(UITextContentType value);
NSString* NamesForTextContentType(void);
NACRE_ENUM_DECL(StackDistribution, UIStackViewDistribution)
NACRE_ENUM_DECL(ModalPresentationStyle, UIModalPresentationStyle)
NACRE_ENUM_DECL(ModalTransitionStyle, UIModalTransitionStyle)
NACRE_ENUM_DECL(BarButtonSystemItem, UIBarButtonSystemItem)
// 第二个带别名的枚举（done == prominent），同样不走宏，见 NacreEnums.mm
NACRE_ENUM_DECL(BarButtonItemStyle, UIBarButtonItemStyle)
NACRE_ENUM_DECL(IndicatorStyle, UIScrollViewIndicatorStyle)
NACRE_ENUM_DECL(ContentInsetAdjustmentBehavior,
                UIScrollViewContentInsetAdjustmentBehavior)
// UIStackViewAlignment 是第一个带别名的枚举（leading==top、trailing==bottom），
// 所以它不走 NACRE_ENUM_MAP：那个宏的 NameFor 遍历无序字典，同一个值挂两个
// key 时读出来的字符串会不确定。实现改用有序 pairs，见 NacreEnums.mm
NACRE_ENUM_DECL(StackAlignment, UIStackViewAlignment)

// 状态**作参数**时和读 state 不一样：'normal' 要认。它的值是 0，
// 不在位掩码表里，但 setTitle(…, { forState: ['normal'] }) 是最常用的写法。
BOOL ControlStateArgFromNames(id value, UIControlState* out, id* bad);
NSString* NamesForControlStateArg(void);

// spacing 的两个哨兵值（UseSystem 是 FLT_MIN、UseDefault 是 FLT_MAX）在 JS 侧
// 是字符串 'system' / 'default'。数值不过桥，理由和枚举一样：让 JS 开发者手写
// 1.1754943508222875e-38 不现实，而且把平台常量硬编码进 JS 换个平台就错。
// allowDefault 为 NO 时只认 'system'——spacing 属性设成 UseDefault 的效果是 0，
// 没有意义，只有 setCustomSpacing:afterView: 才需要「撤回」。
BOOL StackSpacingFromValue(id value, CGFloat* out, BOOL allowDefault);
id ValueForStackSpacing(CGFloat spacing);
NSString* NamesForStackSpacing(BOOL allowDefault);

// decelerationRate 和 spacing 一样是「数字或具名常量」：Normal 是 0.998、
// Fast 是 0.99，没人记得住，但它又确实接受任意数字。
BOOL DecelerationRateFromValue(id value, CGFloat* out);
id ValueForDecelerationRate(CGFloat rate);
NSString* NamesForDecelerationRate(void);

// UIScrollView 的事件名。它们派生自 delegate 的方法名而不是 ObjC 常量，
// 所以按我们自己起名的惯例全小写（和 scene / window 的事件一致）。
BOOL IsPresentationEventName(NSString* name);
NSString* NamesForPresentationEvent(void);
BOOL IsBarButtonEventName(NSString* name);
NSString* NamesForBarButtonEvent(void);
BOOL IsNavEventName(NSString* name);
NSString* NamesForNavEvent(void);
BOOL IsScrollEventName(NSString* name);
NSString* NamesForScrollEvent(void);

// cornerCurve 的值是 NSString 常量，不是枚举，和文本样式一样
NACRE_STRING_ENUM_DECL(CornerCurve)

// 渐变的类型。和 cornerCurve 一样是 NSString 常量（kCAGradientLayerAxial…）
NACRE_STRING_ENUM_DECL(GradientType)

// CAShapeLayer 的三个枚举。又是 NSString 常量（kCAFillRuleNonZero…）
NACRE_STRING_ENUM_DECL(FillRule)
NACRE_STRING_ENUM_DECL(LineCap)
NACRE_STRING_ENUM_DECL(LineJoin)

// 动画的填充模式和时间曲线名。又是 NSString 常量。
// NameForTimingFunctionName 用不上（曲线是对象，不按名字读回来），
// 但宏一并生成，少一个特例比省一个函数值
NACRE_STRING_ENUM_DECL(FillMode)
NACRE_STRING_ENUM_DECL(TimingFunctionName)
// 关键帧：插值方式，以及沿路径走时转不转向
NACRE_STRING_ENUM_DECL(CalculationMode)
NACRE_STRING_ENUM_DECL(RotationMode)
// run loop 的模式。CADisplayLink 挂到哪个模式上
NACRE_STRING_ENUM_DECL(RunLoopMode)
BOOL IsAnimationEventName(NSString* name);
NSString* NamesForAnimationEvent(void);
// 哪些控件事件带触点。表只在原生层有一份，见 NacreEnumsControl.mm
BOOL IsTouchControlEvent(NSString* name);
BOOL IsDisplayLinkEventName(NSString* name);
NSString* NamesForDisplayLinkEvent(void);

// CABasicAnimation 的 fromValue / toValue / byValue 在 ObjC 里是 id，
// 该放什么类型**由 keyPath 决定**。这张表只能放原生层。
typedef NS_ENUM(NSInteger, NacreAnimValueKind) {
  NacreAnimValueNumber = 0,
  NacreAnimValuePoint,
  NacreAnimValueSize,
  NacreAnimValueRect,
  NacreAnimValueColor,
  NacreAnimValuePath,
};
BOOL AnimValueKindForKeyPath(NSString* keyPath, NacreAnimValueKind* out);
NSString* NamesForAnimationKeyPath(void);

// 圆角矩形要圆哪几个角。位掩码，所以 JS 侧是字符串数组。
// **不收 allCorners**：它的值是 ~0，和「四个都选」不是同一个数，往返不回来。
// 四个全写就是全圆。
NACRE_MASK_DECL(RectCorner, UIRectCorner)

// 字重和文本样式不是枚举（CGFloat / NSString 常量），但 JS 侧一样用字符串
BOOL FontWeightFromName(NSString* name, UIFontWeight* out);
NSString* NamesForFontWeight(void);
UIFontTextStyle TextStyleFromName(NSString* name);
NSString* NamesForTextStyle(void);
// 优先级是 float，具名值只有七个，所以写接受名字或数字
BOOL LayoutPriorityFromValue(id value, UILayoutPriority* out);
NSString* NamesForLayoutPriority(void);

// ---- Auto Layout 的锚点 ----
const char* AnchorClassName(NSLayoutAnchor* anchor);
nacre::NativeObjectRef AnchorNamed(id owner, const std::string& name);

// ---- 属性分发 ----
std::string ReadNativeProperty(id object, const std::string& name);
void WriteNativeProperty(id object, const std::string& name, const std::string& json,
                         std::string* error);
nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name);
void WriteNativeObjectProperty(id object, const std::string& name, void* valuePtr);
std::vector<nacre::NativeObjectRef> ReadNativeObjectArrayProperty(
    id object, const std::string& name);
void WriteNativeObjectArrayProperty(id object, const std::string& name,
                                    const std::vector<void*>& values,
                                    std::string* error);
nacre::NativeObjectRef ReadClassObjectProperty(const std::string& className,
                                               const std::string& name);
NSDictionary<NSString*, UIColor*>* NamedColors();

// 按能力域拆开的属性实现，一个域一个 NacreProps*.mm。分发器只决定问的顺序，
// 见 NacreProperties.mm 开头的说明。约定：
//   读     返回 nil 表示这个域不认识这个名字
//   写     返回 YES 表示这个域处理了（写成了，或者填了 error）
//   对象读 返回 class_name 为空的 ref 表示没处理
//   数组读 只管往 refs 里追加，没有「谁先认领」

id ReadSceneProperty(id object, NSString* key);
BOOL WriteSceneProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadSceneObjectProperty(id object, const std::string& name);
void WriteSceneObjectProperty(id object, const std::string& name, id value);
void ReadSceneObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);
BOOL WriteSceneObjectArray(id object, const std::string& name, const std::vector<void*>& values, std::string* error);

id ReadControlProperty(id object, NSString* key);
BOOL WriteControlProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadControlObjectProperty(id object, const std::string& name);
void WriteControlObjectProperty(id object, const std::string& name, id value);

id ReadLayoutProperty(id object, NSString* key);
BOOL WriteLayoutProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadLayoutObjectProperty(id object, const std::string& name);

id ReadLayerProperty(id object, NSString* key);
BOOL WriteLayerProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadLayerObjectProperty(id object, const std::string& name);
void WriteLayerObjectProperty(id object, const std::string& name, id value);
void ReadLayerObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);
BOOL WriteLayerObjectArray(id object, const std::string& name, const std::vector<void*>& values, std::string* error);

// 一个 CALayer* 实际是哪个类。包装表按指针缓存，第一次包成什么类之后就
// 一直是那个类，所以凡是把图层交给 JS 的地方都得问这里，不能一律写
// "CALayer"——否则从 sublayers 里先读到的渐变层会永远是个 CALayer。
const char* LayerClassName(CALayer* layer);

// ---- WebSocket ----
void WebSocketSetEmitter(NacreWebSocketEmit emit);
nacre::NativeObjectRef WebSocketConstruct(id urlValue, id options);
id ReadWebSocketProperty(id object, NSString* key);
BOOL WriteWebSocketProperty(id object, NSString* key, id value, std::string* error);
bool WebSocketCallAsync(id object, const std::string& name, const std::string& argsJSON,
                        const std::vector<void*>& argPtrs, NacreAsyncDone done);

// ---- 路径 ----
// UIBezierPath 是个值对象，和图层是两个域：路径只管形状，图层管怎么画。
// 方法通道的两个入口要用 NacreArgs，所以声明在它定义之后，和图层域一起。
id ReadPathProperty(id object, NSString* key);
BOOL WritePathProperty(id object, NSString* key, id value, std::string* error);

// ---- 动画 ----
// 方法通道的入口要用 NacreArgs，所以声明在它定义之后，和图层域一起。
id ReadDisplayLinkProperty(id object, NSString* key);
BOOL WriteDisplayLinkProperty(id object, NSString* key, id value, std::string* error);
id ReadAnimationProperty(id object, NSString* key);
BOOL WriteAnimationProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadAnimationObjectProperty(id object, const std::string& name);
void WriteAnimationObjectProperty(id object, const std::string& name, id value);
void ReadAnimationObjectArray(id object, const std::string& name,
                              std::vector<nacre::NativeObjectRef>& refs);
BOOL WriteAnimationObjectArray(id object, const std::string& name,
                               const std::vector<void*>& values, std::string* error);
const char* AnimationClassName(CAAnimation* anim);

id ReadScrollProperty(id object, NSString* key);
BOOL WriteScrollProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadScrollObjectProperty(id object, const std::string& name);
void ReadScrollObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);

id ReadViewProperty(id object, NSString* key);
BOOL WriteViewProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadViewObjectProperty(id object, const std::string& name);
void ReadViewObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);
void WriteViewObjectProperty(id object, const std::string& name, id value);

id ReadResourceProperty(id object, NSString* key);

// ---- 方法分发 ----
// name 是完整的 ObjC selector（JS 层负责把「第一段 + options」还原成它），
// 所以这里的表和 Apple 文档一一对上。对象参数在 args 里是 NSNull，真正的
// 指针按同样的下标在 argPtrs 里。
void CallVoidMethod(id object, const std::string& name);
std::string CallMethod(id object, const std::string& name, const std::string& argsJSON,
                       const std::vector<void*>& argPtrs, std::string* error);
nacre::NativeObjectRef CallObjectMethod(id object, const std::string& name,
                                        const std::string& argsJSON,
                                        const std::vector<void*>& argPtrs,
                                        std::string* error);
std::vector<nacre::NativeObjectRef> CallObjectArrayMethod(
    id object, const std::string& name, const std::string& argsJSON,
    const std::vector<void*>& argPtrs, std::string* error);
// 返回值不是原生对象的类方法。规则同 CallMethod
std::string CallClassMethod(const std::string& className, const std::string& name,
                            const std::string& argsJSON,
                            const std::vector<void*>& argPtrs, std::string* error);
nacre::NativeObjectRef CallClassObjectMethod(const std::string& className,
                                             const std::string& name,
                                             const std::string& argsJSON,
                                             const std::vector<void*>& argPtrs,
                                             std::string* error);
nacre::NativeObjectRef ConstructNative(const std::string& className,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& args);

// ---- 方法调用的参数包 ----
// 原来这些取参的助手是 CallMethod 里的局部 lambda，分发链拆到多个文件之后
// 拿不到了，所以收成一个小结构体。只放头文件里，没有实现文件。
struct NacreArgs {
  NSArray* values;                  // JSON 解出来的，对象位是 null
  const std::vector<void*>* ptrs;   // 对象按同样的下标放在这里
  id value(NSUInteger i) const {
    return values != nil && i < values.count ? values[i] : nil;
  }
  id object(size_t i) const {
    return ptrs != nullptr && i < ptrs->size() ? (__bridge id)(*ptrs)[i] : nil;
  }
};

// ---- 导航 ----
// 一个域一个文件、装它在所有通道上的分支，每个入口返回「认不认领」
bool NavCallVoidMethod(id object, const std::string& name);
bool NavCallMethod(id object, NSString* sel, const NacreArgs& args,
                   std::string* out, std::string* error);
bool NavCallObjectMethod(id object, const std::string& name, const NacreArgs& args,
                         nacre::NativeObjectRef* out, std::string* error);
bool NavCallObjectArrayMethod(id object, const std::string& name, const NacreArgs& args,
                              std::vector<nacre::NativeObjectRef>* out,
                              std::string* error);

// ---- 图层 ----
// 和导航同一个形状：一个域一个文件，每个入口返回「认不认领」
bool LayerCallMethod(id object, NSString* sel, const NacreArgs& args,
                     std::string* out, std::string* error);

// ---- 路径 ----
bool PathCallMethod(id object, NSString* sel, const NacreArgs& args,
                    std::string* out, std::string* error);
bool PathCallObjectMethod(id object, const std::string& name, const NacreArgs& args,
                          nacre::NativeObjectRef* out, std::string* error);

// ---- WebSocket ----
bool WebSocketCallMethod(id object, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error);

// ---- 动画 ----
bool AnimationCallMethod(id object, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error);
bool AnimationCallObjectMethod(id object, const std::string& name, const NacreArgs& args,
                               nacre::NativeObjectRef* out, std::string* error);
// CATransaction 全是类方法，走「返回值不是原生对象的类方法」那条新通道
bool TransactionCallClassMethod(const std::string& className, NSString* sel,
                                const NacreArgs& args, std::string* out,
                                std::string* error);

// ---- 颜色 ----
// 上层的颜色是字符串，解析在 JS 侧（纯文本运算），过桥的是规范化的 spec。
UIColor* ColorFromSpec(id spec);
NSDictionary* ColorToSpec(UIColor* color);
bool ColorCallMethod(id object, const std::string& name, std::string* out);

// ---- Keychain ----
bool KeychainCallAsync(id object, const std::string& name, const std::string& argsJSON,
                       const std::vector<void*>& argPtrs, NacreAsyncDone done);
nacre::NativeObjectRef KeychainClassObject(const std::string& className,
                                           const std::string& name);

// ---- 文件读写 ----
/// 认不认领。认领了就自己派到后台队列做，做完在**后台线程**调 done——
/// 回主线程是调用方的事，这个文件不认识 NacreRuntime。
bool FileSystemCallAsync(id object, const std::string& name, const std::string& argsJSON,
                         const std::vector<void*>& argPtrs, NacreAsyncDone done);
id ReadFileSystemProperty(id object, NSString* key);
nacre::NativeObjectRef FileSystemClassObject(const std::string& className,
                                             const std::string& name);

// ---- 本地存储 ----
// 新写的分发链按已定的规矩返回「认不认领」，不靠在同一个函数里往下掉。
bool StorageCallMethod(id object, const std::string& name, const std::string& argsJSON,
                       std::string* out, std::string* error);
nacre::NativeObjectRef StorageClassObject(const std::string& className,
                                          const std::string& name);

// ---- URL ----
// 规范化全在原生层做完（NSURLComponents + standardizedURL），JS 侧只解码。
std::string ParseURL(const std::string& text, const std::string& base);

}  // namespace nacre_bridge
