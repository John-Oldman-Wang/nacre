// Nacre 的 JS 引擎封装（纯 C++，只依赖 V8）。
// 线程约定：除 InitializeV8Once 外，所有方法都必须在同一个 JS 线程上调用。
#pragma once

#include <functional>
#include <memory>
#include <string>
#include <vector>

namespace nacre {

enum class LogLevel { Debug, Log, Info, Warn, Error };

// 一个原生对象的引用。Engine 只把它当不透明指针，retain / release 由宿主做。
struct NativeObjectRef {
  void* ptr = nullptr;     // iOS 上是 id
  std::string class_name;  // 对应的 JS 类名，如 "UIWindowScene"
};

// 引擎需要宿主（iOS 层）提供的能力
struct EngineHost {
  // console.* 的输出
  std::function<void(LogLevel level, const std::string& message)> log;

  // 下面几个是上层 application 的数据源。
  // 它们在 JS 线程上被调用，所以宿主必须事先在主线程把值缓存好，
  // 回调里不能碰 UIKit。
  std::function<std::string()> app_info_json;         // Info.plist，静态，JS 侧缓存
  std::function<std::string()> app_environment_json;  // 实时环境值，每次读取都问

  // JS 发起的能力调用。完成后调 Engine::SettleBool 兑现对应的 Promise
  std::function<void(const std::string& url, int call_id)> open_url;
  std::function<void(bool disabled)> set_idle_timer_disabled;

  // 原生对象的引用计数。JS 包装对象建立时 retain，被 GC 回收时 release。
  // 统一用强引用：弱引用要处理原生对象先死的悬空问题，而强引用最坏只是
  // 数据过期（比如场景已断开），不会崩。
  std::function<void(void* ptr)> retain_native;
  std::function<void(void* ptr)> release_native;

  // 当前已连接的场景
  std::function<std::vector<NativeObjectRef>()> app_scenes;

  // 原生对象的属性读写。值用 JSON 编码，避免为每个属性加一个回调。
  // 宿主内部用一张「类名 + 属性名」的分发表来实现。
  std::function<std::string(void* ptr, const std::string& name)> read_property;
  std::function<void(void* ptr, const std::string& name, const std::string& json)>
      write_property;
  // 属性值本身是原生对象时走这个
  std::function<NativeObjectRef(void* ptr, const std::string& name)> read_object_property;
  std::function<void(void* ptr, const std::string& name, void* value)> write_object_property;

  // 由 JS 发起的构造。args 是其他原生对象的指针，按位置传。
  // 宿主必须保证返回的对象活到调用方 retain 为止（ARC 下要 CFAutorelease）。
  std::function<NativeObjectRef(const std::string& class_name,
                                const std::vector<void*>& args)>
      construct_native;
  // 无参无返回值的方法，比如 makeKeyAndVisible
  std::function<void(void* ptr, const std::string& name)> call_void_method;

  // 带参数、带返回值的方法。args_json 是 JSON 数组；对象参数在数组里留
  // null，真正的指针按同样的下标放在 arg_ptrs 里。返回值用 JSON 编码，
  // void 方法返回空串。
  std::function<std::string(void* ptr, const std::string& name,
                            const std::string& args_json,
                            const std::vector<void*>& arg_ptrs)>
      call_method;
  // 返回值是原生对象的方法，参数规则同上
  std::function<NativeObjectRef(void* ptr, const std::string& name,
                                const std::string& args_json,
                                const std::vector<void*>& arg_ptrs)>
      call_object_method;
  // 属性值是原生对象数组，比如 UIView.subviews
  std::function<std::vector<NativeObjectRef>(void* ptr, const std::string& name)>
      read_object_array_property;

  // 类级属性。没有实例，所以用类名定位，比如 UIColor.whiteColor
  std::function<NativeObjectRef(const std::string& class_name, const std::string& name)>
      read_class_object_property;
  // 异步方法，完成后调 Engine::SettleBool
  std::function<void(void* ptr, const std::string& name, const std::string& args_json,
                     int call_id)>
      call_async;
};

struct Script {
  std::string name;  // 用于报错时显示的文件名，如 "main.js"
  std::string source;
};

class Engine {
 public:
  // 进程级初始化：V8 平台只能初始化一次
  static void InitializeV8Once();
  static const char* V8Version();

  // 创建 Isolate 和 Context，并准备好全局对象（globalThis、console）
  explicit Engine(EngineHost host);
  ~Engine();

  Engine(const Engine&) = delete;
  Engine& operator=(const Engine&) = delete;

  // 执行一段脚本。出现未捕获异常时通过 host.log 输出错误并返回 false
  bool Evaluate(const Script& script);

  // 处理 V8 平台投递的任务（每轮 JS 任务结束后调用）
  void PumpMessageLoop();

  // 在主线程即将空闲时调用，把这段空闲时间交给 V8 做增量 GC 等后台工作。
  // Chrome 就是这么在帧间隙做 GC 的。只能在 JS 所在线程调用。
  void RunIdleTasks(double idle_time_in_seconds);

  // 把一个 App 级事件派发给 JS 里的 application。只能在 JS 线程上调用。
  // 内置脚本还没执行时静默忽略。
  void EmitAppEvent(const std::string& type);

  // 把一个原生对象作为 payload 派发事件：JS 收到的事件上会有 event[key] = 包装对象。
  // 只能在 JS 所在线程调用。
  void EmitAppEventWithObject(const std::string& type, const std::string& key,
                              const NativeObjectRef& ref);

  // 把事件派发给某个原生对象自己的 JS 包装（而不是 application）。
  // 场景的生命周期事件走这条路。
  void EmitObjectEvent(const NativeObjectRef& target, const std::string& type);

  // 结束一个由 JS 发起的异步调用，用布尔值兑现它的 Promise。
  // 只能在 JS 线程上调用；call_id 不存在时静默忽略。
  void SettleBool(int call_id, bool value);

 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};

}  // namespace nacre
