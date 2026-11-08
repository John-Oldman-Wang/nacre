// 能力暴露的内部接口。
//
// 这里只放**声明**：把 iOS 能力交给 JS 的那些分发函数，以及它们之间共享的
// 小工具。实现分在 Bridge/ 下的几个 .mm 里，按能力域分（见 docs/project.md
// 第 5 节的拆分规则）。
//
// 这是运行时的内部头，不对外。对外的面是 ios/Runtime/NacreRuntime.h。
#pragma once

#import <UIKit/UIKit.h>

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
nacre::NativeObjectRef ReadClassObjectProperty(const std::string& className,
                                               const std::string& name);
NSDictionary<NSString*, UIColor*>* NamedColors();

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

// ---- URL ----
// 规范化全在原生层做完（NSURLComponents + standardizedURL），JS 侧只解码。
std::string ParseURL(const std::string& text, const std::string& base);

}  // namespace nacre_bridge
