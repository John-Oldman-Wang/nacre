// 能力域的注册表。
//
// 分发链原来是写死在核心里的一串 if（`if (KeychainCallAsync(…)) return;`）。
// 那样核心必须认识每一个能力的名字，能力也就永远拆不出去——而「能力可拆分」
// 是交付模型的要求：用不到 Keychain 的 App 不该链上 Security，也不该为它
// 声明任何东西。
//
// 所以改成运行时的表：能力在自己的 +load 里把函数指针塞进来，核心只管挨个问
// 「认不认领」。核心一个能力的名字都不认识。
//
// 表用函数内的静态局部变量，不用文件级的全局对象——**+load 比全局对象的构造
// 早**，用全局对象会撞上静态初始化顺序问题（注册进了一个还没构造的 vector，
// 构造时又被清空，而且一声不吭）。函数内的静态局部变量是第一次调用时构造的，
// 没有这个问题。
#import "NacreBridge.h"

#import <objc/message.h>
#import <objc/runtime.h>

#include <algorithm>
#include <cstring>
#import <vector>

// 委托槽位里实际放的那个对象：自己一个委托方法都不实现，系统问到哪个就转给
// 第一个实现了它的那一方（见 NacreExtension.h 里 NacreAddDelegatePart 的说明）。
//
// 转发走 forwardingTargetForSelector:，这是消息转发里最便宜的一档：不建
// NSInvocation，只是换一个接收者重发。scrollViewDidScroll: 每帧都来，所以
// 在意这个。
@interface NacreDelegateMux : NSObject
@property(nonatomic, strong) NSMutableArray* parts;
@end

@implementation NacreDelegateMux

- (id)partFor:(SEL)selector {
  for (id part in self.parts) {
    if ([part respondsToSelector:selector]) return part;
  }
  return nil;
}

// UIKit 在设委托的那一刻用它问「实现了哪些方法」，把答案记下来
- (BOOL)respondsToSelector:(SEL)selector {
  return [super respondsToSelector:selector] || [self partFor:selector] != nil;
}

- (id)forwardingTargetForSelector:(SEL)selector {
  return [self partFor:selector];
}

- (BOOL)conformsToProtocol:(Protocol*)protocol {
  if ([super conformsToProtocol:protocol]) return YES;
  for (id part in self.parts) {
    if ([part conformsToProtocol:protocol]) return YES;
  }
  return NO;
}

@end

static const void* kNacreDelegateMuxKey = &kNacreDelegateMuxKey;

namespace nacre_bridge {

// 重新设一遍 delegate：先清掉再放回去，UIKit 才会重新问一遍实现了哪些方法
// （同一个对象再设一次，有的类会当成没变而跳过）
static void ResetDelegate(id object, id delegate) {
  SEL setter = @selector(setDelegate:);
  if (![object respondsToSelector:setter]) return;
  auto send = (void (*)(id, SEL, id))objc_msgSend;
  send(object, setter, nil);
  if (delegate != nil) send(object, setter, delegate);
}

void NacreAddDelegatePart(id object, id part) {
  if (object == nil || part == nil) return;
  NacreDelegateMux* mux = objc_getAssociatedObject(object, kNacreDelegateMuxKey);
  if (mux == nil) {
    mux = [NacreDelegateMux new];
    mux.parts = [NSMutableArray array];
    objc_setAssociatedObject(object, kNacreDelegateMuxKey, mux,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  if ([mux.parts indexOfObjectIdenticalTo:part] != NSNotFound) return;
  [mux.parts addObject:part];
  ResetDelegate(object, mux);
}

void NacreRemoveDelegatePart(id object, id part) {
  if (object == nil || part == nil) return;
  NacreDelegateMux* mux = objc_getAssociatedObject(object, kNacreDelegateMuxKey);
  if (mux == nil) return;
  const NSUInteger at = [mux.parts indexOfObjectIdenticalTo:part];
  if (at == NSNotFound) return;
  [mux.parts removeObjectAtIndex:at];
  if (mux.parts.count == 0) {
    ResetDelegate(object, nil);
    objc_setAssociatedObject(object, kNacreDelegateMuxKey, nil,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  } else {
    ResetDelegate(object, mux);
  }
}

namespace {

std::vector<NacreAsyncMethodHandler>& AsyncMethodHandlers() {
  static std::vector<NacreAsyncMethodHandler> handlers;
  return handlers;
}

std::vector<NacreClassObjectHandler>& ClassObjectHandlers() {
  static std::vector<NacreClassObjectHandler> handlers;
  return handlers;
}

std::vector<Class>& BuiltinPartAnchors() {
  static std::vector<Class> anchors;
  return anchors;
}

// ---- 域 ----
struct DomainEntry {
  NacreDomain domain;
  int depth = 0;   // 它管的类里继承层数最深的那个，排序用
};

std::vector<DomainEntry>& Domains() {
  static std::vector<DomainEntry> domains;
  return domains;
}

// 登记是在 +load 里（顺序不确定），排序推到第一次分发时做
bool& DomainsSorted() {
  static bool sorted = false;
  return sorted;
}

int ClassDepth(Class cls) {
  int depth = 0;
  for (Class c = cls; c != Nil; c = class_getSuperclass(c)) depth++;
  return depth;
}

// 问的顺序：继承层数深的在前（子类先于父类），一样深的按名字排。
// 两条都和 +load 的先后无关，所以每次启动、每台机器上都一样。
const std::vector<DomainEntry>& SortedDomains() {
  std::vector<DomainEntry>& domains = Domains();
  if (!DomainsSorted()) {
    std::stable_sort(domains.begin(), domains.end(),
                     [](const DomainEntry& a, const DomainEntry& b) {
                       if (a.depth != b.depth) return a.depth > b.depth;
                       return std::strcmp(a.domain.name, b.domain.name) < 0;
                     });
    DomainsSorted() = true;
  }
  return domains;
}

// 这个域的实例通道管不管这个对象
bool Owns(const DomainEntry& entry, id object) {
  for (Class cls : entry.domain.classes) {
    if ([object isKindOfClass:cls]) return true;
  }
  return false;
}

NacreEventSink __strong& EventSink() {
  static NacreEventSink sink = nil;
  return sink;
}

NacreSyncAsk __strong& SyncAsk() {
  static NacreSyncAsk ask = nil;
  return ask;
}

NacreAnswerAsk __strong& AnswerAsk() {
  static NacreAnswerAsk ask = nil;
  return ask;
}

NacreBlockCall __strong& BlockCall() {
  static NacreBlockCall call = nil;
  return call;
}

}  // namespace

void NacreRegisterDomain(const NacreDomain& domain) {
  if (domain.name == nullptr) return;
  DomainEntry entry;
  entry.domain = domain;
  for (Class cls : domain.classes) entry.depth = std::max(entry.depth, ClassDepth(cls));
  Domains().push_back(entry);
  DomainsSorted() = false;
}

id NacreDomainRead(id object, NSString* key) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.read == nullptr || !Owns(e, object)) continue;
    id value = e.domain.read(object, key);
    if (value != nil) return value;
  }
  return nil;
}

bool NacreDomainWrite(id object, NSString* key, id value, std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.write == nullptr || !Owns(e, object)) continue;
    if (e.domain.write(object, key, value, error)) return true;
  }
  return false;
}

nacre::NativeObjectRef NacreDomainReadObject(id object, const std::string& name) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.readObject == nullptr || !Owns(e, object)) continue;
    nacre::NativeObjectRef ref = e.domain.readObject(object, name);
    if (!ref.class_name.empty()) return ref;
  }
  return {};
}

bool NacreDomainWriteObject(id object, const std::string& name, id value,
                            std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.writeObject == nullptr || !Owns(e, object)) continue;
    if (e.domain.writeObject(object, name, value, error)) return true;
  }
  return false;
}

void NacreDomainReadObjectArray(id object, const std::string& name,
                                std::vector<nacre::NativeObjectRef>& refs) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.readObjectArray == nullptr || !Owns(e, object)) continue;
    e.domain.readObjectArray(object, name, refs);
  }
}

bool NacreDomainWriteObjectArray(id object, const std::string& name,
                                 const std::vector<void*>& values, std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.writeObjectArray == nullptr || !Owns(e, object)) continue;
    if (e.domain.writeObjectArray(object, name, values, error)) return true;
  }
  return false;
}

bool NacreDomainCallVoid(id object, const std::string& name) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.callVoid == nullptr || !Owns(e, object)) continue;
    if (e.domain.callVoid(object, name)) return true;
  }
  return false;
}

bool NacreDomainCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                     std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.call == nullptr || !Owns(e, object)) continue;
    if (e.domain.call(object, sel, args, out, error)) return true;
  }
  return false;
}

bool NacreDomainCallObject(id object, NSString* sel, const NacreArgs& args,
                           nacre::NativeObjectRef* out, std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.callObject == nullptr || !Owns(e, object)) continue;
    if (e.domain.callObject(object, sel, args, out, error)) return true;
  }
  return false;
}

bool NacreDomainCallObjectArray(id object, NSString* sel, const NacreArgs& args,
                                std::vector<nacre::NativeObjectRef>* out,
                                std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.callObjectArray == nullptr || !Owns(e, object)) continue;
    if (e.domain.callObjectArray(object, sel, args, out, error)) return true;
  }
  return false;
}

bool NacreDomainConstruct(const std::string& className, const NacreArgs& args,
                          nacre::NativeObjectRef* out, std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.construct == nullptr) continue;
    if (e.domain.construct(className, args, out, error)) return true;
  }
  return false;
}

bool NacreDomainClassCall(const std::string& className, NSString* sel,
                          const NacreArgs& args, std::string* out, std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.classCall == nullptr) continue;
    if (e.domain.classCall(className, sel, args, out, error)) return true;
  }
  return false;
}

bool NacreDomainClassCallObject(const std::string& className, NSString* sel,
                                const NacreArgs& args, nacre::NativeObjectRef* out,
                                std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.classCallObject == nullptr) continue;
    if (e.domain.classCallObject(className, sel, args, out, error)) return true;
  }
  return false;
}

NacreSubscribed NacreDomainSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.subscribe == nullptr || !Owns(e, object)) continue;
    NacreSubscribed answer = e.domain.subscribe(object, type, on, error);
    if (answer.kind != NacreSubscribed::NotMine) return answer;
  }
  return false;
}

// ---- 同步回调 ----
void NacreSetSyncSinks(NacreSyncAsk ask, NacreBlockCall call) {
  SyncAsk() = [ask copy];
  BlockCall() = [call copy];
}

BOOL NacreEmitEventSync(id object, const char* className, NSString* type, NSString* json,
                        const char* eventClass) {
  NacreSyncAsk ask = SyncAsk();
  // 不在主线程就不进 JS：JS 只在主线程上跑。按「要」处理并留一行日志
  if (ask == nil || !NSThread.isMainThread) {
    if (ask != nil) WriteRuntimeLog([NSString stringWithFormat:
        @"sync event \"%@\" dropped: not on the main thread", type]);
    return NO;
  }
  return ask(object, className, type, json, YES, eventClass);
}

void NacreSetAnswerSink(NacreAnswerAsk ask) { AnswerAsk() = [ask copy]; }

NSString* NacreEmitEventForAnswer(id object, const char* className, NSString* type,
                                  NSString* json, NSString* field, const char* eventClass) {
  NacreAnswerAsk ask = AnswerAsk();
  if (ask == nil || !NSThread.isMainThread) {
    if (ask != nil) WriteRuntimeLog([NSString stringWithFormat:
        @"event \"%@\" dropped: not on the main thread", type]);
    return nil;
  }
  return ask(object, className, type, json, field, eventClass);
}

void NacreEmitEventNow(id object, const char* className, NSString* type, NSString* json,
                       const char* eventClass) {
  NacreSyncAsk ask = SyncAsk();
  if (ask == nil || !NSThread.isMainThread) {
    if (ask != nil) WriteRuntimeLog([NSString stringWithFormat:
        @"event \"%@\" dropped: not on the main thread", type]);
    return;
  }
  ask(object, className, type, json, NO, eventClass);
}

void NacreCallBlock(NSInteger blockId, NSString* argsJSON) {
  NacreBlockCall call = BlockCall();
  if (call == nil) return;
  if (!NSThread.isMainThread) {
    WriteRuntimeLog(@"sync block call dropped: not on the main thread");
    return;
  }
  call(blockId, argsJSON ?: @"[]", NO);
}

void NacreCallBlockLater(NSInteger blockId, NSString* argsJSON) {
  NacreBlockCall call = BlockCall();
  if (call != nil) call(blockId, argsJSON ?: @"[]", YES);
}

// ---- 事件出口 ----
void NacreSetEventSink(NacreEventSink sink) { EventSink() = [sink copy]; }

void NacreEmitEvent(id object, const char* className, NSString* type) {
  NacreEventSink sink = EventSink();
  if (sink != nil) sink(object, className, type, nil, nil, nullptr, nullptr);
}

void NacreEmitEventWithJSON(id object, const char* className, NSString* type,
                            NSString* json, const char* eventClass) {
  NacreEventSink sink = EventSink();
  if (sink != nil) sink(object, className, type, json ?: @"null", nil, nullptr, eventClass);
}

void NacreEmitEventWithObject(id object, const char* className, NSString* type,
                              id payload, const char* payloadClass, const char* eventClass) {
  NacreEventSink sink = EventSink();
  if (sink != nil) sink(object, className, type, nil, payload, payloadClass, eventClass);
}

void NacreRegisterAsyncMethodHandler(NacreAsyncMethodHandler handler) {
  if (handler != nullptr) AsyncMethodHandlers().push_back(handler);
}

void NacreRegisterClassObjectHandler(NacreClassObjectHandler handler) {
  if (handler != nullptr) ClassObjectHandlers().push_back(handler);
}

void NacreRegisterBuiltinParts(Class anchor) {
  if (anchor != Nil) BuiltinPartAnchors().push_back(anchor);
}

NSArray<NSBundle*>* NacreRegisteredPartBundles() {
  NSMutableArray<NSBundle*>* bundles = [NSMutableArray array];
  for (Class anchor : BuiltinPartAnchors()) {
    NSBundle* bundle = [NSBundle bundleForClass:anchor];
    if (bundle != nil && ![bundles containsObject:bundle]) [bundles addObject:bundle];
  }
  // +load 的顺序由链接顺序决定、不确定，而 part 的执行顺序应当每次一样——
  // 否则「偶尔出错」的问题会无从查起。按包的名字排
  [bundles sortUsingComparator:^NSComparisonResult(NSBundle* a, NSBundle* b) {
    return [a.bundlePath.lastPathComponent compare:b.bundlePath.lastPathComponent];
  }];
  return bundles;
}

bool NacreDispatchAsyncMethod(id object, const std::string& name, const std::string& argsJSON,
                              const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  for (NacreAsyncMethodHandler handler : AsyncMethodHandlers()) {
    if (handler(object, name, argsJSON, argPtrs, done)) return true;
  }
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.callAsync == nullptr || !Owns(e, object)) continue;
    if (e.domain.callAsync(object, name, argsJSON, argPtrs, done)) return true;
  }
  return false;
}

nacre::NativeObjectRef NacreDispatchClassObject(const std::string& className,
                                                const std::string& name) {
  for (NacreClassObjectHandler handler : ClassObjectHandlers()) {
    nacre::NativeObjectRef ref = handler(className, name);
    if (!ref.class_name.empty()) return ref;
  }
  for (const DomainEntry& e : SortedDomains()) {
    if (e.domain.classObject == nullptr) continue;
    nacre::NativeObjectRef ref = e.domain.classObject(className, name);
    if (!ref.class_name.empty()) return ref;
  }
  return {};
}

}  // namespace nacre_bridge
