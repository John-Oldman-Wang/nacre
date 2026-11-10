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

// 文件读写的异步结果。四种兑现方式对应 Engine 的四个 Settle*，只会给一次。
// ObjC 的声明只能在全局作用域，所以和 NacreBlob 一样放在 namespace 外面。
@interface NacreFileResult : NSObject
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

typedef void (^NacreFileDone)(NacreFileResult* result);

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
std::string EnumError(NSString* what, id given, NSString* choices);

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
NSString* CornerCurveFromName(NSString* name);
NSString* NameForCornerCurve(NSString* curve);
NSString* NamesForCornerCurve(void);

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
nacre::NativeObjectRef CallClassObjectMethod(const std::string& className,
                                             const std::string& name,
                                             const std::string& argsJSON,
                                             const std::vector<void*>& argPtrs,
                                             std::string* error);
nacre::NativeObjectRef ConstructNative(const std::string& className,
                                       const std::vector<void*>& args);

// ---- 文件读写 ----
/// 认不认领。认领了就自己派到后台队列做，做完在**后台线程**调 done——
/// 回主线程是调用方的事，这个文件不认识 NacreRuntime。
bool FileSystemCallAsync(id object, const std::string& name, const std::string& argsJSON,
                         const std::vector<void*>& argPtrs, NacreFileDone done);
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
