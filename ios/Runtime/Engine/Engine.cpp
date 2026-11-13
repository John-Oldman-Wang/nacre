#include "Engine.h"

// 这里不给 V8 预设任何编译宏：v8config.h 自己就能推导出 V8_TARGET_ARCH_ARM64
// 和 V8_TARGET_OS_IOS；而真正决定对象布局的 V8_COMPRESS_POINTERS、
// V8_ENABLE_SANDBOX 在这个预编译包里是关闭的，使用方也不定义，两边正好一致。
// 换 V8 构建时必须重新核对这两个宏——不一致会导致对象布局不匹配而崩溃。
#include <libplatform/libplatform.h>
#include <v8-array-buffer.h>
#include <v8-json.h>
#include <v8.h>

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

namespace nacre {

namespace {

// 一次唤醒里最多占用主线程多久。超了就让出去，让 run loop 有机会提交
// CA 事务（渲染）和响应触摸。60fps 一帧 16.7ms，这里取大约一半。
constexpr double kTimerBudgetMs = 8.0;
// 单个回调超过这个时长就记一笔。参照 Chromium 的 Long Task（50ms）——
// 取 8ms 会被正常的布局计算刷屏，取 50ms 基本只有真卡才响。
// 运行时不替应用优化，但要让它看得见。
constexpr double kLongTaskMs = 50.0;

std::unique_ptr<v8::Platform> g_platform;
std::once_flag g_init_once;

v8::Local<v8::String> V8Str(v8::Isolate* isolate, const char* text) {
  return v8::String::NewFromUtf8(isolate, text).ToLocalChecked();
}

v8::Local<v8::String> Utf8(v8::Isolate* isolate, const std::string& text) {
  return v8::String::NewFromUtf8(isolate, text.data(), v8::NewStringType::kNormal,
                                 static_cast<int>(text.size()))
      .ToLocalChecked();
}

// 只能用于不会触发用户代码的值：字符串、数字、BigInt、V8 自己产生的消息。
std::string ToUtf8(v8::Isolate* isolate, v8::Local<v8::Value> value) {
  v8::String::Utf8Value utf8(isolate, value);
  if (*utf8 == nullptr) return "<unprintable>";
  return std::string(*utf8, utf8.length());
}

// 兜底的字符串转换。转换会执行用户代码（toString、valueOf、Proxy 陷阱），
// 也可能因为值是 Symbol 而抛 TypeError。
//
// 实测：v8::String::Utf8Value 的构造函数内部自带 TryCatch，上面这些异常在它那里
// 就被吞掉了，我们拿到的是空指针，走 <unprintable> 分支。下面的 TryCatch 因此
// 基本不会命中，留着是为了防 V8 以后改变这个行为——console.* 不允许向 JS 抛异常。
std::string SafeToString(v8::Isolate* isolate, v8::Local<v8::Value> value) {
  v8::TryCatch try_catch(isolate);
  v8::String::Utf8Value utf8(isolate, value);
  if (try_catch.HasCaught()) {
    try_catch.Reset();
    return "<throws on toString>";
  }
  if (*utf8 == nullptr) return "<unprintable>";
  return std::string(*utf8, utf8.length());
}

std::string FormatNumber(v8::Isolate* isolate, v8::Local<v8::Value> value) {
  double number = value.As<v8::Number>()->Value();
  // ECMAScript 的 String(-0) 是 "0"，但打印时区分 0 和 -0 更有用
  if (number == 0 && std::signbit(number)) return "-0";
  return ToUtf8(isolate, value);
}

}  // namespace

struct Engine::Impl {
  EngineHost host;
  std::unique_ptr<v8::ArrayBuffer::Allocator> allocator;
  v8::Isolate* isolate = nullptr;
  v8::Global<v8::Context> context;

  // 已经被拒绝、但还没有 handler 的 promise。
  // 只在「本次微任务检查点」内有效：每次 FlushRejections 都清空，
  // 所以这里用强引用也不会把 promise 长期钉在堆上。
  struct PendingRejection {
    v8::Global<v8::Promise> promise;
    v8::Global<v8::Value> value;
  };
  std::vector<PendingRejection> pending_rejections;
  // 未处理拒绝的结算已经排进宿主队列了，别重复排
  bool rejection_flush_scheduled = false;

  // ---- 定时器 ----
  // 一个最小堆 + 一个唤醒源，这是 Chromium MessagePump 的结构。
  // 不用「每个定时器一个系统 timer」，因为那样同时到期的顺序不确定，
  // 而 HTML 规范要求按注册顺序执行。
  struct TimerEntry {
    int id = 0;
    double due_ms = 0;       // 到期时刻（单调时钟）
    double interval_ms = 0;  // repeats 的间隔；一次性的为 0
    uint64_t seq = 0;        // 插入序号——同时到期时就靠它定顺序
    v8::Global<v8::Function> callback;
  };
  // 比较器给 std::*_heap 用，要的是「大顶在前」的反义，所以反过来写
  struct LaterFirst {
    bool operator()(const TimerEntry& a, const TimerEntry& b) const {
      if (a.due_ms != b.due_ms) return a.due_ms > b.due_ms;
      return a.seq > b.seq;
    }
  };
  std::vector<TimerEntry> timers;  // 最小堆，堆顶是最早到期的
  uint64_t next_timer_seq = 0;
  int next_timer_id = 1;
  double scheduled_wakeup_at = -1;  // 已经和宿主约好的唤醒时刻，-1 表示没约
  // 正在跑 FireDueTimers。期间回调里新注册的定时器不要立刻去重设唤醒源——
  // 那等于在 dispatch_source 的 handler 里重设它自己，实测会丢掉这次约定。
  // 统一等 FireDueTimers 结尾安排一次。
  bool firing_timers = false;
  // 正在执行的那个定时器的 id，以及它有没有在自己的回调里被取消。
  // setInterval 的回调里调 clearInterval(自己) 是最常见的写法，而那一刻
  // entry 已经被 pop 出堆了——遍历 timers 找不到它，取消会被无声吞掉，
  // 回调返回后又被重新入堆，于是永远停不下来。
  int firing_timer_id = 0;
  bool firing_timer_cancelled = false;

  // 单调时钟，单位毫秒。不能用 iOS 的 CACurrentMediaTime——这一层不依赖 iOS。
  static double NowMs() {
    using namespace std::chrono;
    return duration<double, std::milli>(steady_clock::now().time_since_epoch()).count();
  }

  // 墙上时钟，Unix 毫秒。只给 performance.timeOrigin 用——它会被用户改时间、
  // 被 NTP 校正，不能拿来算时间差
  static double WallMs() {
    using namespace std::chrono;
    return duration<double, std::milli>(system_clock::now().time_since_epoch()).count();
  }

  // performance.now() 的零点：引擎建出来的这一刻。两个时钟各记一次——
  // 单调的给 now() 做差，墙上的给 timeOrigin
  const double origin_mono_ms = NowMs();
  const double origin_wall_ms = WallMs();

  // 按堆顶重新和宿主约唤醒时间。堆空了就撤销。
  void ScheduleNextWakeup() {
    if (!host.schedule_wakeup || firing_timers) return;
    // 跳过已经取消的（callback 被 Reset 过），它们是惰性删除的残留
    while (!timers.empty() && timers.front().callback.IsEmpty()) {
      std::pop_heap(timers.begin(), timers.end(), LaterFirst{});
      timers.pop_back();
    }
    if (timers.empty()) {
      if (scheduled_wakeup_at >= 0) {
        scheduled_wakeup_at = -1;
        host.schedule_wakeup(-1);
      }
      return;
    }
    const double due = timers.front().due_ms;
    if (scheduled_wakeup_at >= 0 && std::abs(scheduled_wakeup_at - due) < 0.5) return;
    scheduled_wakeup_at = due;
    host.schedule_wakeup(std::max(0.0, due - NowMs()));
  }

  // 未处理拒绝改成排到宿主队列尾部结算，而不是当场。
  // 这样 setTimeout(() => p.catch(...), 0) 补的 handler 来得及抑制上报，
  // 和 Chromium 一致。代价是队列忙的时候上报会被推后。
  // 取走一个待定调用的 resolver。取不到说明已经兑现过或被取消了。
  v8::Local<v8::Promise::Resolver> TakePending(int call_id) {
    auto it = pending_calls.find(call_id);
    if (it == pending_calls.end()) return {};
    v8::Local<v8::Promise::Resolver> r = it->second.Get(isolate);
    pending_calls.erase(it);
    return r;
  }
  // 兑现之后的收尾。这里不在任何 JS 调用栈上，kAuto 不会自动排空微任务，
  // 不显式跑一次的话 await 后面的代码要等到下次有 JS 执行才继续。
  void AfterSettle() {
    isolate->PerformMicrotaskCheckpoint();
    ScheduleRejectionFlush();
  }

  int AddTimer(v8::Local<v8::Function> callback, double delay_ms, bool repeats);
  void RemoveTimer(int id);

  void ScheduleRejectionFlush() {
    if (pending_rejections.empty() || rejection_flush_scheduled) return;
    if (!host.post_task) {  // 宿主没提供队列，退回当场结算
      FlushRejections();
      return;
    }
    rejection_flush_scheduled = true;
    host.post_task([this] {
      rejection_flush_scheduled = false;
      FlushRejections();
    });
  }

  // 内置脚本注册的事件入口，用来把事件送进 application。
  // 签名是 (type, payload) -> boolean，返回 false 表示 JS 调了 preventDefault
  v8::Global<v8::Function> event_sink;
  // 防重入：错误处理器自己抛异常时不能再递归派发
  bool dispatching_error = false;

  // JS 发起、等待原生回答的调用。id -> 该次调用的 Promise
  std::unordered_map<int, v8::Global<v8::Promise::Resolver>> pending_calls;
  int next_call_id = 1;

  // ---- 原生对象的 JS 包装 ----
  // 不用 V8 的 internal field：那样建对象就得绕过 JS 构造函数，
  // EventTarget 的监听器表就初始化不了。改成给包装对象挂一个句柄 id，
  // C++ 这边用 id 查原生指针。
  v8::Global<v8::Function> wrapper_factory;  // 内置 JS 提供：(className, id) -> 包装对象
  v8::Global<v8::Function> object_event_sink;  // 内置 JS 提供：(wrapper, type) -> void
  std::unordered_map<int, void*> handle_to_ptr;
  std::unordered_map<void*, int> ptr_to_handle;
  std::unordered_map<int, v8::Global<v8::Object>> wrappers;  // weak
  int next_handle = 1;

  // 传给 weak 回调的身份信息
  struct HandleKey {
    Impl* impl;
    int handle;
  };

  static Impl* From(v8::Isolate* isolate) {
    return static_cast<Impl*>(isolate->GetData(0));
  }

  // ---------- console 的格式化 ----------
  // 约定：Format 以及它调用的一切，都不向 JS 抛异常。
  // 第一层按类型分发，完全不执行用户代码；第二层对象走 JSON.stringify；
  // 第三层是兜底的字符串转换，异常就地隔离。

  std::string Format(v8::Local<v8::Context> ctx, v8::Local<v8::Value> value) {
    if (value->IsNullOrUndefined()) return value->IsNull() ? "null" : "undefined";
    if (value->IsString()) return ToUtf8(isolate, value);  // 顶层字符串不加引号
    if (value->IsBoolean()) return value->IsTrue() ? "true" : "false";
    if (value->IsNumber()) return FormatNumber(isolate, value);
    if (value->IsBigInt()) return ToUtf8(isolate, value) + "n";
    if (value->IsSymbol()) return FormatSymbol(value.As<v8::Symbol>());
    if (value->IsFunction()) return FormatFunction(value.As<v8::Function>());
    if (value->IsNativeError()) return FormatError(ctx, value.As<v8::Object>());

    if (value->IsObject()) {
      v8::TryCatch try_catch(isolate);
      v8::Local<v8::String> json;
      if (v8::JSON::Stringify(ctx, value).ToLocal(&json) && !json->IsUndefined()) {
        return ToUtf8(isolate, json);
      }
      // 循环引用、抛异常的 getter 或 toJSON 都会走到这里
      try_catch.Reset();
    }

    return SafeToString(isolate, value);
  }

  std::string FormatSymbol(v8::Local<v8::Symbol> symbol) {
    v8::Local<v8::Value> description = symbol->Description(isolate);
    if (!description->IsString()) return "Symbol()";
    return "Symbol(" + ToUtf8(isolate, description) + ")";
  }

  std::string FormatFunction(v8::Local<v8::Function> function) {
    v8::Local<v8::Value> name = function->GetName();  // 读槽位，不执行用户代码
    std::string text = name->IsString() ? ToUtf8(isolate, name) : "";
    if (text.empty()) return "[Function (anonymous)]";
    return "[Function: " + text + "]";
  }

  std::string FormatError(v8::Local<v8::Context> ctx, v8::Local<v8::Object> error) {
    // stack 可能被改写成会抛异常的 getter
    v8::TryCatch try_catch(isolate);
    v8::Local<v8::Value> stack;
    if (error->Get(ctx, V8Str(isolate, "stack")).ToLocal(&stack) && stack->IsString()) {
      return ToUtf8(isolate, stack);
    }
    try_catch.Reset();
    return SafeToString(isolate, error);  // 退回 Error.prototype.toString
  }

  static void ConsoleCallback(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::HandleScope scope(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();

    std::string message;
    {
      // 总保险：格式化过程中无论发生什么，console.* 都不向 JS 抛异常。
      // 运行时不使用 TerminateExecution，这里不会吞掉终止执行的异常。
      v8::TryCatch try_catch(isolate);
      for (int i = 0; i < info.Length(); i++) {
        if (i > 0) message += ' ';
        message += self->Format(ctx, info[i]);
      }
      if (try_catch.HasCaught()) try_catch.Reset();
    }
    auto level = static_cast<LogLevel>(info.Data().As<v8::Int32>()->Value());
    if (self->host.log) self->host.log(level, message);
  }

  // ---------- 原生数据桥 ----------
  // 内置脚本（nacre:internal/nacre.js）通过它取原生数据，用完就把这个对象删掉。
  // 只放最小限度的取值函数，上层 API 的形状全部在 JS 里定义。

  static void NativeInfoJSON(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    std::string json = self->host.app_info_json ? self->host.app_info_json() : "{}";
    info.GetReturnValue().Set(Utf8(isolate, json));
  }

  static void NativeEnvironmentJSON(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    std::string json =
        self->host.app_environment_json ? self->host.app_environment_json() : "{}";
    info.GetReturnValue().Set(Utf8(isolate, json));
  }

  // JS 调用 → 立刻返回一个 Promise → 宿主在主线程执行 → 完成后 SettleBool 兑现
  static void NativeOpenURL(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();

    v8::Local<v8::Promise::Resolver> resolver;
    if (!v8::Promise::Resolver::New(ctx).ToLocal(&resolver)) return;
    info.GetReturnValue().Set(resolver->GetPromise());

    if (!self->host.open_url) {
      (void)resolver->Resolve(ctx, v8::Boolean::New(isolate, false));
      return;
    }
    std::string url =
        info.Length() > 0 ? SafeToString(isolate, info[0]) : std::string();
    int id = self->next_call_id++;
    self->pending_calls[id].Reset(isolate, resolver);
    self->host.open_url(url, id);
  }

  static void NativeSetIdleTimerDisabled(const v8::FunctionCallbackInfo<v8::Value>& info) {
    Impl* self = From(info.GetIsolate());
    if (self->host.set_idle_timer_disabled && info.Length() > 0) {
      self->host.set_idle_timer_disabled(info[0]->BooleanValue(info.GetIsolate()));
    }
  }

  static void NativeSetEventSink(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    if (info.Length() > 0 && info[0]->IsFunction()) {
      self->event_sink.Reset(isolate, info[0].As<v8::Function>());
    }
  }

  // 把一个事件送进 JS 的 application。返回 true 表示 JS 调了 preventDefault，
  // 调用方应当跳过默认动作（对错误类事件来说就是不打默认日志）。
  // 必须已经进入 isolate、handle scope 和 context。
  bool DispatchToJS(v8::Local<v8::Context> ctx, const char* type,
                    v8::Local<v8::Value> payload) {
    if (event_sink.IsEmpty()) return false;
    v8::TryCatch try_catch(isolate);
    v8::Local<v8::Value> argv[] = {V8Str(isolate, type), payload};
    v8::Local<v8::Value> result;
    if (!event_sink.Get(isolate)->Call(ctx, ctx->Global(), 2, argv).ToLocal(&result)) {
      // 派发本身出错就当没人处理，退回默认日志，避免错误被静默吞掉
      try_catch.Reset();
      return false;
    }
    return result->IsFalse();
  }

  // 包装对象被 GC 时调用。只做 C++ 侧的清理，不碰 JS。
  static void WrapperCollected(const v8::WeakCallbackInfo<HandleKey>& info) {
    HandleKey* key = info.GetParameter();
    key->impl->ReleaseHandle(key->handle);
    delete key;
  }

  void ReleaseHandle(int handle) {
    auto it = handle_to_ptr.find(handle);
    if (it == handle_to_ptr.end()) return;
    void* ptr = it->second;
    ptr_to_handle.erase(ptr);
    handle_to_ptr.erase(it);
    wrappers.erase(handle);
    if (host.release_native) host.release_native(ptr);
  }

  // 取或建一个原生对象的 JS 包装。同一个原生指针永远返回同一个 JS 对象，
  // 这样 === 和挂在包装上的自定义属性才成立。
  // 这个原生对象现在有没有活着的包装。派发事件前问一句：没有的话
  // WrapNative 会现建一个，挂在旧包装上的监听器已经跟着旧包装没了
  bool HasWrapper(void* ptr) {
    auto existing = ptr_to_handle.find(ptr);
    return existing != ptr_to_handle.end() &&
           wrappers.find(existing->second) != wrappers.end();
  }

  v8::Local<v8::Object> WrapNative(v8::Local<v8::Context> ctx,
                                   const NativeObjectRef& ref) {
    if (ref.ptr == nullptr || wrapper_factory.IsEmpty()) return {};

    auto existing = ptr_to_handle.find(ref.ptr);
    if (existing != ptr_to_handle.end()) {
      auto w = wrappers.find(existing->second);
      if (w != wrappers.end()) return w->second.Get(isolate);
    }

    int handle = next_handle++;
    if (host.retain_native) host.retain_native(ref.ptr);

    v8::TryCatch try_catch(isolate);
    v8::Local<v8::Value> argv[] = {Utf8(isolate, ref.class_name),
                                   v8::Integer::New(isolate, handle)};
    v8::Local<v8::Value> result;
    if (!wrapper_factory.Get(isolate)
             ->Call(ctx, ctx->Global(), 2, argv)
             .ToLocal(&result) ||
        !result->IsObject()) {
      try_catch.Reset();
      if (host.release_native) host.release_native(ref.ptr);
      return {};
    }

    v8::Local<v8::Object> wrapper = result.As<v8::Object>();
    handle_to_ptr[handle] = ref.ptr;
    ptr_to_handle[ref.ptr] = handle;
    auto& global = wrappers[handle];
    global.Reset(isolate, wrapper);
    global.SetWeak(new HandleKey{this, handle}, WrapperCollected,
                   v8::WeakCallbackType::kParameter);
    return wrapper;
  }

  void* PtrForHandle(const v8::FunctionCallbackInfo<v8::Value>& info, int index) {
    if (info.Length() <= index || !info[index]->IsInt32()) return nullptr;
    auto it = handle_to_ptr.find(info[index].As<v8::Int32>()->Value());
    return it == handle_to_ptr.end() ? nullptr : it->second;
  }

  static void NativeSetWrapperFactory(const v8::FunctionCallbackInfo<v8::Value>& info) {
    Impl* self = From(info.GetIsolate());
    if (info.Length() > 0 && info[0]->IsFunction()) {
      self->wrapper_factory.Reset(info.GetIsolate(), info[0].As<v8::Function>());
    }
  }

  static void NativeScenes(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    std::vector<NativeObjectRef> refs =
        self->host.app_scenes ? self->host.app_scenes() : std::vector<NativeObjectRef>{};
    v8::Local<v8::Array> list = v8::Array::New(isolate, static_cast<int>(refs.size()));
    uint32_t index = 0;
    for (const NativeObjectRef& ref : refs) {
      v8::Local<v8::Object> wrapper = self->WrapNative(ctx, ref);
      if (wrapper.IsEmpty()) continue;
      list->Set(ctx, index++, wrapper).Check();
    }
    info.GetReturnValue().Set(list);
  }

  static void NativeSetObjectEventSink(const v8::FunctionCallbackInfo<v8::Value>& info) {
    Impl* self = From(info.GetIsolate());
    if (info.Length() > 0 && info[0]->IsFunction()) {
      self->object_event_sink.Reset(info.GetIsolate(), info[0].As<v8::Function>());
    }
  }

  // 通用属性读：(handle, name) -> JSON 文本，由 JS 侧 parse
  static void NativeGetProperty(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    void* ptr = self->PtrForHandle(info, 0);
    std::string name = info.Length() > 1 ? SafeToString(isolate, info[1]) : std::string();
    std::string json = (ptr && self->host.read_property)
                           ? self->host.read_property(ptr, name)
                           : std::string("null");
    info.GetReturnValue().Set(Utf8(isolate, json));
  }

  // 通用属性写：(handle, name, jsonValue)
  static void NativeSetProperty(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.write_property || info.Length() < 3) return;
    std::string error;
    self->host.write_property(ptr, SafeToString(isolate, info[1]),
                              SafeToString(isolate, info[2]), &error);
    Rejected(isolate, error);
  }

  // 属性值本身是原生对象：(handle, name) -> 包装对象或 null
  static void NativeGetObjectProperty(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.read_object_property) return;
    NativeObjectRef ref =
        self->host.read_object_property(ptr, SafeToString(isolate, info[1]));
    v8::Local<v8::Object> wrapper = self->WrapNative(ctx, ref);
    if (!wrapper.IsEmpty()) info.GetReturnValue().Set(wrapper);
  }

  // 把一个已经存在的 JS 对象和一个原生指针绑定起来。
  // 和 WrapNative 方向相反：那边是原生对象先有、JS 包装后建；
  // 这边是 JS 对象先有（constructor 里的 this）、原生对象后建。
  int BindWrapper(v8::Local<v8::Object> wrapper, void* ptr) {
    int handle = next_handle++;
    if (host.retain_native) host.retain_native(ptr);
    handle_to_ptr[handle] = ptr;
    ptr_to_handle[ptr] = handle;
    auto& global = wrappers[handle];
    global.Reset(isolate, wrapper);
    global.SetWeak(new HandleKey{this, handle}, WrapperCollected,
                   v8::WeakCallbackType::kParameter);
    return handle;
  }

  // JS 构造原生对象：(className, [handle...], thisObject) -> handle
  // 句柄数组 → 指针数组。非整数或查不到的位置留 nullptr，
  // 这样对象参数和非对象参数能按同一套下标对齐。
  std::vector<void*> HandlesToPtrs(v8::Local<v8::Context> ctx,
                                   v8::Local<v8::Value> value) {
    std::vector<void*> ptrs;
    if (!value->IsArray()) return ptrs;
    v8::Local<v8::Array> list = value.As<v8::Array>();
    for (uint32_t i = 0; i < list->Length(); i++) {
      v8::Local<v8::Value> item;
      if (!list->Get(ctx, i).ToLocal(&item) || !item->IsInt32()) {
        ptrs.push_back(nullptr);
        continue;
      }
      auto it = handle_to_ptr.find(item.As<v8::Int32>()->Value());
      ptrs.push_back(it == handle_to_ptr.end() ? nullptr : it->second);
    }
    return ptrs;
  }

  static void NativeConstruct(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    // (className, argsJSON, handles, wrapper)
    if (info.Length() < 4 || !info[3]->IsObject() || !self->host.construct_native) return;

    std::vector<void*> args = self->HandlesToPtrs(ctx, info[2]);

    std::string error;
    NativeObjectRef ref = self->host.construct_native(
        SafeToString(isolate, info[0]), SafeToString(isolate, info[1]), args, &error);
    if (Rejected(isolate, error)) return;
    if (ref.ptr == nullptr) return;
    info.GetReturnValue().Set(self->BindWrapper(info[3].As<v8::Object>(), ref.ptr));
  }

  // 写一个值为原生对象的属性：(handle, name, valueHandle)。valueHandle 为 0 表示 null
  // 可写的原生对象数组属性。和写单个对象的区别只有「一个句柄」变成
  // 「一串句柄」，所以复用 HandlesToPtrs——和方法的数组参数同一条路。
  static void NativeSetObjectArrayProperty(
      const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.write_object_array_property || info.Length() < 3) return;
    std::string error;
    self->host.write_object_array_property(
        ptr, SafeToString(isolate, info[1]), self->HandlesToPtrs(ctx, info[2]), &error);
    Rejected(isolate, error);
  }

  static void NativeSetObjectProperty(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.write_object_property || info.Length() < 3) return;
    void* value = self->PtrForHandle(info, 2);
    std::string error;
    self->host.write_object_property(ptr, SafeToString(isolate, info[1]), value, &error);
    Rejected(isolate, error);
  }

  // 带参数的类方法，返回原生对象
  // 宿主拒绝了这次写入或调用：没有这个属性，或者值不被接受。统一抛
  // TypeError——Web IDL 的 enum 参数给错值也是 TypeError。
  static bool Rejected(v8::Isolate* isolate, const std::string& error) {
    if (error.empty()) return false;
    isolate->ThrowException(v8::Exception::TypeError(Utf8(isolate, error)));
    return true;
  }

  // 异步读原生对象的内容，返回 Promise
  static void NativeReadObjectAsync(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.read_object_async || info.Length() < 2) return;
    v8::Local<v8::Promise::Resolver> resolver;
    if (!v8::Promise::Resolver::New(ctx).ToLocal(&resolver)) return;
    const int call_id = self->next_call_id++;
    self->pending_calls[call_id].Reset(isolate, resolver);
    self->host.read_object_async(ptr, SafeToString(isolate, info[1]), call_id);
    info.GetReturnValue().Set(resolver->GetPromise());
  }

  // new Blob(parts, { type })。parts 里字符串直接过 JSON，
  // ArrayBuffer / TypedArray 的字节按下标单独传指针，避免多一次拷贝。
  static void NativeCreateBlob(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.create_blob || info.Length() < 3 || !info[0]->IsArray()) return;

    v8::Local<v8::Array> parts = info[0].As<v8::Array>();
    const uint32_t count = parts->Length();
    std::vector<std::pair<const void*, size_t>> buffers(count, {nullptr, 0});
    v8::Local<v8::Array> json_parts = v8::Array::New(isolate, count);
    for (uint32_t i = 0; i < count; i++) {
      v8::Local<v8::Value> item;
      if (!parts->Get(ctx, i).ToLocal(&item)) continue;
      if (item->IsArrayBufferView()) {
        v8::Local<v8::ArrayBufferView> view = item.As<v8::ArrayBufferView>();
        std::shared_ptr<v8::BackingStore> store = view->Buffer()->GetBackingStore();
        buffers[i] = {static_cast<const uint8_t*>(store->Data()) + view->ByteOffset(),
                      view->ByteLength()};
        json_parts->Set(ctx, i, v8::Null(isolate)).Check();
      } else if (item->IsArrayBuffer()) {
        std::shared_ptr<v8::BackingStore> store =
            item.As<v8::ArrayBuffer>()->GetBackingStore();
        buffers[i] = {store->Data(), store->ByteLength()};
        json_parts->Set(ctx, i, v8::Null(isolate)).Check();
      } else {
        json_parts->Set(ctx, i, item).Check();  // 字符串等走 JSON
      }
    }
    v8::Local<v8::String> json;
    if (!v8::JSON::Stringify(ctx, json_parts).ToLocal(&json)) return;
    NativeObjectRef ref = self->host.create_blob(
        SafeToString(isolate, json), buffers, SafeToString(isolate, info[1]));
    if (ref.ptr == nullptr || !info[2]->IsObject()) return;
    // 第三个参数是 JS 那边正在构造的 Blob（this）。把它**本身**绑成这个原生
    // 对象的包装，返回句柄——和 construct 是同一个做法。
    //
    // 以前这里用 WrapNative 另建一个包装交回去，JS 只从上面抄走句柄的数值。
    // 那个包装没人拿着，被 GC 回收时 ReleaseHandle 把句柄和原生数据一起放掉，
    // 而用户手里的 Blob 还活着：size 读出来是 null。
    info.GetReturnValue().Set(self->BindWrapper(info[2].As<v8::Object>(), ref.ptr));
  }

  // fetch 的三个入口。真正的活在宿主那边，这里只过参数。
  static void NativeFetchStart(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.fetch_start || info.Length() < 2) return;

    v8::Local<v8::Promise::Resolver> resolver;
    if (!v8::Promise::Resolver::New(ctx).ToLocal(&resolver)) return;
    const int call_id = self->next_call_id++;
    self->pending_calls[call_id].Reset(isolate, resolver);

    // 第三个参数是请求体那个 Blob 的句柄，没有 body 时是 0（查不到，得到空指针）
    const int request_id = self->host.fetch_start(
        SafeToString(isolate, info[0]), SafeToString(isolate, info[1]),
        self->PtrForHandle(info, 2), call_id);
    // 返回 [promise, requestId]：JS 侧要拿 requestId 去读 body 和取消
    v8::Local<v8::Array> pair = v8::Array::New(isolate, 2);
    pair->Set(ctx, 0, resolver->GetPromise()).Check();
    pair->Set(ctx, 1, v8::Integer::New(isolate, request_id)).Check();
    info.GetReturnValue().Set(pair);
  }

  static void NativeFetchReadBody(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.fetch_read_body || info.Length() < 2) return;

    v8::Local<v8::Promise::Resolver> resolver;
    if (!v8::Promise::Resolver::New(ctx).ToLocal(&resolver)) return;
    const int call_id = self->next_call_id++;
    self->pending_calls[call_id].Reset(isolate, resolver);
    self->host.fetch_read_body(info[0]->Int32Value(ctx).FromMaybe(0),
                               SafeToString(isolate, info[1]), call_id);
    info.GetReturnValue().Set(resolver->GetPromise());
  }

  static void NativeFetchCancel(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.fetch_cancel || info.Length() < 1) return;
    self->host.fetch_cancel(info[0]->Int32Value(ctx).FromMaybe(0));
  }

  static void NativeFetchRelease(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.fetch_release || info.Length() < 1) return;
    self->host.fetch_release(info[0]->Int32Value(ctx).FromMaybe(0));
  }

  // crypto.getRandomValues 的底座。参数检查（是不是整数类型数组、有没有
  // 超过 65536 字节）在 JS 侧做完了，这里只负责把视图覆盖的那段字节填满。
  // 注意是**视图的范围**：byteOffset 和 byteLength 都要算，不是整个 buffer
  static void NativeRandomFill(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    info.GetReturnValue().Set(false);
    if (!self->host.fill_random || info.Length() < 1 || !info[0]->IsArrayBufferView()) return;
    v8::Local<v8::ArrayBufferView> view = info[0].As<v8::ArrayBufferView>();
    const size_t length = view->ByteLength();
    if (length == 0) {
      info.GetReturnValue().Set(true);
      return;
    }
    std::shared_ptr<v8::BackingStore> store = view->Buffer()->GetBackingStore();
    uint8_t* bytes = static_cast<uint8_t*>(store->Data()) + view->ByteOffset();
    info.GetReturnValue().Set(self->host.fill_random(bytes, length));
  }

  // URL 解析。字符串进，各部分的 JSON 出；解析不了返回 null。
  static void NativeParseURL(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    if (!self->host.parse_url || info.Length() < 2) return;
    const std::string json = self->host.parse_url(SafeToString(isolate, info[0]),
                                                  SafeToString(isolate, info[1]));
    if (json.empty()) return;  // JS 侧收到 undefined，当作解析失败
    info.GetReturnValue().Set(Utf8(isolate, json));
  }

  // setTimeout / setInterval 的底座。参数处理（额外参数透传、类型检查）
  // 在 nacre.js 里做，这里只认 (Function, number, boolean)。
  static void NativeAddTimer(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (info.Length() < 3 || !info[0]->IsFunction()) return;
    const double delay = info[1]->NumberValue(ctx).FromMaybe(0.0);
    const int id = self->AddTimer(info[0].As<v8::Function>(), delay,
                                  info[2]->BooleanValue(isolate));
    info.GetReturnValue().Set(id);
  }

  // performance.now()：从引擎启动算起的毫秒数，带小数，单调递增。
  // 不做任何降精度——那是浏览器为了防计时攻击加的，我们的 JS 是开发者自己
  // 打进包里的（原则 8）
  static void NativeNow(const v8::FunctionCallbackInfo<v8::Value>& info) {
    Impl* self = From(info.GetIsolate());
    info.GetReturnValue().Set(NowMs() - self->origin_mono_ms);
  }

  static void NativeTimeOrigin(const v8::FunctionCallbackInfo<v8::Value>& info) {
    Impl* self = From(info.GetIsolate());
    info.GetReturnValue().Set(self->origin_wall_ms);
  }

  static void NativeRemoveTimer(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (info.Length() < 1) return;
    self->RemoveTimer(info[0]->Int32Value(ctx).FromMaybe(0));
  }

  static void NativeClassCall(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.call_class_object_method || info.Length() < 4) return;
    std::string error;
    NativeObjectRef ref = self->host.call_class_object_method(
        SafeToString(isolate, info[0]), SafeToString(isolate, info[1]),
        SafeToString(isolate, info[2]), self->HandlesToPtrs(ctx, info[3]), &error);
    if (Rejected(isolate, error)) return;
    v8::Local<v8::Object> wrapper = self->WrapNative(ctx, ref);
    if (!wrapper.IsEmpty()) info.GetReturnValue().Set(wrapper);
  }

  // 返回值不是原生对象的类方法，比如 CATransaction.begin()
  static void NativeClassCallValue(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.call_class_method || info.Length() < 4) return;
    std::string error;
    std::string result = self->host.call_class_method(
        SafeToString(isolate, info[0]), SafeToString(isolate, info[1]),
        SafeToString(isolate, info[2]), self->HandlesToPtrs(ctx, info[3]), &error);
    if (Rejected(isolate, error)) return;
    info.GetReturnValue().Set(
        v8::String::NewFromUtf8(isolate, result.c_str()).ToLocalChecked());
  }

  // 带参数的方法，返回值用 JSON 编码
  static void NativeCall(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.call_method || info.Length() < 4) return;
    std::string error;
    std::string result = self->host.call_method(
        ptr, SafeToString(isolate, info[1]), SafeToString(isolate, info[2]),
        self->HandlesToPtrs(ctx, info[3]), &error);
    if (Rejected(isolate, error)) return;
    info.GetReturnValue().Set(
        v8::String::NewFromUtf8(isolate, result.c_str()).ToLocalChecked());
  }

  // 带参数的方法，返回值是原生对象
  static void NativeCallObject(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.call_object_method || info.Length() < 4) return;
    std::string error;
    NativeObjectRef ref = self->host.call_object_method(
        ptr, SafeToString(isolate, info[1]), SafeToString(isolate, info[2]),
        self->HandlesToPtrs(ctx, info[3]), &error);
    if (Rejected(isolate, error)) return;
    v8::Local<v8::Object> wrapper = self->WrapNative(ctx, ref);
    if (!wrapper.IsEmpty()) info.GetReturnValue().Set(wrapper);
  }

  // 属性值是原生对象数组，比如 subviews
  // 订阅或取消订阅某个对象的某类事件：(handle, type, on)
  static void NativeSubscribe(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.set_event_subscription || info.Length() < 3) return;
    std::string error;
    self->host.set_event_subscription(ptr, SafeToString(isolate, info[1]),
                                      info[2]->BooleanValue(isolate), &error);
    Rejected(isolate, error);
  }

  // 返回原生对象数组的方法。和 NativeObjectArrayProperty 的区别只是带参数，
  // 所以也带 error 出参——「没命中」返回空数组，「你问错了」抛 TypeError。
  static void NativeCallObjectArray(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.call_object_array_method || info.Length() < 4) return;
    std::string error;
    std::vector<NativeObjectRef> refs = self->host.call_object_array_method(
        ptr, SafeToString(isolate, info[1]), SafeToString(isolate, info[2]),
        self->HandlesToPtrs(ctx, info[3]), &error);
    if (Rejected(isolate, error)) return;
    v8::Local<v8::Array> out = v8::Array::New(isolate, (int)refs.size());
    for (uint32_t i = 0; i < refs.size(); i++) {
      v8::Local<v8::Object> wrapper = self->WrapNative(ctx, refs[i]);
      if (wrapper.IsEmpty()) continue;
      if (out->Set(ctx, i, wrapper).IsNothing()) return;
    }
    info.GetReturnValue().Set(out);
  }

  static void NativeObjectArrayProperty(
      const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.read_object_array_property) return;
    std::vector<NativeObjectRef> refs =
        self->host.read_object_array_property(ptr, SafeToString(isolate, info[1]));
    v8::Local<v8::Array> out = v8::Array::New(isolate, (int)refs.size());
    for (uint32_t i = 0; i < refs.size(); i++) {
      v8::Local<v8::Object> wrapper = self->WrapNative(ctx, refs[i]);
      if (wrapper.IsEmpty()) continue;
      if (out->Set(ctx, i, wrapper).IsNothing()) return;
    }
    info.GetReturnValue().Set(out);
  }

  // 类级属性：(className, name) -> 包装对象或 undefined
  static void NativeClassObjectProperty(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (!self->host.read_class_object_property || info.Length() < 2) return;
    NativeObjectRef ref = self->host.read_class_object_property(
        SafeToString(isolate, info[0]), SafeToString(isolate, info[1]));
    v8::Local<v8::Object> wrapper = self->WrapNative(ctx, ref);
    if (!wrapper.IsEmpty()) info.GetReturnValue().Set(wrapper);
  }

  static void NativeCallVoid(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.call_void_method) return;
    std::string error;
    self->host.call_void_method(ptr, SafeToString(isolate, info[1]), &error);
    Rejected(isolate, error);
  }

  // 异步方法：(handle, name, jsonArgs) -> Promise<boolean>
  static void NativeCallAsync(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();

    v8::Local<v8::Promise::Resolver> resolver;
    if (!v8::Promise::Resolver::New(ctx).ToLocal(&resolver)) return;
    info.GetReturnValue().Set(resolver->GetPromise());

    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.call_async) {
      (void)resolver->Resolve(ctx, v8::Boolean::New(isolate, false));
      return;
    }
    int id = self->next_call_id++;
    self->pending_calls[id].Reset(isolate, resolver);
    self->host.call_async(
        ptr, SafeToString(isolate, info[1]),
        info.Length() > 2 ? SafeToString(isolate, info[2]) : "[]",
        info.Length() > 3 ? self->HandlesToPtrs(ctx, info[3]) : std::vector<void*>{},
        id);
  }

  void InstallNativeBridge(v8::Local<v8::Context> ctx) {
    v8::Local<v8::Object> bridge = v8::Object::New(isolate);
    struct Entry {
      const char* name;
      v8::FunctionCallback fn;
    };
    const Entry entries[] = {
        {"infoJSON", NativeInfoJSON},
        {"environmentJSON", NativeEnvironmentJSON},
        {"openURL", NativeOpenURL},
        {"setIdleTimerDisabled", NativeSetIdleTimerDisabled},
        {"setEventSink", NativeSetEventSink},
        {"setWrapperFactory", NativeSetWrapperFactory},
        {"scenes", NativeScenes},
        {"setObjectEventSink", NativeSetObjectEventSink},
        {"getProp", NativeGetProperty},
        {"setProp", NativeSetProperty},
        {"getObjProp", NativeGetObjectProperty},
        {"setObjProp", NativeSetObjectProperty},
        {"construct", NativeConstruct},
        {"callVoid", NativeCallVoid},
        {"classObjProp", NativeClassObjectProperty},
        {"classCall", NativeClassCall},
        {"classCallValue", NativeClassCallValue},
        {"parseURL", NativeParseURL},
        {"readObjectAsync", NativeReadObjectAsync},
        {"createBlob", NativeCreateBlob},
        {"fetchStart", NativeFetchStart},
        {"fetchReadBody", NativeFetchReadBody},
        {"fetchCancel", NativeFetchCancel},
        {"fetchRelease", NativeFetchRelease},
        {"addTimer", NativeAddTimer},
        {"removeTimer", NativeRemoveTimer},
        {"now", NativeNow},
        {"randomFill", NativeRandomFill},
        {"timeOrigin", NativeTimeOrigin},
        {"call", NativeCall},
        {"callObj", NativeCallObject},
        {"getObjArray", NativeObjectArrayProperty},
        {"setObjArray", NativeSetObjectArrayProperty},
        {"callObjArray", NativeCallObjectArray},
        {"subscribe", NativeSubscribe},
        {"callAsync", NativeCallAsync},
    };
    for (const Entry& e : entries) {
      v8::Local<v8::Function> fn = v8::Function::New(ctx, e.fn).ToLocalChecked();
      bridge->Set(ctx, V8Str(isolate, e.name), fn).Check();
    }
    ctx->Global()->Set(ctx, V8Str(isolate, "__nacre_native"), bridge).Check();
  }

  void InstallConsole(v8::Local<v8::Context> ctx) {
    v8::Local<v8::Object> console = v8::Object::New(isolate);
    struct Entry {
      const char* name;
      LogLevel level;
    };
    const Entry entries[] = {
        {"debug", LogLevel::Debug}, {"log", LogLevel::Log},     {"info", LogLevel::Info},
        {"warn", LogLevel::Warn},   {"error", LogLevel::Error},
    };
    for (const Entry& e : entries) {
      v8::Local<v8::Value> data = v8::Int32::New(isolate, static_cast<int>(e.level));
      v8::Local<v8::Function> fn =
          v8::Function::New(ctx, ConsoleCallback, data).ToLocalChecked();
      console->Set(ctx, V8Str(isolate, e.name), fn).Check();
    }
    ctx->Global()->Set(ctx, V8Str(isolate, "console"), console).Check();
  }

  // ---------- 未处理的 Promise 拒绝 ----------
  // 和 Node、浏览器一样的骨架：拒绝时登记到待定表，后来挂上 handler 时撤销，
  // 等微任务队列排空之后才把剩下的报出来。这样不会误报同一轮里稍后才 catch 的写法。

  static void PromiseRejectCallback(v8::PromiseRejectMessage message) {
    // 这个回调是裸函数指针，没有 isolate 参数
    v8::Isolate* isolate = v8::Isolate::GetCurrent();
    if (isolate == nullptr) return;
    Impl* self = From(isolate);
    if (self == nullptr) return;

    v8::HandleScope scope(isolate);
    switch (message.GetEvent()) {
      case v8::kPromiseRejectWithNoHandler:
        self->AddRejection(message.GetPromise(), message.GetValue());
        break;
      case v8::kPromiseHandlerAddedAfterReject:
        self->RemoveRejection(message.GetPromise());
        break;
      // Node 曾用这两个事件做 multipleResolves，因为 Promise.race() 这类正常写法
      // 会误触发，已经废弃。这里一并忽略。
      case v8::kPromiseRejectAfterResolved:
      case v8::kPromiseResolveAfterResolved:
        break;
    }
  }

  void AddRejection(v8::Local<v8::Promise> promise, v8::Local<v8::Value> value) {
    PendingRejection pending;
    pending.promise.Reset(isolate, promise);
    pending.value.Reset(isolate, value);
    pending_rejections.push_back(std::move(pending));
  }

  void RemoveRejection(v8::Local<v8::Promise> promise) {
    for (auto it = pending_rejections.begin(); it != pending_rejections.end(); ++it) {
      if (promise == it->promise) {
        pending_rejections.erase(it);
        return;
      }
    }
  }

  // 只能在微任务队列排空之后调用：这时还留在表里的，才是真的没人处理。
  void FlushRejections() {
    if (pending_rejections.empty()) return;
    // 必须自己进 isolate：这个函数现在有两条调用路径——同步的（JS 调用栈
    // 上，外层已经有 Isolate::Scope）和异步的（post_task 投递过来的，什么
    // scope 都没有）。嵌套进入是安全的，缺了就会在 Context::Enter 里段错误。
    v8::Isolate::Scope isolate_scope(isolate);
    // 先取走：上报过程中（JSON.stringify、toString）可能又产生新的拒绝，
    // 那些留给下一次结算。
    std::vector<PendingRejection> pending;
    pending.swap(pending_rejections);

    v8::HandleScope scope(isolate);
    v8::Local<v8::Context> ctx = context.Get(isolate);
    v8::Context::Scope context_scope(ctx);
    v8::TryCatch try_catch(isolate);
    for (PendingRejection& item : pending) {
      v8::Local<v8::Value> reason = item.value.Get(isolate);
      // 这里是 JS 线程上的同步派发，拿得到返回值，所以这个事件可以被取消
      v8::Local<v8::Object> payload = v8::Object::New(isolate);
      payload->Set(ctx, V8Str(isolate, "reason"), reason).Check();
      payload->Set(ctx, V8Str(isolate, "promise"), item.promise.Get(isolate)).Check();
      if (DispatchToJS(ctx, "unhandledrejection", payload)) continue;  // JS 接管了

      std::string text = "Uncaught (in promise) " + Format(ctx, reason);
      if (host.log) host.log(LogLevel::Error, text);
    }
    if (try_catch.HasCaught()) try_catch.Reset();
  }

  void ReportException(v8::Local<v8::Context> ctx, v8::TryCatch& try_catch) {
    // 先把需要的东西全部取出来，之后调用 JS 不会受 TryCatch 状态影响
    v8::Local<v8::Value> exception = try_catch.Exception();
    v8::Local<v8::Message> message = try_catch.Message();
    std::string summary;
    std::string file;
    int line = 0;
    std::string text;
    if (!message.IsEmpty()) {
      file = ToUtf8(isolate, message->GetScriptResourceName());
      line = message->GetLineNumber(ctx).FromMaybe(0);
      summary = ToUtf8(isolate, message->Get());
      text += "Uncaught " + summary + "\n    at " + file + ":" + std::to_string(line);
    }
    v8::Local<v8::Value> stack;
    if (try_catch.StackTrace(ctx).ToLocal(&stack) && stack->IsString()) {
      text += "\n" + ToUtf8(isolate, stack);
    } else if (message.IsEmpty()) {
      summary = SafeToString(isolate, exception);
      text = "Uncaught " + summary;
    }

    // 给 JS 接管的机会。错误处理器自己出错时不再递归派发，直接走默认日志
    if (!dispatching_error) {
      dispatching_error = true;
      v8::Local<v8::Object> payload = v8::Object::New(isolate);
      payload->Set(ctx, V8Str(isolate, "message"), Utf8(isolate, summary)).Check();
      payload->Set(ctx, V8Str(isolate, "error"), exception).Check();
      payload->Set(ctx, V8Str(isolate, "filename"), Utf8(isolate, file)).Check();
      payload->Set(ctx, V8Str(isolate, "lineno"), v8::Integer::New(isolate, line)).Check();
      bool prevented = DispatchToJS(ctx, "error", payload);
      dispatching_error = false;
      if (prevented) return;
    }

    if (host.log) host.log(LogLevel::Error, text);
  }
};

void Engine::InitializeV8Once() {
  std::call_once(g_init_once, [] {
    // 预编译的 V8 是 lite mode 构建，已隐含 jitless，不要再传 --jitless（只读标志，设置会崩溃）
    // kEnabled 打开空闲任务队列：V8 会把增量 GC 这类工作排进去，
    // 等宿主调 RunIdleTasks 时才执行。默认是 kDisabled，等于没有空闲 GC。
    g_platform = v8::platform::NewDefaultPlatform(
        0, v8::platform::IdleTaskSupport::kEnabled);
    v8::V8::InitializePlatform(g_platform.get());
    v8::V8::Initialize();
  });
}

const char* Engine::V8Version() { return v8::V8::GetVersion(); }

Engine::Engine(EngineHost host) : impl_(std::make_unique<Impl>()) {
  impl_->host = std::move(host);
  impl_->allocator.reset(v8::ArrayBuffer::Allocator::NewDefaultAllocator());

  v8::Isolate::CreateParams params;
  params.array_buffer_allocator = impl_->allocator.get();
  impl_->isolate = v8::Isolate::New(params);
  impl_->isolate->SetData(0, impl_.get());
  impl_->isolate->SetPromiseRejectCallback(&Impl::PromiseRejectCallback);

  v8::Isolate::Scope isolate_scope(impl_->isolate);
  v8::HandleScope handle_scope(impl_->isolate);
  v8::Local<v8::Context> ctx = v8::Context::New(impl_->isolate);
  v8::Context::Scope context_scope(ctx);

  impl_->InstallConsole(ctx);
  impl_->InstallNativeBridge(ctx);
  impl_->context.Reset(impl_->isolate, ctx);
}

Engine::~Engine() {
  // 所有 Global 都必须在 Isolate 销毁之前释放
  impl_->event_sink.Reset();
  impl_->wrapper_factory.Reset();
  impl_->object_event_sink.Reset();
  impl_->wrappers.clear();
  for (const auto& entry : impl_->handle_to_ptr) {
    if (impl_->host.release_native) impl_->host.release_native(entry.second);
  }
  impl_->handle_to_ptr.clear();
  impl_->ptr_to_handle.clear();
  impl_->pending_calls.clear();
  impl_->pending_rejections.clear();
  impl_->context.Reset();
  impl_->isolate->Dispose();
}

bool Engine::Evaluate(const Script& script) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);

  bool ok = false;
  {
    v8::TryCatch try_catch(isolate);
    // 所有脚本都跑在严格模式下。V8 没有「强制 strict」的编译选项，所以
    // 前置一行指令——ECMAScript 规定它必须是脚本的第一条语句，没有别的
    // 开启方式。
    //
    // 为什么要强制：只读属性写入、写冻结对象，在非严格模式下是**静默
    // 失败**，严格模式才抛 TypeError；未声明的赋值在非严格模式下会悄悄
    // 建一个全局变量。这些正是运行时一路在拒绝的那类错，而 ECMAScript
    // 自己的判断就是它们该抛。
    //
    // 代价是源码多了一行，所以 ScriptOrigin 的 line_offset 设 -1 抵回来，
    // 报错行号仍和文件里的行号对得上。
    const std::string source_text = "'use strict';\n" + script.source;
    v8::Local<v8::String> source;
    if (!v8::String::NewFromUtf8(isolate, source_text.data(), v8::NewStringType::kNormal,
                                 static_cast<int>(source_text.size()))
             .ToLocal(&source)) {
      if (impl_->host.log) impl_->host.log(LogLevel::Error, "Failed to load " + script.name);
    } else {
      v8::ScriptOrigin origin(V8Str(isolate, script.name.c_str()), -1);
      v8::Local<v8::Script> compiled;
      v8::Local<v8::Value> result;
      if (!v8::Script::Compile(ctx, source, &origin).ToLocal(&compiled)) {
        impl_->ReportException(ctx, try_catch);
      } else if (!compiled->Run(ctx).ToLocal(&result)) {
        impl_->ReportException(ctx, try_catch);
      } else {
        ok = true;
      }
    }
  }

  // 微任务策略是默认的 kAuto：Run 返回时微任务已经跑完，这里可以结算拒绝。
  impl_->ScheduleRejectionFlush();
  return ok;
}

void Engine::EmitAppEvent(const std::string& type) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  if (impl_->event_sink.IsEmpty()) return;  // 内置脚本还没跑

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  {
    impl_->DispatchToJS(ctx, type.c_str(), v8::Undefined(isolate));
  }
  impl_->ScheduleRejectionFlush();
}

void Engine::EmitAppEventWithObject(const std::string& type, const std::string& key,
                                    const NativeObjectRef& ref) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  if (impl_->event_sink.IsEmpty()) return;

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  v8::Local<v8::Object> wrapper = impl_->WrapNative(ctx, ref);
  v8::Local<v8::Object> payload = v8::Object::New(isolate);
  payload
      ->Set(ctx, V8Str(isolate, key.c_str()),
            wrapper.IsEmpty() ? v8::Local<v8::Value>(v8::Null(isolate)) : wrapper)
      .Check();
  impl_->DispatchToJS(ctx, type.c_str(), payload);
  impl_->ScheduleRejectionFlush();
}

void Engine::EmitObjectEvent(const NativeObjectRef& target, const std::string& type) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  if (impl_->object_event_sink.IsEmpty()) return;

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  const bool rebuilt = !impl_->HasWrapper(target.ptr);
  v8::Local<v8::Object> wrapper = impl_->WrapNative(ctx, target);
  if (wrapper.IsEmpty()) return;
  {
    v8::TryCatch try_catch(isolate);
    // 四个参数的位置是固定的：包装、事件名、负载（没有就是 undefined）、
    // 包装是不是为这次派发现建的
    v8::Local<v8::Value> argv[] = {wrapper, Utf8(isolate, type),
                                   v8::Undefined(isolate),
                                   v8::Boolean::New(isolate, rebuilt)};
    if (impl_->object_event_sink.Get(isolate)
            ->Call(ctx, ctx->Global(), 4, argv)
            .IsEmpty()) {
      impl_->ReportException(ctx, try_catch);
    }
  }
  impl_->ScheduleRejectionFlush();
}
void Engine::EmitObjectEventWith(const NativeObjectRef& target,
                                 const std::string& type,
                                 const NativeObjectRef& payload) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  if (impl_->object_event_sink.IsEmpty()) return;

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  const bool rebuilt = !impl_->HasWrapper(target.ptr);
  v8::Local<v8::Object> wrapper = impl_->WrapNative(ctx, target);
  if (wrapper.IsEmpty()) return;
  {
    v8::TryCatch try_catch(isolate);
    v8::Local<v8::Object> extra = impl_->WrapNative(ctx, payload);
    v8::Local<v8::Value> argv[] = {
        wrapper, Utf8(isolate, type),
        extra.IsEmpty() ? v8::Local<v8::Value>(v8::Undefined(isolate))
                        : v8::Local<v8::Value>(extra),
        v8::Boolean::New(isolate, rebuilt)};
    if (impl_->object_event_sink.Get(isolate)
            ->Call(ctx, ctx->Global(), 4, argv)
            .IsEmpty()) {
      impl_->ReportException(ctx, try_catch);
    }
  }
  impl_->ScheduleRejectionFlush();
}

bool Engine::EmitObjectEventWithJSON(const NativeObjectRef& target,
                                     const std::string& type,
                                     const std::string& json) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  if (impl_->object_event_sink.IsEmpty()) return false;
  // 任何一步出了岔子（包装建不出来、sink 抛了）都按「没取消」算：
  // 默认动作照常发生，和没人监听时一样
  bool prevented = false;

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  const bool rebuilt = !impl_->HasWrapper(target.ptr);
  v8::Local<v8::Object> wrapper = impl_->WrapNative(ctx, target);
  if (wrapper.IsEmpty()) return false;
  {
    v8::TryCatch try_catch(isolate);
    // 解不出来就当没有负载。和 SettleJSON 一个处理：宁可少一个字段，
    // 也不要让一次事件派发整个失败
    v8::Local<v8::Value> extra;
    if (!v8::JSON::Parse(ctx, Utf8(isolate, json)).ToLocal(&extra)) {
      try_catch.Reset();
      extra = v8::Undefined(isolate);
    }
    v8::Local<v8::Value> argv[] = {wrapper, Utf8(isolate, type), extra,
                                   v8::Boolean::New(isolate, rebuilt)};
    v8::Local<v8::Value> result;
    if (impl_->object_event_sink.Get(isolate)
            ->Call(ctx, ctx->Global(), 4, argv)
            .ToLocal(&result)) {
      // sink 返回 true 表示监听器取消了默认动作
      prevented = result->IsTrue();
    } else {
      impl_->ReportException(ctx, try_catch);
    }
  }
  impl_->ScheduleRejectionFlush();
  return prevented;
}

void Engine::SettleBool(int call_id, bool value) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);

  auto it = impl_->pending_calls.find(call_id);
  if (it == impl_->pending_calls.end()) return;
  v8::Local<v8::Promise::Resolver> resolver = it->second.Get(isolate);
  impl_->pending_calls.erase(it);

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  {
    v8::TryCatch try_catch(isolate);
    if (resolver->Resolve(ctx, v8::Boolean::New(isolate, value)).IsNothing()) {
      try_catch.Reset();
    }
  }
  // 这里不在任何 JS 调用栈里，kAuto 不会自动排空微任务，必须显式跑一次，
  // 否则 await 后面的代码要等到下一次有 JS 执行时才继续
  isolate->PerformMicrotaskCheckpoint();
  impl_->ScheduleRejectionFlush();
}

// ---------------------------------------------------------------------------
// 异步调用的兑现
// ---------------------------------------------------------------------------

// 四个 Settle 的开头都一样：进 isolate、进 context、取 resolver。
#define NACRE_SETTLE_PROLOGUE(call_id)                       \
  v8::Isolate* isolate = impl_->isolate;                     \
  v8::Isolate::Scope isolate_scope(isolate);                 \
  v8::HandleScope handle_scope(isolate);                     \
  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);  \
  v8::Context::Scope context_scope(ctx);                     \
  v8::Local<v8::Promise::Resolver> resolver = impl_->TakePending(call_id)

void Engine::SettleJSON(int call_id, const std::string& json) {
  NACRE_SETTLE_PROLOGUE(call_id);
  if (resolver.IsEmpty()) return;
  v8::TryCatch try_catch(isolate);
  v8::Local<v8::Value> value;
  if (!v8::JSON::Parse(ctx, Utf8(isolate, json)).ToLocal(&value)) {
    try_catch.Reset();
    value = v8::Undefined(isolate);
  }
  if (resolver->Resolve(ctx, value).IsNothing()) try_catch.Reset();
  impl_->AfterSettle();
}

void Engine::SettleObject(int call_id, const NativeObjectRef& ref) {
  NACRE_SETTLE_PROLOGUE(call_id);
  if (resolver.IsEmpty()) return;
  v8::TryCatch try_catch(isolate);
  v8::Local<v8::Object> wrapper = impl_->WrapNative(ctx, ref);
  v8::Local<v8::Value> value =
      wrapper.IsEmpty() ? v8::Local<v8::Value>(v8::Null(isolate)) : wrapper;
  if (resolver->Resolve(ctx, value).IsNothing()) try_catch.Reset();
  impl_->AfterSettle();
}

void Engine::SettleBytes(int call_id, void* data, size_t byte_length,
                         void (*deleter)(void*, size_t, void*), void* deleter_info) {
  NACRE_SETTLE_PROLOGUE(call_id);
  if (resolver.IsEmpty()) {
    // 没人等了（比如请求被取消），但内存还得还回去
    if (deleter) deleter(data, byte_length, deleter_info);
    return;
  }
  v8::TryCatch try_catch(isolate);
  // 零拷贝：V8 接管这块内存，GC 回收 ArrayBuffer 时调 deleter。
  // 所以调用方把所有权交出来之后就不能再碰这块内存了。
  std::unique_ptr<v8::BackingStore> store =
      v8::ArrayBuffer::NewBackingStore(data, byte_length, deleter, deleter_info);
  v8::Local<v8::ArrayBuffer> buffer = v8::ArrayBuffer::New(isolate, std::move(store));
  if (resolver->Resolve(ctx, buffer).IsNothing()) try_catch.Reset();
  impl_->AfterSettle();
}

void Engine::RejectCall(int call_id, const std::string& name,
                        const std::string& message, const std::string& detail_json) {
  NACRE_SETTLE_PROLOGUE(call_id);
  if (resolver.IsEmpty()) return;
  v8::TryCatch try_catch(isolate);
  // TypeError 要建成真正的 TypeError 实例，不能只是改个 name——Web 规范里
  // fetch 的网络失败拒绝的就是 TypeError，用户代码会 instanceof 它。
  // 其余的（AbortError 之类）Web 用的是 DOMException，我们没有那个类，
  // 退而求其次用 Error 加 name，JS 侧靠 err.name 分辨。
  v8::Local<v8::Value> error =
      name == "TypeError" ? v8::Exception::TypeError(Utf8(isolate, message))
                          : v8::Exception::Error(Utf8(isolate, message));
  if (error->IsObject() && !name.empty() && name != "TypeError") {
    error.As<v8::Object>()
        ->Set(ctx, Utf8(isolate, "name"), Utf8(isolate, name))
        .Check();
  }
  // 映射盖不住的那部分事实原样挂上去。上层给好用的分类（err.name），
  // 底层不丢事实（err.code / err.domain）——两层 API 的分工落到错误上
  if (error->IsObject() && !detail_json.empty()) {
    v8::Local<v8::Value> detail;
    if (v8::JSON::Parse(ctx, Utf8(isolate, detail_json)).ToLocal(&detail) &&
        detail->IsObject()) {
      v8::Local<v8::Object> from = detail.As<v8::Object>();
      v8::Local<v8::Array> keys;
      if (from->GetOwnPropertyNames(ctx).ToLocal(&keys)) {
        for (uint32_t i = 0; i < keys->Length(); i++) {
          v8::Local<v8::Value> k, v;
          if (keys->Get(ctx, i).ToLocal(&k) && from->Get(ctx, k).ToLocal(&v)) {
            error.As<v8::Object>()->Set(ctx, k, v).Check();
          }
        }
      }
    } else {
      try_catch.Reset();
    }
  }
  if (resolver->Reject(ctx, error).IsNothing()) try_catch.Reset();
  impl_->AfterSettle();
}

#undef NACRE_SETTLE_PROLOGUE

// ---------------------------------------------------------------------------
// 定时器
// ---------------------------------------------------------------------------

int Engine::Impl::AddTimer(v8::Local<v8::Function> callback, double delay_ms,
                           bool repeats) {
  if (callback.IsEmpty()) return 0;
  const int id = next_timer_id++;
  TimerEntry entry;
  entry.id = id;
  entry.due_ms = NowMs() + std::max(0.0, delay_ms);
  entry.interval_ms = repeats ? std::max(0.0, delay_ms) : 0.0;
  entry.seq = next_timer_seq++;
  entry.callback.Reset(isolate, callback);
  timers.push_back(std::move(entry));
  std::push_heap(timers.begin(), timers.end(), LaterFirst{});
  ScheduleNextWakeup();
  return id;
}

void Engine::Impl::RemoveTimer(int id) {
  if (id != 0 && id == firing_timer_id) {
    // 取消的正是此刻在跑的那个，它不在堆里，只能记下来别让它重新入堆
    firing_timer_cancelled = true;
    return;
  }
  // 惰性删除：从堆中间摘元素是 O(n)，而把回调 Reset 掉就足以让它不再执行，
  // 也立刻断开对 JS 函数的强引用——不会出现「取消了还挂一小时」。
  // 空壳 entry 留在堆里，取出时跳过。
  for (TimerEntry& entry : timers) {
    if (entry.id == id) {
      entry.callback.Reset();
      break;
    }
  }
  ScheduleNextWakeup();
}

void Engine::FireDueTimers() {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);

  impl_->scheduled_wakeup_at = -1;  // 这次约定已经兑现
  impl_->firing_timers = true;

  // 防饿死：只处理「进入本轮之前」就已入堆的定时器。回调里新注册的
  // seq 更大，留给下一轮——否则 setTimeout(function f(){setTimeout(f,0)},0)
  // 会在一次唤醒里无限循环，主线程再也回不到 run loop。
  const uint64_t limit = impl_->next_timer_seq;
  const double budget_end = Impl::NowMs() + kTimerBudgetMs;

  while (!impl_->timers.empty()) {
    const Impl::TimerEntry& top = impl_->timers.front();
    if (top.callback.IsEmpty()) {  // 已取消
      std::pop_heap(impl_->timers.begin(), impl_->timers.end(), Impl::LaterFirst{});
      impl_->timers.pop_back();
      continue;
    }
    if (top.due_ms > Impl::NowMs()) break;  // 还没到期
    if (top.seq >= limit) break;            // 本轮新加的

    std::pop_heap(impl_->timers.begin(), impl_->timers.end(), Impl::LaterFirst{});
    Impl::TimerEntry entry = std::move(impl_->timers.back());
    impl_->timers.pop_back();

    const double started = Impl::NowMs();
    impl_->firing_timer_id = entry.id;
    impl_->firing_timer_cancelled = false;
    {
      v8::TryCatch try_catch(isolate);
      v8::Local<v8::Function> fn = entry.callback.Get(isolate);
      if (fn->Call(ctx, ctx->Global(), 0, nullptr).IsEmpty()) {
        impl_->ReportException(ctx, try_catch);
      }
    }
    // 每个任务之后跑一次微任务检查点——HTML 规范和 Chromium 都是这样。
    // 不能攒一批再跑，那会让 await 的续体晚一拍。
    isolate->PerformMicrotaskCheckpoint();
    impl_->firing_timer_id = 0;

    const double cost = Impl::NowMs() - started;
    if (cost > kLongTaskMs && impl_->host.log) {
      char buf[128];
      std::snprintf(buf, sizeof(buf),
                    "Timer callback blocked the main thread for %.0f ms; this frame will drop", cost);
      impl_->host.log(LogLevel::Warn, buf);
    }

    if (entry.interval_ms > 0 && !impl_->firing_timer_cancelled) {
      // setInterval：按原节奏推进，不累积漂移；落后太多就重新计时，
      // 不做补偿式连发（主线程卡过之后连打十几次没有意义）。
      entry.due_ms += entry.interval_ms;
      const double now = Impl::NowMs();
      if (entry.due_ms <= now) entry.due_ms = now + entry.interval_ms;
      entry.seq = impl_->next_timer_seq++;
      impl_->timers.push_back(std::move(entry));
      std::push_heap(impl_->timers.begin(), impl_->timers.end(), Impl::LaterFirst{});
    }

    // 预算用完就让出主线程：run loop 转一圈才能提交 CA 事务（渲染）、
    // 响应触摸、跑增量 GC。剩下的到期定时器下一轮再说。
    if (Impl::NowMs() >= budget_end) break;
  }

  impl_->firing_timers = false;
  impl_->ScheduleNextWakeup();
  impl_->ScheduleRejectionFlush();
}

void Engine::RunIdleTasks(double idle_time_in_seconds) {
  v8::Isolate::Scope isolate_scope(impl_->isolate);
  v8::platform::RunIdleTasks(g_platform.get(), impl_->isolate, idle_time_in_seconds);
}

void Engine::PumpMessageLoop() {
  v8::Isolate::Scope isolate_scope(impl_->isolate);
  while (v8::platform::PumpMessageLoop(g_platform.get(), impl_->isolate)) {
  }
  impl_->ScheduleRejectionFlush();
}

}  // namespace nacre
