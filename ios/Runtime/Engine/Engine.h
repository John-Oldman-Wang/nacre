// Nacre 的 JS 引擎封装（纯 C++，只依赖 V8）。
// 线程约定：除 InitializeV8Once 外，所有方法都必须在同一个 JS 线程上调用。
#pragma once

#include <functional>
#include <memory>
#include <string>

namespace nacre {

enum class LogLevel { Debug, Log, Info, Warn, Error };

// 引擎需要宿主（iOS 层）提供的能力
struct EngineHost {
  // console.* 的输出
  std::function<void(LogLevel level, const std::string& message)> log;

  // 下面几个是上层 application 的数据源。
  // 它们在 JS 线程上被调用，所以宿主必须事先在主线程把值缓存好，
  // 回调里不能碰 UIKit。
  std::function<std::string()> app_info_json;         // Info.plist，静态，JS 侧缓存
  std::function<std::string()> app_environment_json;  // 实时环境值，每次读取都问

  // JS 发起的能力调用。宿主切到主线程执行，完成后在 JS 线程上调 Engine::SettleBool
  std::function<void(const std::string& url, int call_id)> open_url;
  std::function<void(bool disabled)> set_idle_timer_disabled;
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

  // 处理 V8 平台投递的任务（每个 JS 线程任务结束后调用）
  void PumpMessageLoop();

  // 把一个 App 级事件派发给 JS 里的 application。只能在 JS 线程上调用。
  // 内置脚本还没执行时静默忽略。
  void EmitAppEvent(const std::string& type);

  // 结束一个由 JS 发起的异步调用，用布尔值兑现它的 Promise。
  // 只能在 JS 线程上调用；call_id 不存在时静默忽略。
  void SettleBool(int call_id, bool value);

 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};

}  // namespace nacre
