#include "JSThread.h"

#include <cstdio>
#include <cstdlib>
#include <utility>

namespace nacre {

namespace {
// iOS 子线程默认栈只有 512KB，V8 默认按约 1MB 的栈计算栈上限，
// 所以 JS 线程必须显式给足栈空间。
constexpr size_t kStackSize = 8 * 1024 * 1024;
}  // namespace

JSThread::JSThread(TaskScope scope) : scope_(std::move(scope)) {
  pthread_attr_t attr;
  pthread_attr_init(&attr);
  pthread_attr_setstacksize(&attr, kStackSize);
  if (pthread_create(&thread_, &attr, &JSThread::Entry, this) != 0) {
    std::fputs("[nacre] failed to create JS thread\n", stderr);
    std::abort();
  }
  pthread_attr_destroy(&attr);
}

JSThread::~JSThread() {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    stopping_ = true;
  }
  cv_.notify_one();
  pthread_join(thread_, nullptr);
}

void JSThread::Post(Task task) {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    queue_.push_back(std::move(task));
  }
  cv_.notify_one();
}

void JSThread::SetAfterEachTask(Task hook) {
  Post([this, hook = std::move(hook)]() mutable { after_each_ = std::move(hook); });
}

void* JSThread::Entry(void* self) {
#if defined(__APPLE__)
  pthread_setname_np("nacre.js");
#endif
  static_cast<JSThread*>(self)->Run();
  return nullptr;
}

void JSThread::Run() {
  for (;;) {
    Task task;
    {
      std::unique_lock<std::mutex> lock(mutex_);
      cv_.wait(lock, [this] { return stopping_ || !queue_.empty(); });
      if (queue_.empty()) return;  // stopping 且队列已清空
      task = std::move(queue_.front());
      queue_.pop_front();
    }
    RunOnce(task);
  }
}

// 一轮 = 任务本身 + after_each_。整轮都放进宿主提供的作用域里，
// 这样宿主的自动释放池也覆盖 after_each_（它会驱动 V8 平台的消息循环）。
void JSThread::RunOnce(const Task& task) {
  Task body = [this, &task] {
    task();
    if (after_each_) after_each_();
  };
  if (scope_) {
    scope_(body);
  } else {
    body();
  }
}

}  // namespace nacre
