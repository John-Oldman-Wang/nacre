// Web 标准那几个全局的底座：TextEncoder / TextDecoder / atob / btoa / structuredClone。
//
// 这一层只依赖 V8，不依赖 iOS，也不用宿主提供任何东西——UTF-8 转换和对象序列化
// 都是 V8 自带的，Base64 和解码的状态机在 TextCodec 里。
#pragma once

#include <v8.h>

namespace nacre {

// 往内置脚本用的那个原生桥对象上加六个函数：
//   utf8Encode(string)                 -> Uint8Array
//   utf8EncodeInto(string, Uint8Array) -> [read, written]
//   utf8Decode(input, state, flags)    -> string
//   base64Encode(string)               -> string，有超过 0xFF 的字符时是 undefined
//   base64Decode(string)               -> string，不合法时是 undefined
//   structuredClone(value, isPlatformObject) -> 克隆出来的值
//
// 和桥上别的函数一个分工：这里只做算的那部分，参数转换、类的形状、报错的
// 名字都在内置脚本里（Builtin/parts/28-web-globals.js）。
void InstallWebGlobals(v8::Isolate* isolate, v8::Local<v8::Context> context,
                       v8::Local<v8::Object> bridge);

}  // namespace nacre
