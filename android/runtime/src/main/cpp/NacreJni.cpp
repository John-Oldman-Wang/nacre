// Android 这一侧的运行时入口：Kotlin 的 NacreRuntime 经 JNI 调到这里，
// 这里再交给 core/engine。只有运行时本身的事，不做任何调度。
#include <android/log.h>
#include <jni.h>

#include <string>
#include <utility>

#include "Engine.h"

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

nacre::Engine* FromHandle(jlong handle) { return reinterpret_cast<nacre::Engine*>(handle); }

}  // namespace

extern "C" JNIEXPORT jlong JNICALL
Java_nacre_runtime_NacreRuntime_nativeCreate(JNIEnv*, jclass) {
  nacre::Engine::InitializeV8Once();
  nacre::EngineHost host;
  host.log = WriteLog;
  return reinterpret_cast<jlong>(new nacre::Engine(std::move(host)));
}

extern "C" JNIEXPORT jboolean JNICALL
Java_nacre_runtime_NacreRuntime_nativeEvaluate(JNIEnv* env, jclass, jlong handle,
                                               jbyteArray name, jbyteArray source) {
  nacre::Engine* engine = FromHandle(handle);
  if (engine == nullptr) return JNI_FALSE;
  nacre::Script script{FromBytes(env, name), FromBytes(env, source)};
  return engine->Evaluate(script) ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT void JNICALL
Java_nacre_runtime_NacreRuntime_nativeDestroy(JNIEnv*, jclass, jlong handle) {
  delete FromHandle(handle);
}

extern "C" JNIEXPORT jstring JNICALL
Java_nacre_runtime_NacreRuntime_nativeV8Version(JNIEnv* env, jclass) {
  return env->NewStringUTF(nacre::Engine::V8Version());
}
