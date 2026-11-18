// UTF-8 解码和 Base64：纯 C++，连 V8 都不依赖。
//
// TextDecoder 和 atob / btoa 的算法部分。和 V8 的绑定在 WebGlobals.cpp。
// 拆开是为了能单独验证：这个文件可以直接在开发机上编译，拿同一批输入和
// Node 里的 TextDecoder / atob 逐条比（见 docs/internals/web-globals.md）。
#pragma once

#include <cstddef>
#include <cstdint>
#include <string>

namespace nacre {

// 一个 TextDecoder 在两次 decode() 之间要记住的东西
struct Utf8StreamState {
  // 上一段结尾没凑齐的那个序列：首字节加上已经收到的后续字节，最多 3 个。
  // 这几个字节一定是某个合法序列的前缀，所以下一段到了之后把它们重新喂一遍
  // 就回到了原来的状态，不用另外存「还差几个、码点攒到多少」
  uint8_t pending[3] = {0, 0, 0};
  uint8_t pending_count = 0;
  // 这个流已经输出过第一个字符了（BOM 只在流的开头去掉）
  bool bom_seen = false;
};

struct Utf8DecodeOptions {
  bool fatal = false;       // 遇到非法序列就失败，而不是换成 U+FFFD
  bool ignore_bom = false;  // 开头的 BOM 留着
  bool stream = false;      // 后面还有数据：结尾没凑齐的留到下一次
};

// WHATWG Encoding 标准的 UTF-8 解码器，输出 UTF-16 码元（追加到 out 后面）。
//
// 非法序列换成几个 U+FFFD 照标准的状态机走（一个最大的有效前缀算一个）。
// 返回 false 表示 fatal 模式下遇到了非法序列；这时 out 的内容没有意义，
// state 已经复位。
//
// stream 为 false 时这是流的最后一段：结尾没凑齐的序列算一个错误，
// 处理完之后 state 复位，下一次调用是一个新的流。
bool DecodeUtf8(const uint8_t* data, size_t length, const Utf8DecodeOptions& options,
                Utf8StreamState* state, std::u16string* out);

// 标准的 Base64（RFC 4648，带补位）
std::string Base64Encode(const uint8_t* data, size_t length);

// HTML 标准的 forgiving-base64 解码：先去掉 ASCII 空白，结尾的补位可以不写。
// 不合法时返回 false。
bool ForgivingBase64Decode(const uint8_t* data, size_t length, std::string* out);

}  // namespace nacre
