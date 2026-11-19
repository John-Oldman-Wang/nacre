---
type: reference
---

# `TextDecoder`

**`TextDecoder`** 表示一个把 UTF-8 字节解码成字符串的解码器。它接受 `ArrayBuffer` 和任何类型数组、`DataView`。

它是 Web 标准里的同名类，App 启动时就存在。**只支持 UTF-8**，别的编码在创建时抛 `RangeError`。反方向的转换用 [`TextEncoder`](text-encoder.md)。这一组 API 的总览见[文字、字节和深拷贝](web-globals.md)。

**继承关系**：`TextDecoder` 不继承任何类。

怎么在文字和字节之间转换，见指南[在文字和字节之间转换](../guides/text-and-bytes.md)。

## 构造函数

[`TextDecoder()`](text-decoder/constructor.md)

创建一个解码器。可以指定遇到不合法的字节时是否抛异常、是否保留 BOM。

## 实例属性

这三个值创建之后不会变。

| 属性 | 说明 |
| --- | --- |
| [`encoding`](text-decoder/encoding.md) <small>只读</small> | 总是 `'utf-8'` |
| [`fatal`](text-decoder/fatal.md) <small>只读</small> | 遇到不合法的字节时是否抛异常 |
| [`ignoreBOM`](text-decoder/ignorebom.md) <small>只读</small> | 是否保留开头的 BOM |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`decode()`](text-decoder/decode.md) | 把一段字节解码成字符串。数据分几段到达时可以逐段解 |

## 字节不是合法的 UTF-8 时

解码不会失败，也不会丢掉后面的内容。不合法的那几个字节换成 `�`（U+FFFD，替换字符），其余照常解码。

要在遇到不合法的字节时得到一个异常，创建时写 `new TextDecoder('utf-8', { fatal: true })`。这时 [`decode()`](text-decoder/decode.md) 抛 `TypeError`。校验一段数据是不是合法的 UTF-8 用这个写法。

## BOM

BOM 是文件开头的一个不可见字符（U+FEFF），UTF-8 里是三个字节 `ef bb bf`。有些软件（Windows 上的记事本、Excel 导出的 CSV）会在文件开头加它。

`decode()` 默认去掉开头的这一个 BOM，所以解出来的字符串可以直接用。要保留它，创建时写 `{ ignoreBOM: true }`。不在开头的 BOM 不会被去掉。

## 示例

```js
const bytes = new Uint8Array([0xe4, 0xbd, 0xa0, 0xe5, 0xa5, 0xbd]);
console.log(new TextDecoder().decode(bytes));
```

**结果**：输出 `你好`。**未在模拟器验证。**

## 和 Web 的差别

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 支持的编码 | UTF-8、UTF-16、GBK、Shift_JIS 等几十种 | 只有 UTF-8。别的在创建时抛 `RangeError` |
| `TextDecoderStream` | 有 | 没有 |

## 参见

- [`TextEncoder`](text-encoder.md)：把字符串编码成字节
- [在文字和字节之间转换](../guides/text-and-bytes.md)：分段解码、校验 UTF-8、从 Base64 解回文字
- [`fetch()`](fetch.md)：`response.text()` 已经做了解码，读网络内容一般不需要自己解码
