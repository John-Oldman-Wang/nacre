#include "WebGlobals.h"

#include <v8-array-buffer.h>
#include <v8-container.h>
#include <v8-exception.h>
#include <v8-function.h>
#include <v8-typed-array.h>
#include <v8-value-serializer.h>

#include <cstdlib>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "TextCodec.h"

namespace nacre {

namespace {

v8::Local<v8::String> Str(v8::Isolate* isolate, const char* text) {
  return v8::String::NewFromUtf8(isolate, text).ToLocalChecked();
}

void ThrowTypeError(v8::Isolate* isolate, const char* message) {
  isolate->ThrowException(v8::Exception::TypeError(Str(isolate, message)));
}

void ThrowRangeError(v8::Isolate* isolate, const char* message) {
  isolate->ThrowException(v8::Exception::RangeError(Str(isolate, message)));
}

// 一段每个字符都不超过 0xFF 的内容建成字符串。太长（超过 V8 的字符串上限）
// 时抛 RangeError 并返回 false
bool ReturnOneByteString(const v8::FunctionCallbackInfo<v8::Value>& info,
                         const std::string& bytes, const char* too_long) {
  v8::Isolate* isolate = info.GetIsolate();
  v8::Local<v8::String> result;
  if (bytes.size() > static_cast<size_t>(v8::String::kMaxLength) ||
      !v8::String::NewFromOneByte(isolate, reinterpret_cast<const uint8_t*>(bytes.data()),
                                  v8::NewStringType::kNormal, static_cast<int>(bytes.size()))
           .ToLocal(&result)) {
    ThrowRangeError(isolate, too_long);
    return false;
  }
  info.GetReturnValue().Set(result);
  return true;
}

// 字符串的每个码元取低 8 位。调用前要先确认它只有不超过 0xFF 的字符
std::vector<uint8_t> OneByteContents(v8::Isolate* isolate, v8::Local<v8::String> text) {
  const uint32_t length = static_cast<uint32_t>(text->Length());
  std::vector<uint8_t> bytes(length);
  if (length > 0) text->WriteOneByteV2(isolate, 0, length, bytes.data());
  return bytes;
}

// ---------------------------------------------------------------------------
// TextEncoder
// ---------------------------------------------------------------------------

// utf8Encode(string) -> Uint8Array
//
// V8 自己的 UTF-8 转换。kReplaceInvalidUtf8 把落单的代理项写成 U+FFFD 的三个
// 字节——不带它写出来的是代理项自己的三字节形式，那不是合法的 UTF-8。
// 长度先问 Utf8LengthV2：落单的代理项不管换不换都是三个字节，所以它给的数
// 正好是带替换时要写的字节数
void Utf8Encode(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  if (info.Length() < 1 || !info[0]->IsString()) return;  // 转成字符串是 JS 侧的事
  v8::Local<v8::String> text = info[0].As<v8::String>();

  const size_t length = text->Utf8LengthV2(isolate);
  v8::Local<v8::ArrayBuffer> buffer;
  if (!v8::ArrayBuffer::MaybeNew(isolate, length).ToLocal(&buffer)) {
    ThrowRangeError(isolate, "TextEncoder.encode: could not allocate the result");
    return;
  }
  if (length > 0) {
    text->WriteUtf8V2(isolate, static_cast<char*>(buffer->Data()), length,
                      v8::String::WriteFlags::kReplaceInvalidUtf8);
  }
  info.GetReturnValue().Set(v8::Uint8Array::New(buffer, 0, length));
}

// utf8EncodeInto(string, Uint8Array) -> [read, written]
//
// WriteUtf8V2 给了容量就只写放得下的完整字符，不写半个；它顺带说出处理了
// 多少个码元，正好是 encodeInto 要的 read。
// 写的是**视图覆盖的那一段**：byteOffset 要算上
void Utf8EncodeInto(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
  if (info.Length() < 2 || !info[0]->IsString()) return;
  if (!info[1]->IsUint8Array()) {
    ThrowTypeError(isolate, "TextEncoder.encodeInto: the destination must be a Uint8Array");
    return;
  }
  v8::Local<v8::String> text = info[0].As<v8::String>();
  v8::Local<v8::Uint8Array> view = info[1].As<v8::Uint8Array>();

  const size_t capacity = view->ByteLength();
  size_t read = 0;
  size_t written = 0;
  if (capacity > 0 && text->Length() > 0) {
    char* dest = static_cast<char*>(view->Buffer()->Data()) + view->ByteOffset();
    written = text->WriteUtf8V2(isolate, dest, capacity,
                                v8::String::WriteFlags::kReplaceInvalidUtf8, &read);
  }

  v8::Local<v8::Array> result = v8::Array::New(isolate, 2);
  if (result->Set(ctx, 0, v8::Number::New(isolate, static_cast<double>(read))).IsNothing() ||
      result->Set(ctx, 1, v8::Number::New(isolate, static_cast<double>(written))).IsNothing()) {
    return;
  }
  info.GetReturnValue().Set(result);
}

// ---------------------------------------------------------------------------
// TextDecoder
// ---------------------------------------------------------------------------

// 和内置脚本约定的两样东西，改一边要改另一边：
//   flags：1 = fatal，2 = ignoreBOM，4 = stream
//   state：一个 5 字节的 Uint8Array，每个 TextDecoder 一个，两次 decode 之间
//          的状态存在里面——[0] 没凑齐的字节数，[1..3] 那几个字节，[4] BOM 看过没有
constexpr int kFlagFatal = 1;
constexpr int kFlagIgnoreBOM = 2;
constexpr int kFlagStream = 4;
constexpr size_t kStateSize = 5;

// utf8Decode(input, state, flags) -> string
//
// input 是 undefined（当成空）、ArrayBuffer、SharedArrayBuffer 或者任何视图；
// 别的类型抛 TypeError。读的是视图覆盖的那一段。
void Utf8Decode(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
  if (info.Length() < 3 || !info[1]->IsUint8Array()) return;
  v8::Local<v8::Uint8Array> state_view = info[1].As<v8::Uint8Array>();
  if (state_view->ByteLength() < kStateSize) return;
  const int flags = info[2]->Int32Value(ctx).FromMaybe(0);

  // 先把两边的缓冲区都取到手，再拿指针：Buffer() 可能要给小的类型数组
  // 现分配堆外的存储
  v8::Local<v8::Value> input = info[0];
  v8::Local<v8::ArrayBuffer> state_buffer = state_view->Buffer();
  const uint8_t* data = nullptr;
  size_t length = 0;
  if (input->IsUndefined()) {
    // 没给：空的一段
  } else if (input->IsArrayBufferView()) {
    v8::Local<v8::ArrayBufferView> view = input.As<v8::ArrayBufferView>();
    length = view->ByteLength();  // 缓冲区被转移走了的视图是 0
    if (length > 0) {
      data = static_cast<const uint8_t*>(view->Buffer()->Data()) + view->ByteOffset();
    }
  } else if (input->IsArrayBuffer()) {
    v8::Local<v8::ArrayBuffer> buffer = input.As<v8::ArrayBuffer>();
    length = buffer->ByteLength();
    data = static_cast<const uint8_t*>(buffer->Data());
  } else if (input->IsSharedArrayBuffer()) {
    v8::Local<v8::SharedArrayBuffer> buffer = input.As<v8::SharedArrayBuffer>();
    length = buffer->ByteLength();
    data = static_cast<const uint8_t*>(buffer->Data());
  } else {
    ThrowTypeError(isolate,
                   "TextDecoder.decode: the input must be an ArrayBuffer, a SharedArrayBuffer "
                   "or a view on one (Uint8Array, DataView, ...)");
    return;
  }
  if (data == nullptr) length = 0;

  uint8_t* raw_state = static_cast<uint8_t*>(state_buffer->Data()) + state_view->ByteOffset();
  Utf8StreamState state;
  state.pending_count = raw_state[0] <= 3 ? raw_state[0] : 0;
  state.pending[0] = raw_state[1];
  state.pending[1] = raw_state[2];
  state.pending[2] = raw_state[3];
  state.bom_seen = raw_state[4] != 0;

  Utf8DecodeOptions options;
  options.fatal = (flags & kFlagFatal) != 0;
  options.ignore_bom = (flags & kFlagIgnoreBOM) != 0;
  options.stream = (flags & kFlagStream) != 0;

  std::u16string text;
  const bool ok = DecodeUtf8(data, length, options, &state, &text);

  // 不管成没成都把状态写回去：失败时解码器已经把它复位了
  raw_state[0] = state.pending_count;
  raw_state[1] = state.pending[0];
  raw_state[2] = state.pending[1];
  raw_state[3] = state.pending[2];
  raw_state[4] = state.bom_seen ? 1 : 0;

  if (!ok) {
    ThrowTypeError(isolate, "TextDecoder.decode: the input is not valid UTF-8");
    return;
  }
  v8::Local<v8::String> result;
  if (text.size() > static_cast<size_t>(v8::String::kMaxLength) ||
      !v8::String::NewFromTwoByte(isolate, reinterpret_cast<const uint16_t*>(text.data()),
                                  v8::NewStringType::kNormal, static_cast<int>(text.size()))
           .ToLocal(&result)) {
    ThrowRangeError(isolate, "TextDecoder.decode: the decoded string is too long");
    return;
  }
  info.GetReturnValue().Set(result);
}

// ---------------------------------------------------------------------------
// btoa / atob
// ---------------------------------------------------------------------------

// base64Encode(string) -> string
// 有码点超过 0xFF 的字符时什么都不返回（undefined），JS 侧据此抛
// InvalidCharacterError——带名字的 Error 在 JS 里建更顺手
void Base64EncodeString(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  if (info.Length() < 1 || !info[0]->IsString()) return;
  v8::Local<v8::String> text = info[0].As<v8::String>();
  if (!text->ContainsOnlyOneByte()) return;
  const std::vector<uint8_t> bytes = OneByteContents(isolate, text);
  ReturnOneByteString(info, Base64Encode(bytes.data(), bytes.size()),
                      "btoa: the encoded string is too long");
}

// base64Decode(string) -> string（每个字符是一个字节）
// 不合法时什么都不返回，JS 侧抛 InvalidCharacterError
void Base64DecodeString(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  if (info.Length() < 1 || !info[0]->IsString()) return;
  v8::Local<v8::String> text = info[0].As<v8::String>();
  // 超过 0xFF 的字符一定不在 Base64 的字母表里，也不是 ASCII 空白
  if (!text->ContainsOnlyOneByte()) return;
  const std::vector<uint8_t> bytes = OneByteContents(isolate, text);
  std::string decoded;
  if (!ForgivingBase64Decode(bytes.data(), bytes.size(), &decoded)) return;
  ReturnOneByteString(info, decoded, "atob: the decoded string is too long");
}

// ---------------------------------------------------------------------------
// structuredClone
// ---------------------------------------------------------------------------
//
// V8 的 ValueSerializer 就是照 HTML 的结构化克隆算法写的（Chrome 的
// postMessage 和 structuredClone 用的是它）：序列化成一段字节，再反序列化
// 出来，就是一份克隆。环、同一个对象出现多次、Map / Set / 类型数组 / Error
// 都是它处理的，这里只补 V8 留给宿主的三件事：
//   1. 「不能克隆」时抛什么——标准说 DataCloneError（一个 DOMException）。
//      DOMException 是内置脚本定义的，由它给的工厂建；没给工厂时退回
//      name 是 DataCloneError 的 Error
//   2. 哪些普通的 JS 对象其实是「平台对象」。原生对象的包装、结构体、
//      EventTarget 这些在 V8 眼里都是普通对象，不拦的话会被克隆成一个
//      丢了原型和内部状态的空壳，而且不报错。问内置脚本（它认得这些类）
//   3. SharedArrayBuffer：还不支持，抛 DataCloneError

v8::Local<v8::Value> MakeDataCloneError(v8::Isolate* isolate, v8::Local<v8::Context> ctx,
                                        v8::Local<v8::String> message) {
  v8::Local<v8::Value> error = v8::Exception::Error(message);
  if (error->IsObject()) {
    (void)error.As<v8::Object>()->Set(ctx, Str(isolate, "name"), Str(isolate, "DataCloneError"));
  }
  return error;
}

class CloneDelegate : public v8::ValueSerializer::Delegate {
 public:
  CloneDelegate(v8::Isolate* isolate, v8::Local<v8::Context> ctx,
                v8::Local<v8::Value> is_platform_object, v8::Local<v8::Value> make_clone_error)
      : isolate_(isolate),
        ctx_(ctx),
        is_platform_object_(is_platform_object),
        make_clone_error_(make_clone_error),
        object_prototype_(v8::Object::New(isolate)->GetPrototype()) {}

  void ThrowDataCloneError(v8::Local<v8::String> message) override {
    // 工厂在自己的 TryCatch 里调（它要是抛了就当没有工厂），抛要在那个作用域外面：
    // 在里面抛会被它接住、跟着它一起丢掉
    v8::Local<v8::Value> made;
    if (make_clone_error_->IsFunction()) {
      v8::TryCatch try_catch(isolate_);
      v8::Local<v8::Value> argv[] = {message};
      if (!make_clone_error_.As<v8::Function>()
               ->Call(ctx_, v8::Undefined(isolate_), 1, argv)
               .ToLocal(&made)) {
        made.Clear();
      }
    }
    isolate_->ThrowException(made.IsEmpty() ? MakeDataCloneError(isolate_, ctx_, message) : made);
  }

  // 让 V8 对每个普通对象来问一次 IsHostObject，而不是只看有没有内部字段
  // （我们的包装对象没有内部字段，见 Engine.cpp 里包装那一节）
  bool HasCustomHostObject(v8::Isolate*) override { return true; }

  v8::Maybe<bool> IsHostObject(v8::Isolate* isolate, v8::Local<v8::Object> object) override {
    // 字面量对象和没有原型的对象占绝大多数，不用回 JS 问
    v8::Local<v8::Value> prototype = object->GetPrototype();
    if (prototype->IsNull() || prototype->StrictEquals(object_prototype_)) {
      return v8::Just(false);
    }
    if (!is_platform_object_->IsFunction()) return v8::Just(false);
    v8::Local<v8::Value> argv[] = {object};
    v8::Local<v8::Value> answer;
    if (!is_platform_object_.As<v8::Function>()
             ->Call(ctx_, v8::Undefined(isolate), 1, argv)
             .ToLocal(&answer)) {
      return v8::Nothing<bool>();  // 判断的那段 JS 自己抛了，异常已经挂着
    }
    return v8::Just(answer->BooleanValue(isolate));
  }

  // IsHostObject 说「是」的对象会到这里。我们一个平台对象都不支持克隆。
  // 报错里写类名，写法和 V8 自己的一致（#<Object> could not be cloned.）
  v8::Maybe<bool> WriteHostObject(v8::Isolate* isolate, v8::Local<v8::Object> object) override {
    std::string message = "#<" + ConstructorName(object) + "> could not be cloned.";
    ThrowDataCloneError(v8::String::NewFromUtf8(isolate, message.data(), v8::NewStringType::kNormal,
                                                static_cast<int>(message.size()))
                            .ToLocalChecked());
    return v8::Nothing<bool>();
  }

  v8::Maybe<uint32_t> GetSharedArrayBufferId(v8::Isolate* isolate,
                                             v8::Local<v8::SharedArrayBuffer>) override {
    ThrowDataCloneError(Str(isolate, "#<SharedArrayBuffer> could not be cloned."));
    return v8::Nothing<uint32_t>();
  }

 private:
  // object.constructor.name。读属性可能执行用户的取值器，抛了就当没有名字。
  // 不用 Object::GetConstructorName：它先看对象是怎么建出来的，而包装对象是
  // Object.create 建的，拿到什么名字要看 V8 内部的回退次序
  std::string ConstructorName(v8::Local<v8::Object> object) {
    v8::TryCatch try_catch(isolate_);
    v8::Local<v8::Value> constructor;
    if (object->Get(ctx_, Str(isolate_, "constructor")).ToLocal(&constructor) &&
        constructor->IsFunction()) {
      v8::Local<v8::Value> name = constructor.As<v8::Function>()->GetName();
      if (name->IsString() && name.As<v8::String>()->Length() > 0) {
        v8::String::Utf8Value utf8(isolate_, name);
        if (*utf8 != nullptr) return std::string(*utf8, utf8.length());
      }
    }
    if (try_catch.HasCaught()) try_catch.Reset();
    return "Object";
  }

  v8::Isolate* isolate_;
  v8::Local<v8::Context> ctx_;
  v8::Local<v8::Value> is_platform_object_;
  v8::Local<v8::Value> make_clone_error_;
  v8::Local<v8::Value> object_prototype_;
};

struct FreeDeleter {
  void operator()(uint8_t* data) const { std::free(data); }
};

// structuredClone(value, isPlatformObject, makeCloneError) -> 克隆出来的值
//
// isPlatformObject 是内置脚本给的判断函数：(object) => boolean。
// makeCloneError 是内置脚本给的工厂：(message) => DataCloneError。
// 失败时异常已经抛出去了，这里直接返回
void StructuredClone(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Isolate* isolate = info.GetIsolate();
  v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
  if (info.Length() < 1) return;

  v8::Local<v8::Value> is_platform_object = v8::Undefined(isolate);
  if (info.Length() > 1) is_platform_object = info[1];
  v8::Local<v8::Value> make_clone_error = v8::Undefined(isolate);
  if (info.Length() > 2) make_clone_error = info[2];
  CloneDelegate delegate(isolate, ctx, is_platform_object, make_clone_error);

  // 序列化出来的那段内存是 V8 用 realloc 要的（委托没有换分配函数），用 free 还
  std::unique_ptr<uint8_t, FreeDeleter> data;
  size_t size = 0;
  {
    v8::ValueSerializer serializer(isolate, &delegate);
    serializer.WriteHeader();
    bool written = false;
    if (!serializer.WriteValue(ctx, info[0]).To(&written)) return;  // 异常已经挂着
    if (!written) {
      delegate.ThrowDataCloneError(Str(isolate, "The value could not be cloned."));
      return;
    }
    std::pair<uint8_t*, size_t> released = serializer.Release();
    data.reset(released.first);
    size = released.second;
  }

  // ArrayBuffer 的内容就写在这段字节里（没有转移），所以反序列化不需要委托
  v8::ValueDeserializer deserializer(isolate, data.get(), size);
  bool header = false;
  if (!deserializer.ReadHeader(ctx).To(&header)) return;
  if (!header) {
    delegate.ThrowDataCloneError(Str(isolate, "The value could not be cloned."));
    return;
  }
  v8::Local<v8::Value> copy;
  if (!deserializer.ReadValue(ctx).ToLocal(&copy)) return;
  info.GetReturnValue().Set(copy);
}

}  // namespace

void InstallWebGlobals(v8::Isolate* isolate, v8::Local<v8::Context> context,
                       v8::Local<v8::Object> bridge) {
  struct Entry {
    const char* name;
    v8::FunctionCallback fn;
  };
  const Entry entries[] = {
      {"utf8Encode", Utf8Encode},
      {"utf8EncodeInto", Utf8EncodeInto},
      {"utf8Decode", Utf8Decode},
      {"base64Encode", Base64EncodeString},
      {"base64Decode", Base64DecodeString},
      {"structuredClone", StructuredClone},
  };
  for (const Entry& e : entries) {
    v8::Local<v8::Function> fn = v8::Function::New(context, e.fn).ToLocalChecked();
    bridge->Set(context, Str(isolate, e.name), fn).Check();
  }
}

}  // namespace nacre
