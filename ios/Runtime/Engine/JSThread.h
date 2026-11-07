// JS 专用线程：所有 V8 操作只在这个线程上执行。
#pragma once

#include <pthread.h>

#include <condition_variable>
#include <deque>
#include <functional>
#include <mutex>

namespace nacre {

class JSThread {
 public:
  using Task = std::function<void()>;

  // 每一轮任务的外层作用域。这里是纯 C++，不能依赖 ObjC，
  // 所以自动释放池这类平台相关的包装由宿主（iOS 层）注入。
  // 实现必须调用一次传入的 body。
  using TaskScope = std::function<void(const Task& body)>;

  // scope 为空时任务直接执行。作用域只能在构造时传入，
  // 这样第一个任务（V8 初始化）也在作用域内。
  explicit JSThread(TaskScope scope = nullptr);
  ~JSThread();

  JSThread(const JSThread&) = delete;
  JSThread& operator=(const JSThread&) = delete;

  void Post(Task task);
  // 每个任务执行完后调用一次（用于驱动 V8 平台的消息循环）
  void SetAfterEachTask(Task hook);

 private:
  static void* Entry(void* self);
  void Run();
  void RunOnce(const Task& task);

  pthread_t thread_{};
  std::mutex mutex_;
  std::condition_variable cv_;
  std::deque<Task> queue_;
  Task after_each_;
  // 只在构造函数里写、只在 JS 线程上读；线程创建本身构成 happens-before
  TaskScope scope_;
  bool stopping_ = false;
};

}  // namespace nacre
