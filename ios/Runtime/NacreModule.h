// 原生模块：把你自己的原生代码接进来，给 JS 调。
//
// 这是**公开**的头（在 umbrella header Nacre.h 里），纯 ObjC，Swift 也能用
// （import Nacre）。一个模块有一个名字，下面挂三样东西：
//
//   同步方法   JS 里 module.call('name', ...args)，当场拿到返回值
//   异步方法   JS 里 module.callAsync('name', ...args)，是一个 Promise
//   事件       JS 里 module.addEventListener('type', listener)
//
// JS 那一侧的入口是 application.nativeModules.get('模块名')。
//
// ---- 值 ----
//
// 参数、返回值、事件带的数据，都是下面这几种，可以互相嵌套：
//
//   JS                      原生
//   null / undefined        NSNull（顶层的返回值也可以直接给 nil）
//   true / false            NSNumber（布尔。和数分开，见 +isBoolean:）
//   数                      NSNumber
//   字符串                  NSString
//   数组                    NSArray
//   对象                    NSDictionary（键是 NSString）
//   ArrayBuffer             NSData
//
// 别的东西（NSDate、NSURL、自己的类……）过不去：返回了这样的值，JS 那边得到
// 一个 TypeError，不会被悄悄换成别的。先自己转成上面这几种。
//
// ---- 线程 ----
//
// 方法的处理函数**一律在主线程上被调用**（JS 就在主线程）。同步方法执行期间
// JS 和界面都在等，所以它要快；耗时的活做成异步方法，在处理函数里自己派到
// 后台，做完调 resolve / reject——这两个回调和 -emitEvent:detail: 可以在
// 任何线程调。
//
// ---- 登记 ----
//
// ObjC：在 framework 里随便哪个类的 +load 里登记。framework 嵌进 App 就会
// 走到，宿主不用写代码。
//
//     @implementation RiskModuleLoader
//     + (void)load {
//       NacreModule *module = [[NacreModule alloc] initWithName:@"risk"];
//       [module addMethod:@"deviceToken" handler:^id(NSArray *arguments) {
//         return RiskSDK.shared.deviceToken ?: [NSNull null];
//       }];
//       [NacreModule registerModule:module];
//     }
//     @end
//
// Swift 没有 +load，走另一条路：写一个遵守 NacreModuleProvider 的类，把它
// 设成 framework 的主类（Info.plist 的 NSPrincipalClass；让 Xcode 生成
// Info.plist 的话是构建设置 INFOPLIST_KEY_NSPrincipalClass）。运行时在 JS
// 第一次用到 application.nativeModules 时找到它、登记它给的模块。
//
//     @objc(RiskModuleProvider)
//     final class RiskModuleProvider: NSObject, NacreModuleProvider {
//       static func nacreModules() -> [NacreModule] {
//         let module = NacreModule(name: "risk")
//         module.addMethod("deviceToken") { _ in RiskSDK.shared.deviceToken }
//         return [module]
//       }
//     }
//
// 完整的写法见 docs/guides/native-modules.md。
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// +errorWithName:message: 造出来的错误用的域。
FOUNDATION_EXPORT NSErrorDomain const NacreModuleErrorDomain;
/// 错误的 userInfo 里的键：JS 那边 Error 的 name。值是 NSString。
FOUNDATION_EXPORT NSErrorUserInfoKey const NacreModuleErrorNameKey;

/// 同步方法的处理函数。在主线程上被调用。
///
/// 返回值交给 JS；返回 nil 或 NSNull，JS 得到 null。**要报错就返回一个
/// NSError**（用 +errorWithName:message: 造，或者别处来的 NSError 原样返回），
/// JS 那边 call() 会把它抛出来。
typedef id _Nullable (^NacreModuleMethod)(NSArray *arguments);

/// 异步方法用来交结果的回调。可以在任何线程调。
typedef void (^NacreModuleResolve)(id _Nullable value);
/// 异步方法用来报错的回调。可以在任何线程调。
typedef void (^NacreModuleReject)(NSError *error);

/// 异步方法的处理函数。在主线程上被调用，要尽快返回：耗时的活自己派到后台。
///
/// resolve 和 reject 两个里**只调一个、只调一次**。调第二次会被忽略，并打
/// 一条运行时警告。两个都没调就把它们放掉了，JS 那边的 Promise 会被拒绝
/// （不会永远挂着）。
typedef void (^NacreModuleAsyncMethod)(NSArray *arguments, NacreModuleResolve resolve,
                                       NacreModuleReject reject);

/// 一个原生模块：一个名字，下面挂方法和事件。
///
/// 先建出来、加好方法和事件，再登记。**登记之后不能再加**（加了会被忽略，
/// 并打一条运行时警告）；发事件是登记之后才做的事。
@interface NacreModule : NSObject

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

/// name 是 JS 里 application.nativeModules.get(name) 用的名字，不能是空串。
/// 整个 App 里要唯一，所以别起太泛的名字：带上你的包名或产品名。
- (instancetype)initWithName:(NSString *)name NS_DESIGNATED_INITIALIZER;

@property(nonatomic, readonly, copy) NSString *name;
/// 登记成功了没有。
@property(nonatomic, readonly, getter=isRegistered) BOOL registered;

/// 加一个同步方法。同一个模块里方法名不能重复（同步和异步算在一起）。
- (void)addMethod:(NSString *)name
          handler:(NacreModuleMethod)handler NS_SWIFT_NAME(addMethod(_:handler:));

/// 加一个异步方法。JS 那边是一个 Promise。
- (void)addAsyncMethod:(NSString *)name
               handler:(NacreModuleAsyncMethod)handler NS_SWIFT_NAME(addAsyncMethod(_:handler:));

/// 声明这个模块会发的一个事件。没声明过的事件名，JS 那边监听时会报错，
/// 原生这边发了也会被丢掉——名字打错了两头都有报错，不会悄悄收不到。
/// 名字不能是空串，不能以 @ 开头。
- (void)addEvent:(NSString *)type NS_SWIFT_NAME(addEvent(_:));

/// 发一个事件。可以在任何线程调。JS 那边延后一轮收到，事件对象的 detail
/// 是这里给的 detail（nil 就是 null）。
///
/// 同一个线程上先后发的事件，JS 按同样的先后收到。JS 那边没有人监听这个
/// 事件时什么都不做，不攒着。
- (void)emitEvent:(NSString *)type
           detail:(nullable id)detail NS_SWIFT_NAME(emit(_:detail:));

/// 登记一个模块，从这以后 JS 里拿得到它。可以在任何线程调。
///
/// 返回 NO 表示没登记上：这个名字已经被别的模块占了（先登记的留着，不覆盖），
/// 或者这个模块已经登记过。同时打一条运行时警告。
+ (BOOL)registerModule:(NacreModule *)module NS_SWIFT_NAME(register(_:));

/// 造一个错误。JS 那边是一个 Error，name 和 message 是这里给的；name 是
/// "TypeError" 或 "RangeError" 时是对应的那个类的实例。
+ (NSError *)errorWithName:(NSString *)name
                   message:(NSString *)message NS_SWIFT_NAME(error(name:message:));
/// 同上，外加一个数字的 code（JS 那边 error.code）。
+ (NSError *)errorWithName:(NSString *)name
                   message:(NSString *)message
                      code:(NSInteger)code NS_SWIFT_NAME(error(name:message:code:));

/// JS 给的这个值是不是布尔（true / false）。
///
/// 布尔和数到了原生都是 NSNumber，-boolValue 对 1 和 true 都给 YES；Swift
/// 里 `value as? Bool` 对 0 和 1 也会成功。要分清就用这个。
+ (BOOL)isBoolean:(nullable id)value;

@end

/// Swift 写的模块用它登记（ObjC 也可以用，不是非用 +load 不可）。
///
/// 写一个遵守它的类，设成 framework 的主类（NSPrincipalClass）。运行时在
/// JS 第一次用到 application.nativeModules 时，挨个看嵌在 App 里的
/// framework 的主类，遵守这个协议的就调一次 +nacreModules，把返回的模块
/// 登记上。在主线程上调，每个类只调一次。
@protocol NacreModuleProvider <NSObject>
+ (NSArray<NacreModule *> *)nacreModules;
@end

NS_ASSUME_NONNULL_END
