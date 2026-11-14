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

#import <vector>

namespace nacre_bridge {

namespace {

std::vector<NacreAsyncMethodHandler>& AsyncMethodHandlers() {
  static std::vector<NacreAsyncMethodHandler> handlers;
  return handlers;
}

std::vector<NacreClassObjectHandler>& ClassObjectHandlers() {
  static std::vector<NacreClassObjectHandler> handlers;
  return handlers;
}

}  // namespace

void NacreRegisterAsyncMethodHandler(NacreAsyncMethodHandler handler) {
  if (handler != nullptr) AsyncMethodHandlers().push_back(handler);
}

void NacreRegisterClassObjectHandler(NacreClassObjectHandler handler) {
  if (handler != nullptr) ClassObjectHandlers().push_back(handler);
}

bool NacreDispatchAsyncMethod(id object, const std::string& name, const std::string& argsJSON,
                              const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  for (NacreAsyncMethodHandler handler : AsyncMethodHandlers()) {
    if (handler(object, name, argsJSON, argPtrs, done)) return true;
  }
  return false;
}

nacre::NativeObjectRef NacreDispatchClassObject(const std::string& className,
                                                const std::string& name) {
  for (NacreClassObjectHandler handler : ClassObjectHandlers()) {
    nacre::NativeObjectRef ref = handler(className, name);
    if (!ref.class_name.empty()) return ref;
  }
  return {};
}

}  // namespace nacre_bridge
