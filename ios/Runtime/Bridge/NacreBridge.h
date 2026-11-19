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

// 给能力包用的那一组（NacreKeep、NacreAsyncResult、DecodeJSON、枚举宏、注册
// 接口……）单独成了一个头，核心自己也从那里拿。
#import "../NacreExtension.h"


// WebSocket 的事件出口。NacreWebSocket.mm 不认识 NacreRuntime，所以由它在
// 启动时塞进来——和文件读写的 done 块一个路子。
// json 为 nil 表示没有负载；blob 非 nil 表示负载是个 Blob（二进制消息）。
@class NacreBlob;
// 只在声明里提到它们；用到的文件自己 #import <WebKit/WebKit.h>
@class WKWebView;
@class WKWebsiteDataStore;
typedef void (^NacreWebSocketEmit)(id task, NSString* type, NSString* json,
                                   NacreBlob* blob);

// 网页的事件出口，同一个路子。json 为 nil 表示没有负载
typedef void (^NacreWebContentsEmit)(id contents, NSString* type, NSString* json);
// 能被取消的网页事件的出口：派发完之后用 answer 把「监听器取消了没有」
// 交回来。**answer 必须恰好被调一次**——它后面连着系统的一个回调，那个
// 回调不答，WebKit 会抛异常
typedef void (^NacreWebContentsAsk)(id contents, NSString* type, NSString* json,
                                    void (^answer)(BOOL prevented));

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

// 外观特征变了的事件出口：谁的特征变了、变之前是什么
typedef void (^NacreTraitEmit)(id environment, UITraitCollection* previous);

// 动图的帧信息，挂在那张 UIImage 上（见 NacreAnimatedImage.mm）。
// UIImage 自己只装得下「每帧等长」和「一直循环」，文件里的事实比它多。
@interface NacreImageFrames : NSObject
@property(nonatomic, copy) NSArray<UIImage*>* images;
/// 每帧显示多久，秒。个数和 images 相同
@property(nonatomic, copy) NSArray<NSNumber*>* durations;
/// 播一遍多久，秒
@property(nonatomic) NSTimeInterval duration;
/// 一共播几遍。0 是一直播
@property(nonatomic) NSInteger loopCount;
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
// EncodeJSON 的声明在 NacreExtension.h（能力包也要用）
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
NSDictionary* DirectionalInsetsToJSON(NSDirectionalEdgeInsets i);
NSDirectionalEdgeInsets JSONToDirectionalInsets(id v);
NSDictionary* TransformToJSON(CGAffineTransform t);
CGAffineTransform JSONToTransform(id v);

// ---- 取参 ----
// RequireNumber / RequireInteger / RequireBool 和 NACRE_NUM / NACRE_INT /
// NACRE_BOOL 三个宏搬到了 NacreExtension.h：能力包也要用它们取参。
// 没有报错出口的地方用（结构体解码、颜色）：不是数就给 0，绝不会崩
double SafeNumber(id value);

// 对象值的取法，给「写对象属性」那条通道用（那几个函数返回 void）。
// 照 Web IDL：对象不转换。null 可以——这些属性在 ObjC 里都是可空的；
// 给了对象就得是要求的那个类，不是就填报错并从所在函数返回。
// 以前的写法是 `[value isKindOfClass:X.class] ? value : nil`：类型不对
// 被当成 nil，于是 label.font = someColor 静默把字体清掉。
#define NACRE_OBJECT_OR_NIL(v, Cls, what)                              \
  ({                                                                   \
    id _ov = (v);                                                      \
    if (_ov != nil && ![_ov isKindOfClass:[Cls class]]) {              \
      nacre_bridge::ObjectTypeError((what), #Cls, true, error);        \
      return;                                                          \
    }                                                                  \
    (Cls*)_ov;                                                         \
  })
void ObjectTypeError(const std::string& what, const char* className, bool nullable,
                     std::string* error);

// ---- 环境快照 ----
NSString* BackgroundRefreshName(UIBackgroundRefreshStatus status);
NSString* SceneActivationName(UISceneActivationState state);
const char* StateName(int state);
void RebuildEnvironment(const std::shared_ptr<AppSnapshot>& snapshot);
std::string InfoDictionaryJSON();
// 宿主交给运行时的脚本目录（模板里是 App 包里的 JS/）。application.fileSystem.assets
// 是它下面的 assets/：CLI 把项目的 assets/ 拷到那里
void NacreSetScriptsDirectory(NSURL* directory);

// ---- 枚举（数字枚举的宏在 NacreExtension.h，这里是另外两种）----
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



// 字符串枚举的声明，和 NACRE_STRING_ENUM_MAP 配对
#define NACRE_STRING_ENUM_DECL(FuncName)                \
  NSString* FuncName##FromName(NSString* name);         \
  NSString* NameFor##FuncName(NSString* value);         \
  NSString* NamesFor##FuncName(void);


// 位掩码。和单值枚举的区别只有一处：一个数值对应**一组**名字，所以 JS 侧
// 是字符串数组。空数组是合法的（表示一个都不选），但「不是数组」要抛。
#define NACRE_MASK_DECL(FuncName, Type)                 \
  BOOL FuncName##FromNames(id value, Type* out, id* bad); \
  NSArray<NSString*>* NamesIn##FuncName(Type value);    \
  NSString* NamesFor##FuncName(void);

NACRE_ENUM_DECL(TextAlignment, NSTextAlignment)
NACRE_ENUM_DECL(WebNavigationType, NSInteger)
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
NACRE_ENUM_DECL(TabBarMinimizeBehavior, UITabBarMinimizeBehavior)
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
BOOL IsTabEventName(NSString* name);
NSString* NamesForTabEvent(void);
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
  NacreAnimValueImage,
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
// warning：枚举属性写了不认识的值时填它（error 留空）——值没动，JS 那边打一条
// 警告，不抛。别的错照旧填 error
void WriteNativeProperty(id object, const std::string& name, const std::string& json,
                         std::string* error, std::string* warning);

// 「最近一次报错是不是枚举不认识的值」。EnumError 把它置上；写属性的入口在
// 分发之前清掉、分发之后看。JS 和原生都在主线程上，一个静态变量就够。
// 用它而不是去认报错的文字：文字是给人看的，改了措辞不该改行为
void NacreClearUnknownEnumValue(void);
bool NacreSawUnknownEnumValue(void);
nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name);
void WriteNativeObjectProperty(id object, const std::string& name, void* valuePtr,
                               std::string* error);
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
void WriteSceneObjectProperty(id object, const std::string& name, id value,
                              std::string* error);
void ReadSceneObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);
BOOL WriteSceneObjectArray(id object, const std::string& name, const std::vector<void*>& values, std::string* error);

id ReadControlProperty(id object, NSString* key);
BOOL WriteControlProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadControlObjectProperty(id object, const std::string& name);
void WriteControlObjectProperty(id object, const std::string& name, id value,
                                std::string* error);

id ReadLayoutProperty(id object, NSString* key);
BOOL WriteLayoutProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadLayoutObjectProperty(id object, const std::string& name);

id ReadLayerProperty(id object, NSString* key);
BOOL WriteLayerProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadLayerObjectProperty(id object, const std::string& name);
void WriteLayerObjectProperty(id object, const std::string& name, id value,
                              std::string* error);
void ReadLayerObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);
BOOL WriteLayerObjectArray(id object, const std::string& name, const std::vector<void*>& values, std::string* error);

// 一个 CALayer* 实际是哪个类。包装表按指针缓存，第一次包成什么类之后就
// 一直是那个类，所以凡是把图层交给 JS 的地方都得问这里，不能一律写
// "CALayer"——否则从 sublayers 里先读到的渐变层会永远是个 CALayer。
const char* LayerClassName(CALayer* layer);

// ---- 设备 ----
NACRE_ENUM_DECL(UserInterfaceIdiom, UIUserInterfaceIdiom)
nacre::NativeObjectRef DeviceClassObject(const std::string& className,
                                         const std::string& name);
id ReadDeviceProperty(id object, NSString* key);

// 触感反馈、剪贴板、手势三个域是登记进来的（各自文件末尾的 +load），
// 这里没有它们的声明——核心不认识它们。新接的域都照这个做。

// ---- 密码学 ----
bool FillRandom(void* bytes, size_t length);

// ---- 外观特征 ----
// 一个域一个文件（NacreTrait.mm）。枚举只在那个文件里用，所以不在这里声明
bool TraitObservable(id object);
bool TraitSetSubscription(id object, NSString* type, BOOL on, NacreTraitEmit emit,
                          std::string* error);
id ReadTraitProperty(id object, NSString* key);
BOOL WriteTraitProperty(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef ReadTraitObjectProperty(id object, const std::string& name);

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
void WriteAnimationObjectProperty(id object, const std::string& name, id value,
                                  std::string* error);
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
void WriteViewObjectProperty(id object, const std::string& name, id value,
                             std::string* error);

id ReadResourceProperty(id object, NSString* key);
void ReadResourceObjectArray(id object, const std::string& name, std::vector<nacre::NativeObjectRef>& refs);

// ---- 动图（NacreAnimatedImage.mm） ----
// data 是多帧的 GIF / APNG / WebP 时，把帧信息挂到 image 上；别的情况原样还回去
UIImage* NacreAttachFrames(UIImage* image, NSData* data);
// imageNamed 命中的那个文件的字节；找不到（比如图在 Asset Catalog 里）是 nil
NSData* NacreDataForNamedImage(NSString* name, UIImage* image);
NacreImageFrames* NacreFramesOfImage(UIImage* image);
// 按图片视图当前该显示的那张图，挂上或者摘掉帧动画
void NacreSyncFrameAnimation(UIImageView* view);
// 所有帧放到后台解码；done 在后台线程上调
void NacrePrepareFramesForDisplay(UIImage* image, void (^done)(UIImage* ready));
extern NSString* const NacreImageFramesAnimationKey;

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
                                       const std::vector<void*>& args,
                                       std::string* error);

// ---- 方法调用的参数包 ----
// NacreArgs 搬到了 NacreExtension.h：登记进来的域也要用它。

// ---- 导航 ----
// 一个域一个文件、装它在所有通道上的分支，每个入口返回「认不认领」
bool NavCallVoidMethod(id object, const std::string& name);
bool NavCallMethod(id object, NSString* sel, const NacreArgs& args,
                   std::string* out, std::string* error);
// 父子控制器那一组（addChildViewController: 等），任何 UIViewController 都认
bool ContainerCallMethod(id object, NSString* sel, const NacreArgs& args,
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

// ---- WebView ----
// 一个域一个文件（NacreWebView.mm），每个入口返回「认不认领」
void WebViewSetEmitter(NacreWebContentsEmit emit);
void WebViewSetAsker(NacreWebContentsAsk ask);
nacre::NativeObjectRef WebViewConstruct(id options);
nacre::NativeObjectRef ReadWebViewObjectProperty(id object, const std::string& name);
NacreSubscribed WebContentsSetSubscription(id object, NSString* type, BOOL on, std::string* error);
bool WebViewCallMethod(id object, NSString* sel, const NacreArgs& args,
                       std::string* out, std::string* error);
bool WebViewCallAsync(id object, const std::string& name, const std::string& argsJSON,
                      const std::vector<void*>& argPtrs, NacreAsyncDone done);
// 在网页里执行一段代码（NacreWebScript.mm）。isExpression 决定走哪个系统
// 接口，见那边的说明
void WebExecuteJavaScript(WKWebView* webView, NSString* code, BOOL isExpression,
                          NacreAsyncDone done);
// 「返回值不是原生对象的类方法」那条通道上的分支：读预加载脚本的源码
bool WebViewCallClassMethod(const std::string& className, NSString* sel,
                            const NacreArgs& args, std::string* out, std::string* error);

// ---- Session（NacreWebSession.mm）：分区、cookie、清数据 ----
// 分区名 → 数据存储。WebView 建网页和 Session 用的是同一个换算
WKWebsiteDataStore* WebStoreForPartition(NSString* partition);
void WebSessionSetEmitter(NacreWebContentsEmit emit);
bool WebSessionClassCall(const std::string& className, NSString* sel, NSArray* args,
                         nacre::NativeObjectRef* out, std::string* error);
bool WebSessionCallMethod(id object, NSString* sel, const NacreArgs& args,
                          std::string* out, std::string* error);
bool WebSessionCallAsync(id object, const std::string& name, const std::string& argsJSON,
                         const std::vector<void*>& argPtrs, NacreAsyncDone done);

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
// Intl：类都在内置脚本里，原生这边只有几个类级的调用（NacreIntl.mm）
bool IntlCallClassMethod(const std::string& className, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error);
// 日期那一组（NacreIntlDate.mm）。认领了返回 true
bool IntlDateCallClassMethod(NSString* sel, const NacreArgs& args, std::string* out,
                             std::string* error);

// ---- 颜色 ----
// 上层的颜色是字符串，解析在 JS 侧（纯文本运算），过桥的是规范化的 spec。
UIColor* ColorFromSpec(id spec);
NSDictionary* ColorToSpec(UIColor* color);
bool ColorCallMethod(id object, const std::string& name, std::string* out);


// ---- 能力域的分发（核心自己用；注册那一半在 NacreExtension.h）----
/// 登记了内置脚本的那些能力包，按包名排好序。核心的 part 跑完之后依次执行
NSArray<NSBundle*>* NacreRegisteredPartBundles();
/// 挨个问注册进来的能力域，谁认领就返回谁的结果
bool NacreDispatchAsyncMethod(id object, const std::string& name, const std::string& argsJSON,
                              const std::vector<void*>& argPtrs, NacreAsyncDone done);
/// 没人认领时 class_name 是空的
nacre::NativeObjectRef NacreDispatchClassObject(const std::string& className,
                                                const std::string& name);

// 登记进来的域（NacreRegisterDomain）在各条通道上的分发。核心的分发器在走
// 自己那串 if 之前先问这里。约定和单个域的处理函数一样：
// 读返回 nil / 空 ref 表示没人认领，其余返回 true 表示有域处理了。
id NacreDomainRead(id object, NSString* key);
bool NacreDomainWrite(id object, NSString* key, id value, std::string* error);
nacre::NativeObjectRef NacreDomainReadObject(id object, const std::string& name);
bool NacreDomainWriteObject(id object, const std::string& name, id value,
                            std::string* error);
void NacreDomainReadObjectArray(id object, const std::string& name,
                                std::vector<nacre::NativeObjectRef>& refs);
bool NacreDomainWriteObjectArray(id object, const std::string& name,
                                 const std::vector<void*>& values, std::string* error);
bool NacreDomainCallVoid(id object, const std::string& name);
bool NacreDomainCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                     std::string* error);
bool NacreDomainCallObject(id object, NSString* sel, const NacreArgs& args,
                           nacre::NativeObjectRef* out, std::string* error);
bool NacreDomainCallObjectArray(id object, NSString* sel, const NacreArgs& args,
                                std::vector<nacre::NativeObjectRef>* out,
                                std::string* error);
bool NacreDomainConstruct(const std::string& className, const NacreArgs& args,
                          nacre::NativeObjectRef* out, std::string* error);
bool NacreDomainClassCall(const std::string& className, NSString* sel,
                          const NacreArgs& args, std::string* out, std::string* error);
bool NacreDomainClassCallObject(const std::string& className, NSString* sel,
                                const NacreArgs& args, nacre::NativeObjectRef* out,
                                std::string* error);
NacreSubscribed NacreDomainSubscribe(id object, NSString* type, BOOL on, std::string* error);

/// 事件出口的另一头：NacreRuntime 启动时把自己的派发塞进来，登记进来的域
/// 调 NacreEmitEvent… 时走到这里。json 和 payload 最多给一个。
typedef void (^NacreEventSink)(id object, const char* className, NSString* type,
                               NSString* json, id payload, const char* payloadClass);
void NacreSetEventSink(NacreEventSink sink);

/// 同步回调的另一头，同样由 NacreRuntime 启动时塞进来。
/// ask：当场派发一个可取消的事件，返回取消了没有。
/// call：调一段 JS 登记过的代码；later 为 YES 时延后一轮。
typedef BOOL (^NacreSyncAsk)(id object, const char* className, NSString* type,
                             NSString* json);
typedef void (^NacreBlockCall)(NSInteger blockId, NSString* argsJSON, BOOL later);
void NacreSetSyncSinks(NacreSyncAsk ask, NacreBlockCall call);

// ---- 被链接打开 ----
/// 给场景委托的类补上收链接的那三个方法，转成 application 的 openurl 事件。
/// 运行时启动时调一次：要赶在第一个场景接入之前。见 NacreOpenURL.mm
void InstallOpenURLForwarding(void);

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
