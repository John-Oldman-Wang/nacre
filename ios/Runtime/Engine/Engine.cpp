#include "Engine.h"

// 这里不给 V8 预设任何编译宏：v8config.h 自己就能推导出 V8_TARGET_ARCH_ARM64
// 和 V8_TARGET_OS_IOS；而真正决定对象布局的 V8_COMPRESS_POINTERS、
// V8_ENABLE_SANDBOX 在这个预编译包里是关闭的，使用方也不定义，两边正好一致。
// 换 V8 构建时必须重新核对这两个宏——不一致会导致对象布局不匹配而崩溃。
#include <libplatform/libplatform.h>
#include <v8.h>

#include <cmath>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

namespace nacre {

namespace {

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
    self->host.write_property(ptr, SafeToString(isolate, info[1]),
                              SafeToString(isolate, info[2]));
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
  static void NativeConstruct(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    if (info.Length() < 3 || !info[2]->IsObject() || !self->host.construct_native) return;

    std::vector<void*> args;
    if (info[1]->IsArray()) {
      v8::Local<v8::Array> list = info[1].As<v8::Array>();
      for (uint32_t i = 0; i < list->Length(); i++) {
        v8::Local<v8::Value> item;
        if (!list->Get(ctx, i).ToLocal(&item) || !item->IsInt32()) {
          args.push_back(nullptr);
          continue;
        }
        auto it = self->handle_to_ptr.find(item.As<v8::Int32>()->Value());
        args.push_back(it == self->handle_to_ptr.end() ? nullptr : it->second);
      }
    }

    NativeObjectRef ref = self->host.construct_native(SafeToString(isolate, info[0]), args);
    if (ref.ptr == nullptr) return;
    info.GetReturnValue().Set(self->BindWrapper(info[2].As<v8::Object>(), ref.ptr));
  }

  // 写一个值为原生对象的属性：(handle, name, valueHandle)。valueHandle 为 0 表示 null
  static void NativeSetObjectProperty(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Isolate* isolate = info.GetIsolate();
    Impl* self = From(isolate);
    void* ptr = self->PtrForHandle(info, 0);
    if (!ptr || !self->host.write_object_property || info.Length() < 3) return;
    void* value = self->PtrForHandle(info, 2);
    self->host.write_object_property(ptr, SafeToString(isolate, info[1]), value);
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
    self->host.call_void_method(ptr, SafeToString(isolate, info[1]));
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
    self->host.call_async(ptr, SafeToString(isolate, info[1]),
                          info.Length() > 2 ? SafeToString(isolate, info[2]) : "[]", id);
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
    v8::Local<v8::String> source;
    if (!v8::String::NewFromUtf8(isolate, script.source.data(), v8::NewStringType::kNormal,
                                 static_cast<int>(script.source.size()))
             .ToLocal(&source)) {
      if (impl_->host.log) impl_->host.log(LogLevel::Error, "Failed to load " + script.name);
    } else {
      v8::ScriptOrigin origin(V8Str(isolate, script.name.c_str()));
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
  impl_->FlushRejections();
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
  impl_->FlushRejections();
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
  impl_->FlushRejections();
}

void Engine::EmitObjectEvent(const NativeObjectRef& target, const std::string& type) {
  v8::Isolate* isolate = impl_->isolate;
  v8::Isolate::Scope isolate_scope(isolate);
  v8::HandleScope handle_scope(isolate);
  if (impl_->object_event_sink.IsEmpty()) return;

  v8::Local<v8::Context> ctx = impl_->context.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  v8::Local<v8::Object> wrapper = impl_->WrapNative(ctx, target);
  if (wrapper.IsEmpty()) return;
  {
    v8::TryCatch try_catch(isolate);
    v8::Local<v8::Value> argv[] = {wrapper, Utf8(isolate, type)};
    if (impl_->object_event_sink.Get(isolate)
            ->Call(ctx, ctx->Global(), 2, argv)
            .IsEmpty()) {
      impl_->ReportException(ctx, try_catch);
    }
  }
  impl_->FlushRejections();
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
  impl_->FlushRejections();
}

void Engine::RunIdleTasks(double idle_time_in_seconds) {
  v8::Isolate::Scope isolate_scope(impl_->isolate);
  v8::platform::RunIdleTasks(g_platform.get(), impl_->isolate, idle_time_in_seconds);
}

void Engine::PumpMessageLoop() {
  v8::Isolate::Scope isolate_scope(impl_->isolate);
  while (v8::platform::PumpMessageLoop(g_platform.get(), impl_->isolate)) {
  }
  impl_->FlushRejections();
}

}  // namespace nacre
