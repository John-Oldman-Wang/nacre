---
type: reference
---

# `TextEncoder`

**`TextEncoder`** 表示一个把字符串编码成 UTF-8 字节的编码器。字节是 `Uint8Array`，可以作网络请求的内容、写进文件、交给加密函数。

它是 Web 标准里的同名类，App 启动时就存在。编码器没有状态，一个可以反复用。反方向的转换用 [`TextDecoder`](text-decoder.md)。这一组 API 的总览见[文字、字节和深拷贝](web-globals.md)。

**继承关系**：`TextEncoder` 不继承任何类。

怎么在文字和字节之间转换，见指南[在文字和字节之间转换](../guides/text-and-bytes.md)。

## 构造函数

[`TextEncoder()`](text-encoder/constructor.md)

创建一个编码器。没有参数。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`encoding`](text-encoder/encoding.md) <small>只读</small> | 总是 `'utf-8'` |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`encode()`](text-encoder/encode.md) | 把字符串编码成一个新的 `Uint8Array` |
| [`encodeInto()`](text-encoder/encodeinto.md) | 把字符串编码进一个已有的 `Uint8Array`，返回读了多少、写了多少 |

## 码元、字符和字节

JS 字符串的 `length` 数的是码元，一个码元 16 位。常用的字符（字母、汉字）占一个码元。表情和一部分生僻字占两个码元，这两个码元合起来叫一对代理项。

UTF-8 的字节数是另一个数：

| 字符 | 码元数（`length`） | UTF-8 字节数 |
| --- | --- | --- |
| `a` | 1 | 1 |
| `é` | 1 | 2 |
| `你` | 1 | 3 |
| `😀` | 2 | 4 |

[`encodeInto()`](text-encoder/encodeinto.md) 返回的 `read` 按码元数算，`written` 按字节数算。

一对代理项只剩一半时（比如把一个表情从中间切开），这半个不是合法的字符。`encode()` 把它编码成 `�` 的三个字节 `ef bf bd`，不抛异常。

## 示例

```js
const encoder = new TextEncoder();
const bytes = encoder.encode('你好');
console.log(bytes.length, Array.from(bytes));
```

**结果**：输出 `6 [228,189,160,229,165,189]`：两个汉字各占 3 个字节。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。浏览器里还有 `TextEncoderStream`，这里没有。

## 参见

- [`TextDecoder`](text-decoder.md)：把字节解码成字符串
- [在文字和字节之间转换](../guides/text-and-bytes.md)：算字节数、反复写同一块缓冲区、编码成 Base64
- [文字、字节和深拷贝](web-globals.md)：这一组 API 的总览
