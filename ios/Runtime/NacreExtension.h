// 给能力包用的接口。
//
// 一个能力（Keychain，以后的 Face ID、相机……）要能拆成独立的 framework，它的原生代码就
// 不能再 #import 核心的内部头 NacreBridge.h——那里面是核心自己的分发表、
// 几百个声明，而且随时在变。这个头是从那里面**划出来的最小一组**：拿
// Keychain 逼出来的，它用到核心的东西一共就这些。
//
// **App 团队和第三方要接自己的原生代码，用的不是这个头**，是公开的
// NacreModule.h（一个名字、一组方法和事件，ObjC 和 Swift 都能写）。这个头
// 留给「把一个原生类完整暴露给 JS」的场合：我们自己接类、做能力包。
//
// 用法（能力自己的 .mm 里）：
//
//     #import <Nacre/NacreExtension.h>
//
//     @implementation MyCapabilityRegistration
//     + (void)load {
//       nacre_bridge::NacreRegisterAsyncMethodHandler(MyCallAsync);
//       nacre_bridge::NacreRegisterClassObjectHandler(MyClassObject);
//       nacre_bridge::NacreRegisterBuiltinParts(self);
//     }
//     @end
//
// 这是 ObjC++ 的头（有 std::string），Swift 读不了。它在 framework 里的可见性
// 是 private：进 PrivateHeaders，不进 umbrella header，普通宿主看不到它。
#pragma once

#import <Foundation/Foundation.h>

#include <string>
#include <vector>

#include "NativeObjectRef.h"

// 把一个 ObjC 对象交成 NativeObjectRef 里的裸指针，**同时让它活过这次交接**。
//
// NativeObjectRef 只是「指针 + 类名」，不持有对象；真正持有的是引擎的
// WrapNative，它拿到指针之后才 CFRetain。中间这一段没人管。以前这里写的是
// `{(__bridge void*)view.backgroundColor, "UIColor"}`——`__bridge` 不转移
// 所有权，而 `view.backgroundColor` 返回的是一个临时对象，这条语句一结束
// ARC 就可以把它释放掉，交出去的是悬空指针。
//
// **Debug 下从来不崩，Release 下必崩。** 没开优化时那个临时对象会留在自动
// 释放池里（ARC 的返回值握手在 -O0 下不成立），碰巧活到这一轮 run loop
// 结束；开了优化就直接销毁。而验收以前只跑 Debug，交付的 xcframework 是
// Release——这个问题在交付物里躺了很久，`box.backgroundColor` 一读就崩。
//
// 做法是显式放进自动释放池：对象至少活到当前池排空。JS 调宿主是同步的，
// 从这里返回到 WrapNative 持有它，都在同一个池的生命周期里。
//
// 不逐个判断「这个属性的对象有没有别人持有」——那是 UIKit 的实现细节，
// 换个系统版本就可能变。所以凡是造 NativeObjectRef，一律走这里；
// check-api.sh 盯着别再长出裸的 (__bridge void*)。
//
// 它**不管跨轮的事**：对象要等下一轮主队列才用（延后派发、异步兑现）时，
// 让 block 捕获对象本身，在 block 里面再造 ref——见 NacreRuntime.mm 的
// emitEvent:from:className:then:。
static inline void* NacreKeep(id _Nullable object) {
  return object != nil ? (void*)CFAutorelease(CFBridgingRetain(object)) : nullptr;
}

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
// 凡是「派到后台做完再兑现」的能力都用它（文件读写、Keychain……）。
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

namespace nacre_bridge {

// ---- JSON ----
// 过桥的值都是 JSON 文本。能力拿到的 argsJSON 用它解开
id DecodeJSON(const std::string& json);
// 反方向：把一个值编成 JSON 文本（call 通道的 *out、事件带的数据）。顶层可以
// 是字符串、数、布尔；nil 编成 null；JSON 表示不了的东西（NSDate 之类）会先
// 被换成能表示的，编不出来给 "null"，不抛
std::string EncodeJSON(id value);

// ---- 取参：原生层只收类型精确的值 ----
//
// 分工见 project.md 的 API 设计原则第 13 条：转换全在 JS 一侧做完，
// 原生不猜、不转。下面三个 Require* 只做判断——类型不是它要的那一种就往
// error 里写一句话并返回 false。
//
// 正常使用时走不到这些报错（内置脚本已经把值转好了）；走到了，说明
// 运行时自己漏了一处转换，报错能直接指出是哪个属性或哪个方法。
bool RequireNumber(id value, NSString* what, std::string* error);    // 有限的数，不含布尔
bool RequireInteger(id value, NSString* what, std::string* error);   // 上一条 + 没有小数部分
bool RequireBool(id value, NSString* what, std::string* error);      // 只认 true / false

// 取参失败时的返回值。能变成任何返回类型的「空值」；对返回 bool / BOOL 的
// 函数是 true——那些函数的约定是「返回真表示我认领了」，而这里确实认领了，
// 只是带着错误。
struct NacreFail {
  operator bool() const { return true; }
  template <class T> operator T() const { return T{}; }
};

// 用法：  view.alpha = NACRE_NUM(value, key);
//         [UIFont systemFontOfSize:NACRE_NUM(arg(0), sel)]
//
// 要求当前作用域里有 `std::string* error`。类型不对时**直接从所在的函数
// 返回**（GNU 的语句表达式里可以 return），所以后面那次原生调用根本不会
// 执行——不是「用 0 调一次再报错」。
//
// 这三个宏原来只在核心的内部头里，能力包拿不到，各自绕过去了（自己判类型、
// 自己调 NSJSONSerialization）。2026-11-16 搬到这里。
#define NACRE_NUM(v, what)                                                    \
  ({                                                                          \
    id _nv = (v);                                                             \
    if (!nacre_bridge::RequireNumber(_nv, (what), error))                     \
      return nacre_bridge::NacreFail();                                       \
    [_nv doubleValue];                                                        \
  })
#define NACRE_INT(v, what)                                                    \
  ({                                                                          \
    id _nv = (v);                                                             \
    if (!nacre_bridge::RequireInteger(_nv, (what), error))                    \
      return nacre_bridge::NacreFail();                                       \
    [_nv integerValue];                                                       \
  })
#define NACRE_BOOL(v, what)                                                   \
  ({                                                                          \
    id _nv = (v);                                                             \
    if (!nacre_bridge::RequireBool(_nv, (what), error))                       \
      return nacre_bridge::NacreFail();                                       \
    [_nv boolValue];                                                          \
  })

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

// 只要声明、不要定义的时候用（定义在别的 .mm 里）。同一个文件里先写了
// NACRE_ENUM_MAP 就不需要它
#define NACRE_ENUM_DECL(FuncName, Type)                 \
  BOOL FuncName##FromName(NSString* name, Type* out);   \
  NSString* NameFor##FuncName(Type value);              \
  NSString* NamesFor##FuncName(void);

/// 枚举写错时的报错文案，把可选值列全
std::string EnumError(NSString* what, id given, NSString* choices);
// ---- 能力域的注册 ----
//
// 分发链原来是一串写死的 if：每个能力域一个函数，按顺序问「认不认领」。
// 能力要能拆成独立的 framework，这串 if 就得变成运行时的表——核心不能再
// 认识 Keychain 这个名字。
//
// 注册在能力自己的 +load 里做：framework 被 embed 就一定会调到，宿主**不用
// 写任何代码**。这是交付模型里定过的一条——启动壳要设计成不需要被改的，
// 第三方原生 SDK 通过注册机制接进来。
//
// 注册表用函数内的静态局部变量，所以 +load 期间调用是安全的（它在第一次
// 用到时才构造）。注册顺序由链接顺序决定、不确定，但各能力域认的类互不
// 重叠，所以顺序自由——这一条和属性分发表拆开时的结论一样。
using NacreAsyncMethodHandler = bool (*)(id, const std::string&, const std::string&,
                                         const std::vector<void*>&, NacreAsyncDone);
using NacreClassObjectHandler = nacre::NativeObjectRef (*)(const std::string&,
                                                           const std::string&);
void NacreRegisterAsyncMethodHandler(NacreAsyncMethodHandler handler);
void NacreRegisterClassObjectHandler(NacreClassObjectHandler handler);

// ---- 能力自己的内置脚本 ----
//
// 能力的 JS 那一半（类定义、往 application 上挂的属性）放在它自己的包里：
// <能力>.framework/Builtin/parts/*.js，写法和核心的 part 一样——整个文件是
// 一个函数表达式 (function (ctx) { … })。
//
// 运行时在**核心的 part 全部跑完之后**依次执行它们，用的是同一个 ctx，所以
// 核心导出的东西（defineNativeClass、own、Application……）都拿得到。
//
// 传一个这个 framework 里的类当锚点，运行时用 bundleForClass: 找到包。传类
// 而不是 NSBundle，是为了 +load 里少做事。
void NacreRegisterBuiltinParts(Class anchor);

// ---- 方法调用的参数包 ----
// 标量在 values 里（JSON 解出来的，对象位是 null），对象按同样的下标在 ptrs 里。
struct NacreArgs {
  NSArray* values;
  const std::vector<void*>* ptrs;
  id value(NSUInteger i) const {
    return values != nil && i < values.count ? values[i] : nil;
  }
  id object(size_t i) const {
    return ptrs != nullptr && i < ptrs->size() ? (__bridge id)(*ptrs)[i] : nil;
  }
};

// ---- 一个域登记一张表 ----
//
// 接一组类（一个「域」）要做的事：写一个 .mm，把这个域在各条通道上的处理
// 函数填进一张 NacreDomain，在自己的 +load 里登记。**核心的分发器、内部头、
// NacreRuntime.mm 一个字都不用改**——这是为了让几组类可以同时接、互不冲突。
//
//     @interface NacreSwitchDomain : NSObject
//     @end
//     @implementation NacreSwitchDomain
//     + (void)load {
//       nacre_bridge::NacreDomain d;
//       d.name = "switch";
//       d.classes = {UISwitch.class};
//       d.read = ReadSwitchProperty;
//       d.write = WriteSwitchProperty;
//       d.construct = SwitchConstruct;
//       nacre_bridge::NacreRegisterDomain(d);
//     }
//     @end
//
// 每条通道的约定和核心里按域拆开的那些函数一样，都是「认不认领」：
//
//   read              返回 nil 表示不认识这个名字
//   write             返回 YES 表示处理了（写成了，或者填了 error）
//   readObject        class_name 为空表示不认识
//   readObjectArray   只管往 refs 里追加，没有「谁先认领」
//   其余返回 bool 的   返回 true 表示处理了（做成了，或者填了 error）
//
// 用不到的通道留空。分发器**先问登记进来的域，再走核心原来那串 if**。
//
// classes 是这个域的实例通道管哪些类：对象不是其中任何一个（或它们的子类），
// 这个域的实例通道根本不会被问到。给已有的类加成员也是把那个类列进来
// （手势域列了 UIView，因为 addGestureRecognizer: 是 UIView 的方法），认不认
// 那个名字由处理函数自己说。类级的三条通道（construct / classCall… /
// classObject）按类名分，不看 classes。
//
// 多个域都认同一个对象时，问的顺序是确定的：类的继承层数深的在前（子类先于
// 父类），一样深的按 name 排。和 +load 的先后无关。
// 订阅处理函数的回答。
//
//   NotMine       这个对象不归我管，去问下一个域
//   Handled       归我管，处理了：订上了、退订了，或者出错了（出错时填 error）
//   UnknownEvent  归我管，但这个事件名我不认识。不是出错：不认识的事件名当
//                 自定义事件（2026-11-17 定），JS 那边只登记监听器，不向原生
//                 订阅。回答这一种时不要填 error
//
// 原来「不认识」是填一句报错再返回 true，入口去认那句话。那句话早就不给用户
// 看了，却还参与流程，改了措辞行为就跟着变。
//
// 可以直接从 bool 得到前两种：return false 是 NotMine，return true 是 Handled
struct NacreSubscribed {
  enum Kind { NotMine, Handled, UnknownEvent };
  Kind kind;
  NacreSubscribed(bool handled) : kind(handled ? Handled : NotMine) {}
  NacreSubscribed(Kind k) : kind(k) {}
};

struct NacreDomain {
  const char* name = nullptr;
  std::vector<Class> classes;

  // 属性
  id (*read)(id object, NSString* key) = nullptr;
  BOOL (*write)(id object, NSString* key, id value, std::string* error) = nullptr;
  nacre::NativeObjectRef (*readObject)(id object, const std::string& name) = nullptr;
  bool (*writeObject)(id object, const std::string& name, id value,
                      std::string* error) = nullptr;
  void (*readObjectArray)(id object, const std::string& name,
                          std::vector<nacre::NativeObjectRef>& refs) = nullptr;
  bool (*writeObjectArray)(id object, const std::string& name,
                           const std::vector<void*>& values, std::string* error) = nullptr;

  // 方法。sel 是完整的 ObjC selector
  bool (*callVoid)(id object, const std::string& name) = nullptr;
  bool (*call)(id object, NSString* sel, const NacreArgs& args, std::string* out,
               std::string* error) = nullptr;
  bool (*callObject)(id object, NSString* sel, const NacreArgs& args,
                     nacre::NativeObjectRef* out, std::string* error) = nullptr;
  bool (*callObjectArray)(id object, NSString* sel, const NacreArgs& args,
                          std::vector<nacre::NativeObjectRef>* out,
                          std::string* error) = nullptr;
  bool (*callAsync)(id object, const std::string& name, const std::string& argsJSON,
                    const std::vector<void*>& argPtrs, NacreAsyncDone done) = nullptr;

  // 类级
  bool (*construct)(const std::string& className, const NacreArgs& args,
                    nacre::NativeObjectRef* out, std::string* error) = nullptr;
  bool (*classCall)(const std::string& className, NSString* sel, const NacreArgs& args,
                    std::string* out, std::string* error) = nullptr;
  bool (*classCallObject)(const std::string& className, NSString* sel,
                          const NacreArgs& args, nacre::NativeObjectRef* out,
                          std::string* error) = nullptr;
  nacre::NativeObjectRef (*classObject)(const std::string& className,
                                        const std::string& name) = nullptr;

  // 事件订阅。JS 侧某个事件名第一次有监听器时 on = YES，最后一个移走时 NO。
  // 回答三种之一，见 NacreSubscribed
  NacreSubscribed (*subscribe)(id object, NSString* type, BOOL on, std::string* error) = nullptr;
};
void NacreRegisterDomain(const NacreDomain& domain);

// ---- 事件出口 ----
// 「原生发生了什么，告诉 JS」。延后一轮派发，和核心里别的事件一致。
// className 是没有现成包装时用哪个 JS 类包这个对象。
// 三种负载：没有、一段 JSON 文本（事件对象上多出那几个字段）、一个原生对象。
void NacreEmitEvent(id object, const char* className, NSString* type);
void NacreEmitEventWithJSON(id object, const char* className, NSString* type,
                            NSString* json);
void NacreEmitEventWithObject(id object, const char* className, NSString* type,
                              id payload, const char* payloadClass);

// ---- 同步回调：系统问、JS 当场答 ----
//
// 上面三个 NacreEmitEvent… 是「通知」：系统不等答案，延后一轮派发。下面这
// 几个是系统**在等答案**时用的，当场进 JS、执行完才返回。只能在主线程调。
// 两种时机都可以：JS 没在跑时系统来问，或者 JS 正在调原生、原生回头问 JS。
//
// 判据是「系统是不是在等答案」：回调有返回值、或者系统在回调返回的那一刻
// 就要用结果，才用这里的；只是告诉你发生了一件事的，用上面的。
//
// 「要不要」类（返回布尔的 should… 委托方法）：当场派发一个**可取消**的
// 事件，返回值是监听器有没有调 preventDefault()。没有监听器、监听器抛了、
// 引擎不在了，都返回 NO——也就是按「要」处理，默认行为照常发生。
// json 是事件带的字段（一个 JSON 对象的文本），没有就传 nil。
BOOL NacreEmitEventSync(id object, const char* className, NSString* type,
                        NSString* json);

// 「当场执行的一段代码」类（UIKit 收一个 block、在调用里面就执行它）：
// JS 侧把那段代码登记成一个号（内置脚本的 callWithBlock / registerBlock），
// 连同别的参数一起传过来，原生在 block 里调这个。argsJSON 是参数数组的
// JSON 文本，没有参数传 @"[]"。
void NacreCallBlock(NSInteger blockId, NSString* argsJSON);
// 同一个东西，但延后一轮再调。用于「做完了通知一声」的 completion：系统
// 不等答案，和别的通知一样不该在 UIKit 的调用中途进 JS。
void NacreCallBlockLater(NSInteger blockId, NSString* argsJSON);

// ---- 委托的槽位：几方共用一个 delegate ----
//
// UIKit 的对象只有一个 delegate 属性，而一个对象上可能有几方各要实现一部分
// 委托方法：UICollectionView.delegate 同时是 UIScrollView 的 delegate，滚动
// 事件的 trampoline 在核心里，列表的事件在列表那个域里。直接写
// `object.delegate = mine` 会把先来的挤掉。
//
// 这两个函数让各方把自己的那个对象「加进」槽位：槽位里实际放的是一个转发
// 对象，系统问某个方法时，转给第一个实现了它的那一方。各方实现的方法不要
// 重叠（重叠时先加的赢）。一方都不剩时 delegate 清成 nil。
//
// object 要有 delegate 属性（setDelegate:）。part 由这里强持有，直到移除或者
// object 释放。每次增减之后 delegate 会被重新设一遍：UIKit 在设委托的那一刻
// 记下它实现了哪些方法，不重设的话新加的那一方收不到。
void NacreAddDelegatePart(id object, id part);
void NacreRemoveDelegatePart(id object, id part);

}  // namespace nacre_bridge
