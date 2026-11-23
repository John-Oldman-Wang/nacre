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

// 一个运行时：引擎，加上回调 Kotlin 那个对象要用的东西
struct Runtime {
  std::unique_ptr<nacre::Engine> engine;
  jobject self = nullptr;  // NacreRuntime 的全局引用
  jmethodID schedule_wakeup = nullptr;
  jmethodID post_task = nullptr;
  // post_task 交过来的任务先存在这里，Kotlin 那边排进主线程的队列，轮到时按编号取回来跑
  std::unordered_map<int64_t, std::function<void()>> tasks;
  int64_t next_task_id = 1;
};

Runtime* FromHandle(jlong handle) { return reinterpret_cast<Runtime*>(handle); }

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
Java_nacre_runtime_NacreRuntime_nativeCreate(JNIEnv* env, jclass, jobject self) {
  nacre::Engine::InitializeV8Once();

  auto* runtime = new Runtime();
  runtime->self = env->NewGlobalRef(self);
  jclass cls = env->GetObjectClass(self);
  runtime->schedule_wakeup = env->GetMethodID(cls, "scheduleWakeup", "(D)V");
  runtime->post_task = env->GetMethodID(cls, "postTask", "(J)V");
  env->DeleteLocalRef(cls);

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

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeDestroy(JNIEnv* env, jclass, jlong handle) {
  Runtime* runtime = FromHandle(handle);
  // 先关引擎：它析构时可能还会回调宿主，那时 self 还得在
  runtime->engine.reset();
  runtime->tasks.clear();
  env->DeleteGlobalRef(runtime->self);
  delete runtime;
}

extern "C" JNIEXPORT jstring JNICALL
Java_nacre_runtime_NacreRuntime_nativeV8Version(JNIEnv* env, jclass) {
  return env->NewStringUTF(nacre::Engine::V8Version());
}
