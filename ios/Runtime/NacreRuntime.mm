#import "NacreRuntime.h"

#import <os/log.h>

#include <memory>
#include <string>

#include "Engine/Engine.h"
#include "Engine/JSThread.h"

namespace {

os_log_t JSLog() {
  static os_log_t log = os_log_create("com.orbitlabs.nacre", "js");
  return log;
}

os_log_t RuntimeLog() {
  static os_log_t log = os_log_create("com.orbitlabs.nacre", "runtime");
  return log;
}

const char* LevelName(nacre::LogLevel level) {
  switch (level) {
    case nacre::LogLevel::Debug: return "debug";
    case nacre::LogLevel::Log: return "log";
    case nacre::LogLevel::Info: return "info";
    case nacre::LogLevel::Warn: return "warn";
    case nacre::LogLevel::Error: return "error";
  }
  return "log";
}

// console.* 同时输出到 stdout（终端 / simctl --console-pty 可见）和系统日志（Xcode 控制台可见）
void WriteJSLog(nacre::LogLevel level, const std::string& message) {
  fprintf(stdout, "[JS][%s] %s\n", LevelName(level), message.c_str());
  fflush(stdout);
  os_log_type_t type = OS_LOG_TYPE_DEFAULT;
  if (level == nacre::LogLevel::Error) type = OS_LOG_TYPE_ERROR;
  if (level == nacre::LogLevel::Debug) type = OS_LOG_TYPE_DEBUG;
  os_log_with_type(JSLog(), type, "[%{public}s] %{public}s", LevelName(level), message.c_str());
}

void WriteRuntimeLog(NSString* message) {
  fprintf(stdout, "[nacre] %s\n", message.UTF8String);
  fflush(stdout);
  os_log(RuntimeLog(), "%{public}@", message);
}

double NowMs() { return [NSDate date].timeIntervalSince1970 * 1000.0; }

}  // namespace

@implementation NacreRuntime {
  std::unique_ptr<nacre::JSThread> _thread;
  // 只在 JS 线程上创建、使用和销毁
  std::shared_ptr<std::unique_ptr<nacre::Engine>> _engine;
}

- (instancetype)init {
  if ((self = [super init])) {
    _engine = std::make_shared<std::unique_ptr<nacre::Engine>>();
  }
  return self;
}

- (void)startWithScriptsDirectory:(NSURL *)directory {
  if (_thread) return;

  // JS 线程是裸 pthread，没有 run loop，也就没有系统自动提供的自动释放池。
  // 这里给每一轮任务包一个池：这一轮里产生的 autorelease 对象在轮末就释放，
  // 不会一直堆积。池由 iOS 层注入，Runtime/Engine/ 仍然只依赖 V8。
  _thread = std::make_unique<nacre::JSThread>([](const nacre::JSThread::Task& body) {
    @autoreleasepool {
      body();
    }
  });

  auto engine = _engine;
  NSURL* dir = [directory copy];

  // 1. 在 JS 线程上初始化 V8、创建 Isolate / Context、准备全局对象
  _thread->Post([engine]() {
    double t0 = NowMs();
    nacre::Engine::InitializeV8Once();
    double t1 = NowMs();

    nacre::EngineHost host;
    host.log = WriteJSLog;
    *engine = std::make_unique<nacre::Engine>(std::move(host));
    double t2 = NowMs();

    WriteRuntimeLog([NSString stringWithFormat:@"V8 %s initialized in %.1f ms, context ready in %.1f ms",
                                               nacre::Engine::V8Version(), t1 - t0, t2 - t1]);
  });

  // 每个任务结束后处理 V8 平台投递的任务
  _thread->SetAfterEachTask([engine]() {
    if (*engine) (*engine)->PumpMessageLoop();
  });

  // 2. 加载并执行 main.js
  _thread->Post([engine, dir]() {
    if (!*engine) return;
    NSURL* url = [dir URLByAppendingPathComponent:@"main.js"];
    NSError* error = nil;
    NSString* source = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:&error];
    if (!source) {
      WriteRuntimeLog([NSString stringWithFormat:@"cannot read main.js: %@", error.localizedDescription]);
      return;
    }
    double t0 = NowMs();
    bool ok = (*engine)->Evaluate({"main.js", source.UTF8String});
    WriteRuntimeLog([NSString stringWithFormat:@"main.js %@ in %.1f ms", ok ? @"finished" : @"failed", NowMs() - t0]);
  });
}

- (void)dealloc {
  // Engine 必须在 JS 线程上销毁；随后 JSThread 析构时会等待队列执行完并退出线程
  if (_thread) {
    auto engine = _engine;
    _thread->Post([engine]() { engine->reset(); });
    _thread.reset();
  }
}

@end
