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

 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};

}  // namespace nacre
