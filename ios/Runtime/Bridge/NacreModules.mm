// 原生模块：App 团队和第三方把自己的原生代码接进来的那一层。
//
// 对外的接口是公开的 NacreModule.h（纯 ObjC，Swift 也能用）：一个模块一个
// 名字，下面挂同步方法、异步方法、事件。这个文件是它的实现，外加把它接到
// 桥上的那一段。
//
// **它不是一条新的过桥通道。** 对桥来说这里只是又一个域：一个原生对象
// （NacreModuleHub，JS 那边是 application.nativeModules），认领 call、
// callAsync、classObject 三条通道和一个内部事件。所有模块的调用都经过这
// 一个对象，模块名和方法名是参数。所以核心的分发器、引擎、NacreRuntime.mm
// 一个字都没改。
//
// 值怎么过桥：参数、返回值、事件带的数据都是 JSON 文本。二进制（NSData）
// JSON 表示不了，所以拆成两份——树里那个位置留 null，另外一张表记「哪个
// 位置、base64 的内容」。两个方向用同一种写法，JS 那一半在
// Builtin/parts/28-native-modules.js。
#import "NacreBridge.h"

#import "../NacreModule.h"

#import <objc/runtime.h>
#import <os/lock.h>

#include <atomic>

NSErrorDomain const NacreModuleErrorDomain = @"NacreModuleErrorDomain";
NSErrorUserInfoKey const NacreModuleErrorNameKey = @"NacreModuleErrorName";
// +errorWithName:message:code: 造的错误才带 code；不带 code 的那个初始化方法
// 造出来的，JS 那边没有 code 这个属性
static NSString* const kNacreModuleErrorHasCodeKey = @"NacreModuleErrorHasCode";

// 一个方法：处理函数，和它是同步的还是异步的
@interface NacreModuleMethodEntry : NSObject
@property(nonatomic) BOOL isAsync;
@property(nonatomic, copy) id handler;
@end

@implementation NacreModuleMethodEntry
@end

@interface NacreModule () {
 @public
  NSMutableDictionary<NSString*, NacreModuleMethodEntry*>* _methods;
  NSMutableSet<NSString*>* _events;
  std::atomic<bool> _registered;
}
@end

// JS 那边 application.nativeModules 包着的原生对象。只有一个。
//
// listening 记的是 JS 现在在听哪些事件（"模块名\n事件名"）：没人听的事件不
// 过桥。只在主线程上读写——写它的是 JS 的调用，读它的是发事件那一段在主
// 线程上的那一半。
@interface NacreModuleHub : NSObject
@property(nonatomic, strong) NSMutableSet<NSString*>* listening;
+ (instancetype)shared;
@end

@implementation NacreModuleHub
+ (instancetype)shared {
  static NacreModuleHub* hub;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    hub = [NacreModuleHub new];
    hub.listening = [NSMutableSet set];
  });
  return hub;
}
@end

namespace nacre_bridge {
namespace {

// ---- 登记表 ----
//
// 登记可以在任何线程、任何时候发生（+load 里、Swift 的 provider 被找到时、
// 宿主自己调），所以用一把锁。表本身是函数里的静态局部变量：+load 比文件级
// 全局对象的构造早（见 NacreRegistry.mm 开头那一段）。锁是常量初始化的，
// 没有这个问题
os_unfair_lock gModulesLock = OS_UNFAIR_LOCK_INIT;

NSMutableDictionary<NSString*, NacreModule*>* Modules() {
  static NSMutableDictionary<NSString*, NacreModule*>* table = [NSMutableDictionary dictionary];
  return table;
}

NacreModule* FindModule(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  os_unfair_lock_lock(&gModulesLock);
  NacreModule* module = Modules()[name];
  os_unfair_lock_unlock(&gModulesLock);
  return module;
}

NSArray<NSString*>* ModuleNames() {
  os_unfair_lock_lock(&gModulesLock);
  NSArray<NSString*>* names = Modules().allKeys;
  os_unfair_lock_unlock(&gModulesLock);
  return [names sortedArrayUsingSelector:@selector(compare:)];
}

void Warn(NSString* text) {
  WriteRuntimeLog([@"native module warning: " stringByAppendingString:text]);
}

// 同一句警告只打一次。发事件那几处用：事件可能每帧都发
void WarnOnce(NSString* text) {
  static NSMutableSet<NSString*>* seen = [NSMutableSet set];
  static os_unfair_lock lock = OS_UNFAIR_LOCK_INIT;
  os_unfair_lock_lock(&lock);
  const bool first = ![seen containsObject:text];
  if (first) [seen addObject:text];
  os_unfair_lock_unlock(&lock);
  if (first) Warn(text);
}

// ---- Swift 写的模块：找 framework 的主类 ----
//
// Swift 没有 +load，没法「一被加载就登记」。约定是：模块的 framework 把主类
// （Info.plist 的 NSPrincipalClass）设成一个遵守 NacreModuleProvider 的类。
// JS 第一次用到 application.nativeModules 时到这里，把嵌在 App 里的
// framework 挨个看一遍。
//
// 只看 App 自己 Frameworks 目录下的，不扫进程里所有的类：那个目录里就是
// 核心、能力包和模块这几个，每个读一次 Info.plist。按文件名排序，所以每次
// 启动找到的先后一样。
bool ConformsToProvider(Class cls) {
  Protocol* provider = @protocol(NacreModuleProvider);
  for (Class c = cls; c != Nil; c = class_getSuperclass(c)) {
    if (class_conformsToProtocol(c, provider)) return true;
  }
  return false;
}

void LoadProviders() {
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSURL* directory = NSBundle.mainBundle.privateFrameworksURL;
    if (directory == nil) return;
    NSArray<NSURL*>* found =
        [NSFileManager.defaultManager contentsOfDirectoryAtURL:directory
                                    includingPropertiesForKeys:nil
                                                       options:NSDirectoryEnumerationSkipsHiddenFiles
                                                         error:nil];
    found = [found sortedArrayUsingComparator:^NSComparisonResult(NSURL* a, NSURL* b) {
      return [a.lastPathComponent compare:b.lastPathComponent];
    }];
    for (NSURL* url in found) {
      if (![url.pathExtension isEqualToString:@"framework"]) continue;
      NSBundle* bundle = [NSBundle bundleWithURL:url];
      NSString* className = [bundle objectForInfoDictionaryKey:@"NSPrincipalClass"];
      if (![className isKindOfClass:NSString.class] || className.length == 0) continue;
      // 主类不是给我们用的（别的 framework 有自己的主类）就跳过，不算错
      Class cls = NSClassFromString(className);
      if (cls == Nil || !ConformsToProvider(cls)) continue;
      if (class_getClassMethod(cls, @selector(nacreModules)) == nullptr) continue;
      NSArray* modules = nil;
      @try {
        modules = [(Class<NacreModuleProvider>)cls nacreModules];
      } @catch (NSException* e) {
        Warn([NSString stringWithFormat:@"+[%@ nacreModules] raised %@: %@", className, e.name,
                                        e.reason ?: @"(no reason)"]);
        continue;
      }
      if (![modules isKindOfClass:NSArray.class]) continue;
      for (id module in modules) {
        if ([module isKindOfClass:NacreModule.class]) [NacreModule registerModule:module];
      }
    }
  });
}

// ---- 值：原生 → JS ----

bool IsBooleanNumber(id given) {
  return [given isKindOfClass:NSNumber.class] &&
         CFGetTypeID((__bridge CFTypeRef)given) == CFBooleanGetTypeID();
}

// 报错里用的位置：[0].items[2]
NSString* DescribePath(NSArray* path) {
  if (path.count == 0) return @"the value itself";
  NSMutableString* text = [NSMutableString string];
  for (id step in path) {
    if ([step isKindOfClass:NSNumber.class]) [text appendFormat:@"[%@]", step];
    else if (text.length == 0) [text appendFormat:@"%@", step];
    else [text appendFormat:@".%@", step];
  }
  return text;
}

// 嵌套太深多半是原生那边的容器自己套了自己。JSON 那一侧也有深度上限
const int kMaxDepth = 256;

// 把一个原生的值变成能直接编成 JSON 的树。NSData 的位置留 NSNull，另外往
// bytes 里记一条 [位置, base64]。有过不了桥的东西时返回 nil，*problem 说明
// 是哪个位置的什么——**不替换、不丢弃**：悄悄变成 null 的值最难查。
id Outgoing(id given, NSMutableArray* path, NSMutableArray* bytes,
            NSString* __autoreleasing* problem) {
  if (given == nil || given == NSNull.null) return NSNull.null;
  if (path.count > kMaxDepth) {
    *problem = @"nested more than 256 levels deep (does a container contain itself?)";
    return nil;
  }
  if ([given isKindOfClass:NSString.class]) {
    // 落单的代理项编不成 UTF-8，也就编不成 JSON
    if (![given canBeConvertedToEncoding:NSUTF8StringEncoding]) {
      *problem = [NSString stringWithFormat:@"a string with an unpaired surrogate at %@",
                                            DescribePath(path)];
      return nil;
    }
    return given;
  }
  if ([given isKindOfClass:NSNumber.class]) {
    if (!IsBooleanNumber(given) && !isfinite([(NSNumber*)given doubleValue])) {
      *problem = [NSString stringWithFormat:@"a number that is not finite at %@",
                                            DescribePath(path)];
      return nil;
    }
    return given;
  }
  if ([given isKindOfClass:NSData.class]) {
    [bytes addObject:@[[path copy], [(NSData*)given base64EncodedStringWithOptions:0]]];
    return NSNull.null;
  }
  if ([given isKindOfClass:NSArray.class]) {
    NSArray* list = given;
    NSMutableArray* out = [NSMutableArray arrayWithCapacity:list.count];
    for (NSUInteger i = 0; i < list.count; i++) {
      [path addObject:@(i)];
      id item = Outgoing(list[i], path, bytes, problem);
      [path removeLastObject];
      if (item == nil) return nil;
      [out addObject:item];
    }
    return out;
  }
  if ([given isKindOfClass:NSDictionary.class]) {
    NSDictionary* map = given;
    NSMutableDictionary* out = [NSMutableDictionary dictionaryWithCapacity:map.count];
    for (id key in map) {
      if (![key isKindOfClass:NSString.class]) {
        *problem = [NSString stringWithFormat:@"a dictionary key that is not a string (%@) at %@",
                                              NSStringFromClass([key class]), DescribePath(path)];
        return nil;
      }
      if (![key canBeConvertedToEncoding:NSUTF8StringEncoding]) {
        *problem = [NSString stringWithFormat:@"a dictionary key with an unpaired surrogate at %@",
                                              DescribePath(path)];
        return nil;
      }
      [path addObject:key];
      id item = Outgoing(map[key], path, bytes, problem);
      [path removeLastObject];
      if (item == nil) return nil;
      out[key] = item;
    }
    return out;
  }
  *problem = [NSString stringWithFormat:@"%@ at %@", NSStringFromClass([given class]),
                                        DescribePath(path)];
  return nil;
}

// ---- 值：JS → 原生 ----

// 把树里 path 指的那个位置换成 replacement。树是 NSJSONSerialization 解出来
// 的不可变容器，所以沿路各复制一层
id ReplaceAtPath(id node, NSArray* path, NSUInteger depth, id replacement) {
  if (depth == path.count) return replacement;
  id step = path[depth];
  if ([node isKindOfClass:NSArray.class] && [step isKindOfClass:NSNumber.class]) {
    const NSUInteger index = [(NSNumber*)step unsignedIntegerValue];
    if (index >= [(NSArray*)node count]) return node;
    NSMutableArray* copy = [node mutableCopy];
    copy[index] = ReplaceAtPath(copy[index], path, depth + 1, replacement);
    return copy;
  }
  if ([node isKindOfClass:NSDictionary.class] && [step isKindOfClass:NSString.class]) {
    if ([(NSDictionary*)node objectForKey:step] == nil) return node;
    NSMutableDictionary* copy = [node mutableCopy];
    copy[step] = ReplaceAtPath(copy[step], path, depth + 1, replacement);
    return copy;
  }
  return node;
}

// JS 给的参数：tree 是参数数组（二进制的位置是 null），bytes 是那张
// [位置, base64] 的表。拼回一个 NSArray，二进制的位置上是 NSData
NSArray* IncomingArguments(id tree, id bytes) {
  id arguments = [tree isKindOfClass:NSArray.class] ? tree : @[];
  if ([bytes isKindOfClass:NSArray.class]) {
    for (id entry in (NSArray*)bytes) {
      if (![entry isKindOfClass:NSArray.class] || [(NSArray*)entry count] != 2) continue;
      id path = entry[0];
      id text = entry[1];
      if (![path isKindOfClass:NSArray.class] || ![text isKindOfClass:NSString.class]) continue;
      NSData* data = [[NSData alloc] initWithBase64EncodedString:text options:0];
      arguments = ReplaceAtPath(arguments, path, 0, data ?: [NSData data]);
    }
  }
  return arguments;
}

// ---- 结果的信封 ----
//
// 同步调用的返回、异步调用的兑现，交给 JS 的都是这同一种对象：
//   { ok: true,  value: 树, bytes?: [[位置, base64], …] }
//   { ok: false, error: { name, message, code?, domain? } }
// 报错不走通道自己的报错出口（那个只会变成 TypeError，带不了 name 和 code），
// 由 JS 那一半照着这份数据造 Error

NSDictionary* Failure(NSString* name, NSString* message) {
  return @{@"ok": @NO, @"error": @{@"name": name ?: @"Error", @"message": message ?: @""}};
}

// 一个 NSError 在 JS 那边长什么样。
//   +errorWithName:message:(code:) 造的：name、message，给了 code 才有 code
//   别处来的 NSError（第三方 SDK 给的）：name 是 Error，message 是
//   localizedDescription，code 和 domain 原样带上——不丢事实
NSDictionary* DescribeError(id given) {
  if (![given isKindOfClass:NSError.class]) {
    return @{@"name": @"Error", @"message": @"the native module reported an error without details"};
  }
  NSError* error = given;
  NSMutableDictionary* info = [NSMutableDictionary dictionary];
  id name = error.userInfo[NacreModuleErrorNameKey];
  info[@"name"] = [name isKindOfClass:NSString.class] && [name length] > 0 ? name : @"Error";
  NSString* message = error.localizedDescription ?: @"";
  info[@"message"] = [message canBeConvertedToEncoding:NSUTF8StringEncoding] ? message : @"";
  const bool ours = [error.domain isEqualToString:NacreModuleErrorDomain];
  if (!ours) {
    info[@"code"] = @(error.code);
    info[@"domain"] = error.domain ?: @"";
  } else if ([error.userInfo[kNacreModuleErrorHasCodeKey] isEqual:@YES]) {
    info[@"code"] = @(error.code);
  }
  return info;
}

// label 是报错里用的「哪个模块的哪个方法」
NSDictionary* Success(id result, NSString* label) {
  NSMutableArray* bytes = [NSMutableArray array];
  NSString* problem = nil;
  id tree = Outgoing(result, [NSMutableArray array], bytes, &problem);
  if (tree == nil) {
    return Failure(@"TypeError",
                   [NSString stringWithFormat:@"%@ returned a value that cannot be passed to "
                                              @"JavaScript: %@. Only null, booleans, numbers, "
                                              @"strings, arrays, dictionaries and NSData can cross",
                                              label, problem]);
  }
  return bytes.count > 0 ? @{@"ok": @YES, @"value": tree, @"bytes": bytes}
                         : @{@"ok": @YES, @"value": tree};
}

NSString* Label(NSString* module, NSString* method) {
  return [NSString stringWithFormat:@"native module \"%@\" method \"%@\"", module, method];
}

// 找到要调的那个方法。找不到、或者同步异步用反了，返回 nil 并把报错放进
// *failure。JS 那一半在过桥之前已经查过一遍，正常走不到这些报错；留着是
// 因为那一半手里的方法表是 get() 时抄的一份
NacreModuleMethodEntry* FindMethod(NSString* moduleName, NSString* methodName, bool wantAsync,
                                   NSDictionary* __autoreleasing* failure) {
  NacreModule* module = FindModule(moduleName);
  if (module == nil) {
    *failure = Failure(@"TypeError",
                       [NSString stringWithFormat:@"no native module named \"%@\"", moduleName]);
    return nil;
  }
  NacreModuleMethodEntry* entry =
      [methodName isKindOfClass:NSString.class] ? module->_methods[methodName] : nil;
  if (entry == nil) {
    *failure = Failure(@"TypeError",
                       [NSString stringWithFormat:@"native module \"%@\" has no method \"%@\"",
                                                  moduleName, methodName]);
    return nil;
  }
  if (entry.isAsync != wantAsync) {
    *failure = Failure(@"TypeError",
                       [NSString stringWithFormat:@"\"%@\" is %@ method of native module \"%@\"; "
                                                  @"use %@ instead",
                                                  methodName,
                                                  entry.isAsync ? @"an async" : @"a sync",
                                                  moduleName,
                                                  entry.isAsync ? @"callAsync()" : @"call()"]);
    return nil;
  }
  return entry;
}

NSDictionary* ExceptionFailure(NSString* label, NSException* e) {
  Warn([NSString stringWithFormat:@"%@ raised %@: %@", label, e.name, e.reason ?: @"(no reason)"]);
  return Failure(e.name ?: @"Error", e.reason ?: @"the native module raised an exception");
}

// 同步调用。当场执行处理函数（这里就是主线程：JS 在主线程上调过来的）
NSDictionary* InvokeSync(NSString* moduleName, NSString* methodName, id tree, id bytes) {
  NSDictionary* failure = nil;
  NacreModuleMethodEntry* entry = FindMethod(moduleName, methodName, false, &failure);
  if (entry == nil) return failure;
  NSString* label = Label(moduleName, methodName);
  NSArray* arguments = IncomingArguments(tree, bytes);
  id result = nil;
  @try {
    result = ((NacreModuleMethod)entry.handler)(arguments);
  } @catch (NSException* e) {
    return ExceptionFailure(label, e);
  }
  // 返回一个 NSError 就是报错
  if ([result isKindOfClass:NSError.class]) return @{@"ok": @NO, @"error": DescribeError(result)};
  return Success(result, label);
}

}  // namespace
}  // namespace nacre_bridge

// 一次异步调用的结局。resolve 和 reject 两个 block 共用一个它。
//
// 三件事归它管：只认第一次（后面的忽略并打警告）；把结果交给通道的 done
// （done 可以在任何线程调，回主线程兑现是 NacreRuntime 那边的事）；两个
// block 都被放掉了还没人调过——在这里把 Promise 拒掉，不让它永远挂着。
@interface NacreModuleSettler : NSObject
- (instancetype)initWithLabel:(NSString*)label done:(NacreAsyncDone)done;
- (void)resolve:(id)value;
- (void)reject:(id)error;
- (void)fail:(NSDictionary*)failure;
@end

@implementation NacreModuleSettler {
  std::atomic<bool> _settled;
  NacreAsyncDone _done;
  NSString* _label;
}

- (instancetype)initWithLabel:(NSString*)label done:(NacreAsyncDone)done {
  if ((self = [super init])) {
    _label = [label copy];
    _done = [done copy];
    _settled = false;
  }
  return self;
}

- (BOOL)claim:(NSString*)what {
  if (!_settled.exchange(true)) return YES;
  nacre_bridge::Warn([NSString stringWithFormat:
      @"%@: %@ was called after the call had already been settled; ignored", _label, what]);
  return NO;
}

- (void)send:(NSDictionary*)envelope {
  NacreAsyncResult* result = [NacreAsyncResult new];
  result.json = envelope;
  _done(result);
}

- (void)resolve:(id)value {
  if (![self claim:@"resolve"]) return;
  // 直接交回一块二进制：走通道的字节那条路，不经过 base64。JS 拿到的
  // ArrayBuffer 是可写的，所以交过去的必须是一块只属于它的内存——把字节拷到
  // 新的 NSData 里。copy 不够：不可变的 NSData 被 copy 时返回的是它自己，模块
  // 要是还留着那份数据（缓存、常量），JS 一改就改到了模块手里的，同一份交两次
  // 的话两个 ArrayBuffer 还会互相影响。
  // 空的走下面那条（零长度的内存没有地址可交）
  if ([value isKindOfClass:NSData.class] && [(NSData*)value length] > 0) {
    NSData* given = value;
    NacreAsyncResult* result = [NacreAsyncResult new];
    result.bytes = [[NSData alloc] initWithBytes:given.bytes length:given.length];
    _done(result);
    return;
  }
  [self send:nacre_bridge::Success(value, _label)];
}

- (void)reject:(id)error {
  if (![self claim:@"reject"]) return;
  [self send:@{@"ok": @NO, @"error": nacre_bridge::DescribeError(error)}];
}

- (void)fail:(NSDictionary*)failure {
  if (_settled.exchange(true)) return;
  [self send:failure];
}

- (void)dealloc {
  if (_settled.exchange(true)) return;
  nacre_bridge::Warn([NSString stringWithFormat:
      @"%@ released both callbacks without calling resolve or reject; the promise was rejected",
      _label]);
  [self send:nacre_bridge::Failure(
      @"Error", [NSString stringWithFormat:
          @"%@ finished without calling resolve or reject", _label])];
}

@end

@implementation NacreModule

- (instancetype)initWithName:(NSString*)name {
  if ((self = [super init])) {
    _name = [name isKindOfClass:NSString.class] ? [name copy] : @"";
    _methods = [NSMutableDictionary dictionary];
    _events = [NSMutableSet set];
    _registered = false;
  }
  return self;
}

- (BOOL)isRegistered {
  return _registered.load() ? YES : NO;
}

// 加方法、加事件都只能在登记之前：JS 那边 get() 时把方法表抄走了，之后再
// 加的它看不到。忽略并打警告，不半生效
- (BOOL)canAdd:(NSString*)what named:(id)name {
  if (_registered.load()) {
    nacre_bridge::Warn([NSString stringWithFormat:
        @"module \"%@\" is already registered; %@ \"%@\" was ignored (add everything before "
        @"registering)", _name, what, name]);
    return NO;
  }
  if (![name isKindOfClass:NSString.class] || [name length] == 0) {
    nacre_bridge::Warn([NSString stringWithFormat:
        @"module \"%@\": a %@ needs a non-empty name; ignored", _name, what]);
    return NO;
  }
  return YES;
}

- (void)add:(NSString*)name handler:(id)handler async:(BOOL)isAsync {
  if (![self canAdd:@"method" named:name]) return;
  if (handler == nil) {
    nacre_bridge::Warn([NSString stringWithFormat:
        @"module \"%@\": method \"%@\" has no handler; ignored", _name, name]);
    return;
  }
  if (_methods[name] != nil) {
    nacre_bridge::Warn([NSString stringWithFormat:
        @"module \"%@\" already has a method \"%@\"; the second one was ignored", _name, name]);
    return;
  }
  NacreModuleMethodEntry* entry = [NacreModuleMethodEntry new];
  entry.isAsync = isAsync;
  entry.handler = handler;
  _methods[name] = entry;
}

- (void)addMethod:(NSString*)name handler:(NacreModuleMethod)handler {
  [self add:name handler:handler async:NO];
}

- (void)addAsyncMethod:(NSString*)name handler:(NacreModuleAsyncMethod)handler {
  [self add:name handler:handler async:YES];
}

- (void)addEvent:(NSString*)type {
  if (![self canAdd:@"event" named:type]) return;
  if ([type hasPrefix:@"@"]) {
    nacre_bridge::Warn([NSString stringWithFormat:
        @"module \"%@\": event names starting with @ are reserved for the runtime; \"%@\" was "
        @"ignored", _name, type]);
    return;
  }
  [_events addObject:type];
}

- (void)emitEvent:(NSString*)type detail:(id)detail {
  if (![type isKindOfClass:NSString.class]) return;
  if (!_registered.load()) {
    nacre_bridge::WarnOnce([NSString stringWithFormat:
        @"module \"%@\" emitted \"%@\" before it was registered; dropped", _name, type]);
    return;
  }
  if (![_events containsObject:type]) {
    nacre_bridge::WarnOnce([NSString stringWithFormat:
        @"module \"%@\" emitted \"%@\", which it never declared with addEvent; dropped",
        _name, type]);
    return;
  }
  // 数据在调用的这个线程上就编好：detail 可能是可变的容器，回头再读就不是
  // 发的那一刻的样子了
  NSMutableArray* bytes = [NSMutableArray array];
  NSString* problem = nil;
  id tree = nacre_bridge::Outgoing(detail, [NSMutableArray array], bytes, &problem);
  if (tree == nil) {
    nacre_bridge::Warn([NSString stringWithFormat:
        @"module \"%@\" emitted \"%@\" with a detail that cannot be passed to JavaScript (%@); "
        @"the event was dropped", _name, type, problem]);
    return;
  }
  NSMutableDictionary* payload =
      [@{@"module": _name, @"type": type, @"detail": tree} mutableCopy];
  if (bytes.count > 0) payload[@"bytes"] = bytes;
  std::string encoded = nacre_bridge::EncodeJSON(payload);
  NSString* json = [[NSString alloc] initWithBytes:encoded.data()
                                            length:encoded.size()
                                          encoding:NSUTF8StringEncoding];
  NSString* key = [NSString stringWithFormat:@"%@\n%@", _name, type];
  dispatch_block_t deliver = ^{
    NacreModuleHub* hub = NacreModuleHub.shared;
    // 没人听就不过桥
    if (![hub.listening containsObject:key]) return;
    // @ 开头的是内部事件：不派发给 hub 的监听器，交给 part 里登记的处理函数，
    // 由它转给对应的模块对象。出口本身延后一轮
    nacre_bridge::NacreEmitEventWithJSON(hub, "NativeModules", @"@nativemodule", json);
  };
  // 已经在主线程上就不再绕一圈：同一个线程上发的事件要保持先后
  if (NSThread.isMainThread) deliver();
  else dispatch_async(dispatch_get_main_queue(), deliver);
}

+ (BOOL)registerModule:(NacreModule*)module {
  if (![module isKindOfClass:NacreModule.class]) return NO;
  if (module.name.length == 0) {
    nacre_bridge::Warn(@"a module needs a non-empty name; it was not registered");
    return NO;
  }
  NSString* problem = nil;
  os_unfair_lock_lock(&nacre_bridge::gModulesLock);
  NSMutableDictionary<NSString*, NacreModule*>* table = nacre_bridge::Modules();
  if (module->_registered.load()) {
    problem = [NSString stringWithFormat:@"module \"%@\" is already registered", module.name];
  } else if (table[module.name] != nil) {
    // 先登记的留着，不覆盖：谁覆盖谁取决于加载的先后，那个先后不确定
    problem = [NSString stringWithFormat:
        @"a module named \"%@\" is already registered; the second one was not registered",
        module.name];
  } else {
    table[module.name] = module;
    module->_registered = true;
  }
  os_unfair_lock_unlock(&nacre_bridge::gModulesLock);
  if (problem != nil) {
    nacre_bridge::Warn(problem);
    return NO;
  }
  return YES;
}

+ (NSError*)errorWithName:(NSString*)name message:(NSString*)message {
  return [NSError errorWithDomain:NacreModuleErrorDomain
                             code:0
                         userInfo:@{
                           NacreModuleErrorNameKey: name ?: @"Error",
                           NSLocalizedDescriptionKey: message ?: @"",
                         }];
}

+ (NSError*)errorWithName:(NSString*)name message:(NSString*)message code:(NSInteger)code {
  return [NSError errorWithDomain:NacreModuleErrorDomain
                             code:code
                         userInfo:@{
                           NacreModuleErrorNameKey: name ?: @"Error",
                           NSLocalizedDescriptionKey: message ?: @"",
                           kNacreModuleErrorHasCodeKey: @YES,
                         }];
}

+ (BOOL)isBoolean:(id)value {
  return nacre_bridge::IsBooleanNumber(value) ? YES : NO;
}

@end

// ---- 接到桥上 ----
namespace nacre_bridge {
namespace {

// application.nativeModules 那个对象。JS 每次读这个属性都会到这里，所以
// 「找 Swift 的 provider」放在这里：它一定发生在 JS 问任何一个模块之前
nacre::NativeObjectRef ModulesClassObject(const std::string& className,
                                          const std::string& name) {
  if (className != "NativeModules" || name != "shared") return {};
  LoadProviders();
  return {NacreKeep(NacreModuleHub.shared), "NativeModules"};
}

id StringArg(const NacreArgs& args, NSUInteger index) {
  id given = args.value(index);
  return [given isKindOfClass:NSString.class] ? given : nil;
}

// 同步的那几样：有哪些模块、一个模块有什么、调一个同步方法、JS 开始或者
// 不再听一个事件
bool ModulesCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                 std::string* error) {
  if (![object isKindOfClass:NacreModuleHub.class]) return false;
  NacreModuleHub* hub = object;
  if ([sel isEqualToString:@"names"]) {
    *out = EncodeJSON(ModuleNames());
    return true;
  }
  if ([sel isEqualToString:@"describe:"]) {
    // 没有这个模块给 null。有的话：两组方法名和事件名，都排好序
    NacreModule* module = FindModule(StringArg(args, 0));
    if (module == nil) {
      *out = "null";
      return true;
    }
    NSMutableArray<NSString*>* sync = [NSMutableArray array];
    NSMutableArray<NSString*>* async = [NSMutableArray array];
    for (NSString* name in module->_methods) {
      [module->_methods[name].isAsync ? async : sync addObject:name];
    }
    SEL compare = @selector(compare:);
    *out = EncodeJSON(@{
      @"sync": [sync sortedArrayUsingSelector:compare],
      @"async": [async sortedArrayUsingSelector:compare],
      @"events": [module->_events.allObjects sortedArrayUsingSelector:compare],
    });
    return true;
  }
  if ([sel isEqualToString:@"call:method:arguments:bytes:"]) {
    *out = EncodeJSON(InvokeSync(StringArg(args, 0), StringArg(args, 1), args.value(2),
                                 args.value(3)));
    return true;
  }
  if ([sel isEqualToString:@"listen:type:on:"]) {
    NSString* moduleName = StringArg(args, 0);
    NSString* type = StringArg(args, 1);
    const BOOL on = NACRE_BOOL(args.value(2), sel);
    if (moduleName == nil || type == nil) {
      *error = "listen:type:on: needs a module name and an event type";
      return true;
    }
    NSString* key = [NSString stringWithFormat:@"%@\n%@", moduleName, type];
    if (on) [hub.listening addObject:key];
    else [hub.listening removeObject:key];
    *out = "null";
    return true;
  }
  return false;
}

// 调一个异步方法。处理函数当场在主线程上执行；它什么时候、在哪个线程上调
// resolve / reject 都行
bool ModulesCallAsync(id object, const std::string& name, const std::string& argsJSON,
                      const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacreModuleHub.class] || name != "callAsync") return false;
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id (^at)(NSUInteger) = ^id(NSUInteger index) {
    return index < args.count ? args[index] : nil;
  };
  NSString* moduleName = [at(0) isKindOfClass:NSString.class] ? at(0) : nil;
  NSString* methodName = [at(1) isKindOfClass:NSString.class] ? at(1) : nil;
  NacreModuleSettler* settler =
      [[NacreModuleSettler alloc] initWithLabel:Label(moduleName, methodName) done:done];
  NSDictionary* failure = nil;
  NacreModuleMethodEntry* entry = FindMethod(moduleName, methodName, true, &failure);
  if (entry == nil) {
    [settler fail:failure];
    return true;
  }
  NSArray* arguments = IncomingArguments(at(2), at(3));
  @try {
    ((NacreModuleAsyncMethod)entry.handler)(
        arguments, ^(id value) { [settler resolve:value]; },
        ^(NSError* problem) { [settler reject:problem]; });
  } @catch (NSException* e) {
    [settler fail:ExceptionFailure(Label(moduleName, methodName), e)];
  }
  return true;
}

}  // namespace
}  // namespace nacre_bridge

@interface NacreModulesDomain : NSObject
@end

@implementation NacreModulesDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "native-modules";
  d.classes = {NacreModuleHub.class};
  d.call = nacre_bridge::ModulesCall;
  d.callAsync = nacre_bridge::ModulesCallAsync;
  d.classObject = nacre_bridge::ModulesClassObject;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
