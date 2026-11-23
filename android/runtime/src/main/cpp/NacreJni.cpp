// Android 这一侧的运行时入口：Kotlin 的 NacreRuntime 经 JNI 调到这里，
// 这里再交给 core/engine。只有运行时本身的事（事件循环、原生入口），不做任何调度。
#include <android/log.h>
#include <jni.h>
#include <stdlib.h>

#include <cstdint>
#include <functional>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>
#include <utility>

#include "Engine.h"
#include "UrlParts.h"

namespace {

constexpr const char* kLogTag = "Nacre";

int Priority(nacre::LogLevel level) {
  switch (level) {
    case nacre::LogLevel::Debug: return ANDROID_LOG_DEBUG;
    case nacre::LogLevel::Log:
    case nacre::LogLevel::Info: return ANDROID_LOG_INFO;
    case nacre::LogLevel::Warn: return ANDROID_LOG_WARN;
    case nacre::LogLevel::Error: return ANDROID_LOG_ERROR;
  }
  return ANDROID_LOG_INFO;
}

// logcat 一条最多约 4 KB，长的按行切开写，每段不超过这个长度
constexpr size_t kMaxChunk = 4000;

void WriteLog(nacre::LogLevel level, const std::string& message) {
  const int priority = Priority(level);
  size_t start = 0;
  do {
    size_t end = message.find('\n', start);
    if (end == std::string::npos) end = message.size();
    while (end - start > kMaxChunk) {
      // 不在 UTF-8 的多字节字符中间切
      size_t cut = start + kMaxChunk;
      while (cut > start && (static_cast<unsigned char>(message[cut]) & 0xC0) == 0x80) --cut;
      __android_log_write(priority, kLogTag, message.substr(start, cut - start).c_str());
      start = cut;
    }
    __android_log_write(priority, kLogTag, message.substr(start, end - start).c_str());
    start = end + 1;
  } while (start < message.size());
}

// 字节数组原样当成 UTF-8：Kotlin 那边已经按 UTF-8 编好了。不用 GetStringUTFChars，
// 它给的是 Java 的「改良 UTF-8」，四字节的字符会被拆成两个代理项
std::string FromBytes(JNIEnv* env, jbyteArray bytes) {
  if (bytes == nullptr) return std::string();
  const jsize length = env->GetArrayLength(bytes);
  std::string out(static_cast<size_t>(length), '\0');
  if (length > 0) env->GetByteArrayRegion(bytes, 0, length, reinterpret_cast<jbyte*>(out.data()));
  return out;
}

JavaVM* g_vm = nullptr;

// 引擎全程在主线程上用，主线程早就挂在 JVM 上了，这里只是取它的 JNIEnv
JNIEnv* CurrentEnv() {
  JNIEnv* env = nullptr;
  g_vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6);
  return env;
}

// 一个运行时：引擎，加上回调 Kotlin 那边要用的东西
struct Runtime {
  std::unique_ptr<nacre::Engine> engine;
  jobject self = nullptr;    // NacreRuntime 的全局引用
  jobject bridge = nullptr;  // NativeBridge 的全局引用
  jmethodID schedule_wakeup = nullptr;
  jmethodID post_task = nullptr;
  // NativeBridge 的方法
  jmethodID retain = nullptr;
  jmethodID release = nullptr;
  jmethodID class_name_of = nullptr;
  jmethodID construct = nullptr;
  jmethodID read_property = nullptr;
  jmethodID write_property = nullptr;
  jmethodID read_class_object_property = nullptr;
  jmethodID call_method = nullptr;
  jmethodID call_object_method = nullptr;
  jmethodID set_event_subscription = nullptr;
  jmethodID error_text = nullptr;
  jmethodID create_blob = nullptr;
  jmethodID read_object_async = nullptr;
  jmethodID fetch_start = nullptr;
  jmethodID fetch_read_body = nullptr;
  jmethodID fetch_cancel = nullptr;
  jmethodID fetch_release = nullptr;
  // post_task 交过来的任务先存在这里，Kotlin 那边排进主线程的队列，轮到时按编号取回来跑
  std::unordered_map<int64_t, std::function<void()>> tasks;
  int64_t next_task_id = 1;
};

Runtime* FromHandle(jlong handle) { return reinterpret_cast<Runtime*>(handle); }

// 交给引擎的「指针」是 NativeBridge 发的编号，不是真的地址：Java 对象没有固定的
// 地址，同一个对象要永远对应同一个包装，只能靠编号
void* PtrOf(jlong id) { return reinterpret_cast<void*>(static_cast<uintptr_t>(id)); }
jlong IdOf(void* ptr) { return static_cast<jlong>(reinterpret_cast<uintptr_t>(ptr)); }

jbyteArray ToBytes(JNIEnv* env, const std::string& text) {
  jbyteArray out = env->NewByteArray(static_cast<jsize>(text.size()));
  env->SetByteArrayRegion(out, 0, static_cast<jsize>(text.size()),
                          reinterpret_cast<const jbyte*>(text.data()));
  return out;
}

jlongArray ToIds(JNIEnv* env, const std::vector<void*>& ptrs) {
  jlongArray out = env->NewLongArray(static_cast<jsize>(ptrs.size()));
  std::vector<jlong> ids;
  ids.reserve(ptrs.size());
  for (void* p : ptrs) ids.push_back(IdOf(p));
  if (!ids.empty()) env->SetLongArrayRegion(out, 0, static_cast<jsize>(ids.size()), ids.data());
  return out;
}

// 类名都是 ASCII，GetStringUTFChars 够用
std::string FromAsciiString(JNIEnv* env, jstring text) {
  if (text == nullptr) return std::string();
  const char* chars = env->GetStringUTFChars(text, nullptr);
  std::string out(chars != nullptr ? chars : "");
  if (chars != nullptr) env->ReleaseStringUTFChars(text, chars);
  return out;
}

// Kotlin 那边抛了：清掉异常，交给 NativeBridge.errorText 写成引擎认的那句话
//（参数类的错是普通说明，JS 抛 TypeError；Java 自己抛的带「\x01类名\x01」）。
// 没抛返回 false
bool TakeError(JNIEnv* env, Runtime* runtime, std::string* error) {
  if (!env->ExceptionCheck()) return false;
  jthrowable thrown = env->ExceptionOccurred();
  env->ExceptionClear();
  auto text = static_cast<jbyteArray>(env->CallObjectMethod(runtime->bridge, runtime->error_text, thrown));
  if (env->ExceptionCheck()) {   // 连这一步也出错了，只能给一句笼统的
    env->ExceptionClear();
    if (error != nullptr) *error = "native call failed";
  } else if (error != nullptr) {
    *error = FromBytes(env, text);
  }
  env->DeleteLocalRef(thrown);
  return true;
}

nacre::NativeObjectRef RefOf(JNIEnv* env, Runtime* runtime, jlong id) {
  if (id == 0) return {};
  auto name = static_cast<jstring>(env->CallObjectMethod(runtime->bridge, runtime->class_name_of, id));
  std::string class_name = FromAsciiString(env, name);
  env->DeleteLocalRef(name);
  return {PtrOf(id), class_name};
}

// 这些入口都是从主线程上的消息回来的，跑完一轮 JS 之后处理 V8 平台投递的任务
//（微任务由 kAuto 自动排空），和 iOS 的 postToJS: 一样
void AfterTask(Runtime* runtime) {
  if (runtime->engine) runtime->engine->PumpMessageLoop();
}

}  // namespace

extern "C" JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void*) {
  g_vm = vm;
  return JNI_VERSION_1_6;
}

extern "C" JNIEXPORT jlong JNICALL
Java_nacre_runtime_NacreRuntime_nativeCreate(JNIEnv* env, jclass, jobject self, jobject bridge) {
  nacre::Engine::InitializeV8Once();

  auto* runtime = new Runtime();
  runtime->self = env->NewGlobalRef(self);
  jclass cls = env->GetObjectClass(self);
  runtime->schedule_wakeup = env->GetMethodID(cls, "scheduleWakeup", "(D)V");
  runtime->post_task = env->GetMethodID(cls, "postTask", "(J)V");
  env->DeleteLocalRef(cls);

  runtime->bridge = env->NewGlobalRef(bridge);
  jclass bridge_class = env->GetObjectClass(bridge);
  runtime->retain = env->GetMethodID(bridge_class, "retain", "(J)V");
  runtime->release = env->GetMethodID(bridge_class, "release", "(J)V");
  runtime->class_name_of = env->GetMethodID(bridge_class, "classNameOf", "(J)Ljava/lang/String;");
  runtime->construct = env->GetMethodID(bridge_class, "construct", "(Ljava/lang/String;[B[J)J");
  runtime->read_property = env->GetMethodID(bridge_class, "readProperty", "(JLjava/lang/String;)[B");
  runtime->write_property = env->GetMethodID(bridge_class, "writeProperty", "(JLjava/lang/String;[B)V");
  runtime->read_class_object_property = env->GetMethodID(
      bridge_class, "readClassObjectProperty", "(Ljava/lang/String;Ljava/lang/String;)J");
  runtime->call_method = env->GetMethodID(bridge_class, "callMethod", "(JLjava/lang/String;[B[J)[B");
  runtime->call_object_method =
      env->GetMethodID(bridge_class, "callObjectMethod", "(JLjava/lang/String;[B[J)J");
  runtime->set_event_subscription =
      env->GetMethodID(bridge_class, "setEventSubscription", "(JLjava/lang/String;Z)V");
  runtime->error_text = env->GetMethodID(bridge_class, "errorText", "(Ljava/lang/Throwable;)[B");
  runtime->create_blob = env->GetMethodID(bridge_class, "createBlob", "([B[[B[B)J");
  runtime->read_object_async =
      env->GetMethodID(bridge_class, "readObjectAsync", "(JLjava/lang/String;I)V");
  runtime->fetch_start = env->GetMethodID(bridge_class, "fetchStart", "([B[BJI)I");
  runtime->fetch_read_body = env->GetMethodID(bridge_class, "fetchReadBody", "(ILjava/lang/String;I)V");
  runtime->fetch_cancel = env->GetMethodID(bridge_class, "fetchCancel", "(I)V");
  runtime->fetch_release = env->GetMethodID(bridge_class, "fetchRelease", "(I)V");
  env->DeleteLocalRef(bridge_class);

  nacre::EngineHost host;
  host.log = WriteLog;
  host.parse_url = [](const std::string& url, const std::string& base) {
    return nacre::ParseUrlParts(url, base);
  };
  // 系统的随机源（bionic 的 arc4random 取自内核的 getrandom），密码学强度，不会失败
  host.fill_random = [](void* bytes, size_t length) {
    arc4random_buf(bytes, length);
    return true;
  };
  // 「delay_ms 之后叫我」，每次覆盖上一次的约定，负数表示撤销。由 Kotlin 那边用
  // 主线程的 Handler 排，和别的主线程消息在同一个队列里，先后是确定的
  host.schedule_wakeup = [runtime](double delay_ms) {
    CurrentEnv()->CallVoidMethod(runtime->self, runtime->schedule_wakeup, delay_ms);
  };
  // 把任务排到主线程队列的尾部。未处理拒绝的延后结算走这条
  host.post_task = [runtime](std::function<void()> task) {
    const int64_t id = runtime->next_task_id++;
    runtime->tasks.emplace(id, std::move(task));
    CurrentEnv()->CallVoidMethod(runtime->self, runtime->post_task, static_cast<jlong>(id));
  };

  // ---- 原生对象：都转给 NativeBridge ----
  // 每个回调里建的局部引用随这次 JNI 调用一起放掉，所以用 PushLocalFrame 包一层：
  // 引擎在一轮 JS 里可能调几千次，不包的话局部引用表会满
  struct Frame {
    JNIEnv* env;
    explicit Frame(JNIEnv* e) : env(e) { env->PushLocalFrame(16); }
    ~Frame() { env->PopLocalFrame(nullptr); }
  };
  host.retain_native = [runtime](void* ptr) {
    CurrentEnv()->CallVoidMethod(runtime->bridge, runtime->retain, IdOf(ptr));
  };
  host.release_native = [runtime](void* ptr) {
    CurrentEnv()->CallVoidMethod(runtime->bridge, runtime->release, IdOf(ptr));
  };
  host.construct_native = [runtime](const std::string& class_name, const std::string& packed,
                                    const std::vector<void*>& args, std::string* error) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    jlong id = env->CallLongMethod(runtime->bridge, runtime->construct,
                                   env->NewStringUTF(class_name.c_str()), ToBytes(env, packed),
                                   ToIds(env, args));
    if (TakeError(env, runtime, error)) return nacre::NativeObjectRef{};
    return RefOf(env, runtime, id);
  };
  host.read_property = [runtime](void* ptr, const std::string& name) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    auto json = static_cast<jbyteArray>(env->CallObjectMethod(
        runtime->bridge, runtime->read_property, IdOf(ptr), env->NewStringUTF(name.c_str())));
    if (TakeError(env, runtime, nullptr)) return std::string("null");
    return FromBytes(env, json);
  };
  host.write_property = [runtime](void* ptr, const std::string& name, const std::string& packed,
                                  std::string* error, std::string*) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    env->CallVoidMethod(runtime->bridge, runtime->write_property, IdOf(ptr),
                        env->NewStringUTF(name.c_str()), ToBytes(env, packed));
    TakeError(env, runtime, error);
  };
  host.read_class_object_property = [runtime](const std::string& class_name,
                                              const std::string& name) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    jlong id = env->CallLongMethod(runtime->bridge, runtime->read_class_object_property,
                                   env->NewStringUTF(class_name.c_str()),
                                   env->NewStringUTF(name.c_str()));
    if (TakeError(env, runtime, nullptr)) return nacre::NativeObjectRef{};
    return RefOf(env, runtime, id);
  };
  host.call_method = [runtime](void* ptr, const std::string& name, const std::string& packed,
                               const std::vector<void*>& args, std::string* error) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    auto json = static_cast<jbyteArray>(env->CallObjectMethod(
        runtime->bridge, runtime->call_method, IdOf(ptr), env->NewStringUTF(name.c_str()),
        ToBytes(env, packed), ToIds(env, args)));
    if (TakeError(env, runtime, error)) return std::string("null");
    return FromBytes(env, json);
  };
  host.call_object_method = [runtime](void* ptr, const std::string& name,
                                      const std::string& packed,
                                      const std::vector<void*>& args, std::string* error) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    jlong id = env->CallLongMethod(runtime->bridge, runtime->call_object_method, IdOf(ptr),
                                   env->NewStringUTF(name.c_str()), ToBytes(env, packed),
                                   ToIds(env, args));
    if (TakeError(env, runtime, error)) return nacre::NativeObjectRef{};
    return RefOf(env, runtime, id);
  };
  host.set_event_subscription = [runtime](void* ptr, const std::string& type, bool on,
                                          std::string* error) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    env->CallVoidMethod(runtime->bridge, runtime->set_event_subscription, IdOf(ptr),
                        env->NewStringUTF(type.c_str()), on ? JNI_TRUE : JNI_FALSE);
    TakeError(env, runtime, error);
  };

  // ---- Blob 和 fetch：都转给 NativeBridge，结果由 Kotlin 那边回主线程兑现 ----
  host.create_blob = [runtime](const std::string& parts_json,
                               const std::vector<std::pair<const void*, size_t>>& buffers,
                               const std::string& type) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    jclass byte_array_class = env->FindClass("[B");
    jobjectArray java_buffers =
        env->NewObjectArray(static_cast<jsize>(buffers.size()), byte_array_class, nullptr);
    for (size_t i = 0; i < buffers.size(); i++) {
      if (buffers[i].first == nullptr) continue;
      jbyteArray bytes = env->NewByteArray(static_cast<jsize>(buffers[i].second));
      env->SetByteArrayRegion(bytes, 0, static_cast<jsize>(buffers[i].second),
                              static_cast<const jbyte*>(buffers[i].first));
      env->SetObjectArrayElement(java_buffers, static_cast<jsize>(i), bytes);
      env->DeleteLocalRef(bytes);
    }
    jlong id = env->CallLongMethod(runtime->bridge, runtime->create_blob,
                                   ToBytes(env, parts_json), java_buffers, ToBytes(env, type));
    if (TakeError(env, runtime, nullptr)) return nacre::NativeObjectRef{};
    return RefOf(env, runtime, id);
  };
  host.read_object_async = [runtime](void* ptr, const std::string& kind, int call_id) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    env->CallVoidMethod(runtime->bridge, runtime->read_object_async, IdOf(ptr),
                        env->NewStringUTF(kind.c_str()), static_cast<jint>(call_id));
    TakeError(env, runtime, nullptr);
  };
  host.fetch_start = [runtime](const std::string& url, const std::string& options_json,
                               void* body, int call_id) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    jint id = env->CallIntMethod(runtime->bridge, runtime->fetch_start, ToBytes(env, url),
                                 ToBytes(env, options_json), IdOf(body), static_cast<jint>(call_id));
    if (TakeError(env, runtime, nullptr)) return 0;
    return static_cast<int>(id);
  };
  host.fetch_read_body = [runtime](int request_id, const std::string& kind, int call_id) {
    JNIEnv* env = CurrentEnv();
    Frame frame(env);
    env->CallVoidMethod(runtime->bridge, runtime->fetch_read_body, static_cast<jint>(request_id),
                        env->NewStringUTF(kind.c_str()), static_cast<jint>(call_id));
    TakeError(env, runtime, nullptr);
  };
  host.fetch_cancel = [runtime](int request_id) {
    JNIEnv* env = CurrentEnv();
    env->CallVoidMethod(runtime->bridge, runtime->fetch_cancel, static_cast<jint>(request_id));
    TakeError(env, runtime, nullptr);
  };
  host.fetch_release = [runtime](int request_id) {
    JNIEnv* env = CurrentEnv();
    env->CallVoidMethod(runtime->bridge, runtime->fetch_release, static_cast<jint>(request_id));
    TakeError(env, runtime, nullptr);
  };

  runtime->engine = std::make_unique<nacre::Engine>(std::move(host));
  return reinterpret_cast<jlong>(runtime);
}

extern "C" JNIEXPORT jboolean JNICALL
Java_nacre_runtime_NacreRuntime_nativeRunBuiltinPart(JNIEnv* env, jclass, jlong handle,
                                                     jbyteArray name, jbyteArray source) {
  Runtime* runtime = FromHandle(handle);
  nacre::Script script{FromBytes(env, name), FromBytes(env, source)};
  const bool ok = runtime->engine->RunBuiltinPart(script);
  AfterTask(runtime);
  return ok ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeFinishBuiltinParts(JNIEnv*, jclass, jlong handle) {
  FromHandle(handle)->engine->FinishBuiltinParts();
}

extern "C" JNIEXPORT jboolean JNICALL
Java_nacre_runtime_NacreRuntime_nativeEvaluate(JNIEnv* env, jclass, jlong handle,
                                               jbyteArray name, jbyteArray source) {
  Runtime* runtime = FromHandle(handle);
  nacre::Script script{FromBytes(env, name), FromBytes(env, source)};
  const bool ok = runtime->engine->Evaluate(script);
  AfterTask(runtime);
  return ok ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeFireDueTimers(JNIEnv*, jclass, jlong handle) {
  Runtime* runtime = FromHandle(handle);
  runtime->engine->FireDueTimers();
  AfterTask(runtime);
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeRunTask(JNIEnv*, jclass, jlong handle, jlong id) {
  Runtime* runtime = FromHandle(handle);
  auto it = runtime->tasks.find(id);
  if (it == runtime->tasks.end()) return;
  std::function<void()> task = std::move(it->second);
  runtime->tasks.erase(it);
  task();
  AfterTask(runtime);
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeRunIdleTasks(JNIEnv*, jclass, jlong handle,
                                                   jdouble seconds) {
  FromHandle(handle)->engine->RunIdleTasks(seconds);
}

// 系统的回调进来了（Kotlin 那边已经排到下一轮），派发给这个对象的 JS 包装
extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeEmitObjectEvent(JNIEnv* env, jclass, jlong handle, jlong id,
                                                      jstring class_name, jstring type) {
  Runtime* runtime = FromHandle(handle);
  runtime->engine->EmitObjectEvent({PtrOf(id), FromAsciiString(env, class_name)},
                                   FromAsciiString(env, type));
  AfterTask(runtime);
}

// ---- 异步调用的兑现（Kotlin 已经排到主线程上了）----

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeSettleJson(JNIEnv* env, jclass, jlong handle, jint call_id,
                                                 jbyteArray json) {
  Runtime* runtime = FromHandle(handle);
  runtime->engine->SettleJSON(call_id, FromBytes(env, json));
  AfterTask(runtime);
}

// 字节拷一份到 C++ 的内存里交给 V8，由它接管（回收时 free）。Java 数组的内存不能
// 直接交出去：它随时可能被 Java 的 GC 挪走
extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeSettleBytes(JNIEnv* env, jclass, jlong handle, jint call_id,
                                                  jbyteArray data) {
  Runtime* runtime = FromHandle(handle);
  const jsize length = env->GetArrayLength(data);
  void* copy = malloc(length > 0 ? static_cast<size_t>(length) : 1);
  if (length > 0) env->GetByteArrayRegion(data, 0, length, static_cast<jbyte*>(copy));
  runtime->engine->SettleBytes(call_id, copy, static_cast<size_t>(length),
                               [](void* d, size_t, void*) { free(d); }, nullptr);
  AfterTask(runtime);
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeSettleObject(JNIEnv* env, jclass, jlong handle, jint call_id,
                                                   jlong id, jstring class_name) {
  Runtime* runtime = FromHandle(handle);
  runtime->engine->SettleObject(call_id, {PtrOf(id), FromAsciiString(env, class_name)});
  AfterTask(runtime);
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeReject(JNIEnv* env, jclass, jlong handle, jint call_id,
                                             jstring name, jbyteArray message) {
  Runtime* runtime = FromHandle(handle);
  runtime->engine->RejectCall(call_id, FromAsciiString(env, name), FromBytes(env, message));
  AfterTask(runtime);
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeDestroy(JNIEnv* env, jclass, jlong handle) {
  Runtime* runtime = FromHandle(handle);
  // 先关引擎：它析构时可能还会回调宿主，那时 self 还得在
  runtime->engine.reset();
  runtime->tasks.clear();
  env->DeleteGlobalRef(runtime->bridge);
  env->DeleteGlobalRef(runtime->self);
  delete runtime;
}

extern "C" JNIEXPORT jstring JNICALL
Java_nacre_runtime_NacreRuntime_nativeV8Version(JNIEnv* env, jclass) {
  return env->NewStringUTF(nacre::Engine::V8Version());
}
