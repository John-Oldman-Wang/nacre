// 一个原生对象的引用：指针加上它对应的 JS 类名。
//
// 单独成一个头，是因为它同时出现在两个面上：引擎（Engine.h）拿它当不透明
// 指针用，能力包（NacreExtension.h）拿它把自己的对象交给引擎。它什么都不
// 依赖——既不认识 V8，也不认识 iOS。
#pragma once

#include <string>

namespace nacre {

// Engine 只把它当不透明指针，retain / release 由宿主做。
//
// **它不持有对象。** 造它的那一刻到引擎 retain 它之间没人管，所以 iOS 侧
// 造它时指针一律走 NacreKeep(…)，不能写裸的 (__bridge void*)。
struct NativeObjectRef {
  void* ptr = nullptr;     // iOS 上是 id
  std::string class_name;  // 对应的 JS 类名，如 "UIWindowScene"
};

}  // namespace nacre
