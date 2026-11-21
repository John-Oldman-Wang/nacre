#include "TextCodec.h"

namespace nacre {

// ---------------------------------------------------------------------------
// UTF-8 解码
// ---------------------------------------------------------------------------
//
// 照 WHATWG Encoding 标准「UTF-8 decoder」那一节的状态机写的，变量名也照它：
// code_point、bytes_seen、bytes_needed、lower_boundary、upper_boundary。
//
// 为什么不用 V8 的 String::NewFromUtf8：它也把非法序列换成 U+FFFD，但只给结果，
// 不说「有没有换过」（fatal 做不了），也不说「结尾是不是停在一个序列中间」
// （stream 做不了）。

bool DecodeUtf8(const uint8_t* data, size_t length, const Utf8DecodeOptions& options,
                Utf8StreamState* state, std::u16string* out) {
  uint32_t code_point = 0;
  int bytes_seen = 0;
  int bytes_needed = 0;
  uint8_t lower_boundary = 0x80;
  uint8_t upper_boundary = 0xBF;

  // 正在凑的那个序列已经收到的字节。stream 模式下结尾没凑齐，就把它们存回 state
  uint8_t pending[3] = {0, 0, 0};
  int pending_count = 0;
  bool bom_seen = state->bom_seen;

  // 输出的码元数不会超过输入的字节数：一个字节最多出一个码元，四个字节的
  // 序列出两个，每个 U+FFFD 至少对应一个字节。先按上限分配，最后截掉多的
  const size_t prefix = state->pending_count;
  const size_t total = prefix + length;
  const size_t base = out->size();
  out->resize(base + total);
  char16_t* write = out->data() + base;

  // 标准里这一步在解码器外面（serialize I/O queue）：流的第一个字符如果是
  // BOM 就丢掉。「第一个字符」包括替换出来的 U+FFFD——先出了错，后面的 BOM 就留着
  auto emit = [&](uint32_t cp) {
    if (!options.ignore_bom && !bom_seen) {
      bom_seen = true;
      if (cp == 0xFEFF) return;
    }
    if (cp < 0x10000) {
      *write++ = static_cast<char16_t>(cp);
    } else {
      cp -= 0x10000;
      *write++ = static_cast<char16_t>(0xD800 + (cp >> 10));
      *write++ = static_cast<char16_t>(0xDC00 + (cp & 0x3FF));
    }
  };
  auto fail = [&]() {
    *state = Utf8StreamState{};
    out->resize(base);
    return false;
  };

  size_t i = 0;
  while (i < total) {
    const uint8_t byte = i < prefix ? state->pending[i] : data[i - prefix];

    if (bytes_needed == 0) {
      if (byte <= 0x7F) {
        emit(byte);
      } else if (byte >= 0xC2 && byte <= 0xDF) {
        bytes_needed = 1;
        code_point = byte & 0x1F;
      } else if (byte >= 0xE0 && byte <= 0xEF) {
        if (byte == 0xE0) lower_boundary = 0xA0;  // 更小的是过长编码
        if (byte == 0xED) upper_boundary = 0x9F;  // 更大的落在代理项范围里
        bytes_needed = 2;
        code_point = byte & 0x0F;
      } else if (byte >= 0xF0 && byte <= 0xF4) {
        if (byte == 0xF0) lower_boundary = 0x90;  // 更小的是过长编码
        if (byte == 0xF4) upper_boundary = 0x8F;  // 更大的超出 U+10FFFF
        bytes_needed = 3;
        code_point = byte & 0x07;
      } else {
        // 落单的后续字节（80–BF）、C0 / C1、F5–FF
        if (options.fatal) return fail();
        emit(0xFFFD);
      }
      if (bytes_needed != 0) {
        pending[0] = byte;
        pending_count = 1;
      }
      i++;
      continue;
    }

    if (byte < lower_boundary || byte > upper_boundary) {
      // 这个字节接不上。前面凑到一半的算一个错误；**这个字节不消耗**，
      // 回到初始状态重新处理它——它可能是下一个字符的开头
      code_point = 0;
      bytes_needed = 0;
      bytes_seen = 0;
      lower_boundary = 0x80;
      upper_boundary = 0xBF;
      pending_count = 0;
      if (options.fatal) return fail();
      emit(0xFFFD);
      continue;
    }

    lower_boundary = 0x80;
    upper_boundary = 0xBF;
    code_point = (code_point << 6) | (byte & 0x3F);
    if (++bytes_seen == bytes_needed) {
      emit(code_point);
      code_point = 0;
      bytes_needed = 0;
      bytes_seen = 0;
      pending_count = 0;
    } else {
      // 还没凑齐才记下来：凑齐的那个字节不用记，四字节序列的第四个字节
      // 记了就写出了 pending 的三个位置
      pending[pending_count++] = byte;
    }
    i++;
  }

  if (options.stream) {
    state->pending_count = static_cast<uint8_t>(pending_count);
    for (int k = 0; k < pending_count; k++) state->pending[k] = pending[k];
    state->bom_seen = bom_seen;
  } else {
    // 流结束了还有没凑齐的：算一个错误
    if (bytes_needed != 0) {
      if (options.fatal) return fail();
      emit(0xFFFD);
    }
    *state = Utf8StreamState{};
  }

  out->resize(static_cast<size_t>(write - out->data()));
  return true;
}

// ---------------------------------------------------------------------------
// Base64
// ---------------------------------------------------------------------------

namespace {

const char kBase64Alphabet[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// 字符 → 6 位的值；不在字母表里的是 -1
int Base64Value(uint8_t c) {
  if (c >= 'A' && c <= 'Z') return c - 'A';
  if (c >= 'a' && c <= 'z') return c - 'a' + 26;
  if (c >= '0' && c <= '9') return c - '0' + 52;
  if (c == '+') return 62;
  if (c == '/') return 63;
  return -1;
}

// HTML 标准说的 ASCII 空白：制表、换行、换页、回车、空格。
// 纵向制表符（0x0B）不算
bool IsAsciiWhitespace(uint8_t c) {
  return c == 0x09 || c == 0x0A || c == 0x0C || c == 0x0D || c == 0x20;
}

}  // namespace

std::string Base64Encode(const uint8_t* data, size_t length) {
  std::string out;
  out.reserve((length + 2) / 3 * 4);
  size_t i = 0;
  for (; i + 3 <= length; i += 3) {
    const uint32_t n = (uint32_t{data[i]} << 16) | (uint32_t{data[i + 1]} << 8) | data[i + 2];
    out.push_back(kBase64Alphabet[(n >> 18) & 0x3F]);
    out.push_back(kBase64Alphabet[(n >> 12) & 0x3F]);
    out.push_back(kBase64Alphabet[(n >> 6) & 0x3F]);
    out.push_back(kBase64Alphabet[n & 0x3F]);
  }
  if (length - i == 1) {
    const uint32_t n = uint32_t{data[i]} << 16;
    out.push_back(kBase64Alphabet[(n >> 18) & 0x3F]);
    out.push_back(kBase64Alphabet[(n >> 12) & 0x3F]);
    out.push_back('=');
    out.push_back('=');
  } else if (length - i == 2) {
    const uint32_t n = (uint32_t{data[i]} << 16) | (uint32_t{data[i + 1]} << 8);
    out.push_back(kBase64Alphabet[(n >> 18) & 0x3F]);
    out.push_back(kBase64Alphabet[(n >> 12) & 0x3F]);
    out.push_back(kBase64Alphabet[(n >> 6) & 0x3F]);
    out.push_back('=');
  }
  return out;
}

// 照 HTML 标准「forgiving-base64 decode」那几步写的，步骤的次序不能换：
// 先去空白，再看长度决定去不去补位，然后才检查字符
bool ForgivingBase64Decode(const uint8_t* data, size_t length, std::string* out) {
  // 1. 去掉所有 ASCII 空白
  std::string text;
  text.reserve(length);
  for (size_t i = 0; i < length; i++) {
    if (!IsAsciiWhitespace(data[i])) text.push_back(static_cast<char>(data[i]));
  }

  // 2. 长度是 4 的倍数时，结尾的一个或两个 = 去掉。
  //    长度不是 4 的倍数时 = 不动，留给第 4 步当成非法字符——所以 'YQ=' 不合法
  size_t n = text.size();
  if (n % 4 == 0 && n > 0) {
    if (text[n - 1] == '=') {
      n--;
      if (text[n - 1] == '=') n--;
    }
  }

  // 3. 余 1 的长度凑不出一个字节
  if (n % 4 == 1) return false;

  // 4、5. 逐个字符解。不在字母表里的（包括剩下的 =）就是不合法
  out->clear();
  out->reserve(n / 4 * 3 + 2);
  uint32_t buffer = 0;
  int bits = 0;
  for (size_t i = 0; i < n; i++) {
    const int value = Base64Value(static_cast<uint8_t>(text[i]));
    if (value < 0) return false;
    buffer = (buffer << 6) | static_cast<uint32_t>(value);
    bits += 6;
    if (bits == 24) {
      out->push_back(static_cast<char>((buffer >> 16) & 0xFF));
      out->push_back(static_cast<char>((buffer >> 8) & 0xFF));
      out->push_back(static_cast<char>(buffer & 0xFF));
      buffer = 0;
      bits = 0;
    }
  }
  // 结尾剩 12 位出一个字节、剩 18 位出两个字节，多出来的 4 位 / 2 位丢掉。
  // 标准不要求丢掉的那几位是 0（'YR==' 和 'YQ==' 解出来一样）
  if (bits == 12) {
    out->push_back(static_cast<char>((buffer >> 4) & 0xFF));
  } else if (bits == 18) {
    out->push_back(static_cast<char>((buffer >> 10) & 0xFF));
    out->push_back(static_cast<char>((buffer >> 2) & 0xFF));
  }
  return true;
}

}  // namespace nacre
