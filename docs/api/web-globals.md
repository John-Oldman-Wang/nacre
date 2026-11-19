---
type: reference
status: partial
---

# 文字、字节和深拷贝

**文字、字节和深拷贝**这一组全局 API 负责字符串和字节之间的转换，以及值的深拷贝。它们是 Web 标准里的同名 API，App 启动时就存在，不需要引入。

| 全局 | 做什么 |
| --- | --- |
| [`TextEncoder`](text-encoder.md) | 类。把字符串编码成 UTF-8 的字节 |
| [`TextDecoder`](text-decoder.md) | 类。把 UTF-8 的字节解码成字符串 |
| [`btoa()`](web-globals/btoa.md) | 函数。把字节编码成 Base64 文本 |
| [`atob()`](web-globals/atob.md) | 函数。把 Base64 文本解码成字节 |
| [`structuredClone()`](web-globals/structuredclone.md) | 函数。深拷贝一个值 |

两个类各有自己的页面。这一页是三个函数的页面。

怎么在文字、字节和 Base64 之间转换，怎么深拷贝，见指南[在文字和字节之间转换](../guides/text-and-bytes.md)。

> **注意**：这一组 API 的结果标了「未在模拟器验证」的，来自标准（WHATWG Encoding、HTML）和验收用例里写的期望值。

## 函数

[`btoa()`](web-globals/btoa.md)

把「每个字符是一个字节」的字符串编码成 Base64。

[`atob()`](web-globals/atob.md)

把 Base64 解码成「每个字符是一个字节」的字符串。

[`structuredClone()`](web-globals/structuredclone.md)

深拷贝一个值：对象、数组、`Map`、`Set`、`Date`、二进制数据，一层一层全部复制。

## 字符串和字节是两种东西

网络请求的内容、文件、加密函数的输入都是字节（`Uint8Array`）。JS 的字符串不是字节，它是一串 16 位的码元。两者之间要转换：

- 字符串变字节用 [`new TextEncoder().encode(text)`](text-encoder/encode.md)。
- 字节变字符串用 [`new TextDecoder().decode(bytes)`](text-decoder/decode.md)。

转换用的编码是 UTF-8。一个字符占的字节数不固定，所以字节数和 `text.length` 一般不相等，见[码元、字符和字节](text-encoder.md#码元字符和字节)。**只支持 UTF-8。**

## Base64 的两个函数处理的是字节，不是文字

`btoa()` 的参数是字符串，但它把每个字符当成一个字节（0–255）。字符串里有汉字或表情时，`btoa()` 抛异常，`name` 是 `InvalidCharacterError`。

要把任意文字编码成 Base64，先用 `TextEncoder` 转成字节，写法见[把文字编码成 Base64](../guides/text-and-bytes.md#把文字编码成-base64)。

`atob()` 反过来：它返回的字符串里每个字符是一个字节。原文是文字时，还要用 `TextDecoder` 解码一次。

## 「每个字符是一个字节」的字符串

`btoa()` 的参数和 `atob()` 的返回值都是这种字符串：每个字符的编码在 0 到 255 之间，代表一个字节。它不是给人看的文字，只是字节的另一种装法。

在它和 `Uint8Array` 之间转换：

```js
const bytes = new Uint8Array([72, 105, 255]);
const binary = String.fromCharCode(...bytes);
const again = Uint8Array.from(binary, (c) => c.charCodeAt(0));
console.log(binary.length, again[2]);
```

**结果**：输出 `3 255`。**未在模拟器验证。**

> **注意**：`String.fromCharCode(...bytes)` 把每个字节当成一个参数传进去。字节很多（几万个以上）时改用循环拼接，见[把文字编码成 Base64](../guides/text-and-bytes.md#把文字编码成-base64)里的写法。

## 哪些值不能深拷贝

`structuredClone()` 复制的是数据。下面这些不是数据，传进去时抛异常，`name` 是 `DataCloneError`：

- 函数、`Symbol`。
- 原生对象：`UIView`、`UIColor`、`UIImage`、`Blob`，以及所有其他原生类的实例。
- 结构体：`CGRect`、`CGPoint` 等。
- 事件和事件源：`Event`、`EventTarget`、`application`。
- `URL`、`Headers`、`Request`、`Response` 等运行时自己的类的实例。
- `WeakMap`、`WeakSet`、`WeakRef`、`Promise`。

要拷贝的对象里只要有一处是上面这些，整个调用就抛异常，不会返回拷贝了一半的结果。

自己写的类的实例可以拷贝，但得到的是普通对象：字段都在，方法和原型没有了。

## 示例

下面的代码把一段文字转成字节，再编码成 Base64，然后原路解回来，最后深拷贝一个对象。它不需要界面，直接写在 `main.js` 顶层就能运行。

```js
// 1. 文字 → UTF-8 的字节
const encoder = new TextEncoder();
const bytes = encoder.encode('你好');
console.log(bytes.length, Array.from(bytes));

// 2. 字节 → Base64 文本。btoa 要的是「每个字符一个字节」的字符串
const base64 = btoa(String.fromCharCode(...bytes));
console.log(base64);

// 3. Base64 文本 → 字节 → 文字
const back = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
console.log(new TextDecoder().decode(back));

// 4. 深拷贝：改拷贝出来的，原来的不变
const settings = { theme: 'dark', recent: [1, 2, 3], savedAt: new Date() };
const copy = structuredClone(settings);
copy.recent.push(4);
console.log(settings.recent.length, copy.recent.length, copy.savedAt instanceof Date);
```

**结果**（未在模拟器验证）：控制台依次输出

- `6 [228,189,160,229,165,189]`：两个汉字各占 3 个字节。
- `5L2g5aW9`
- `你好`
- `3 4 true`：拷贝里的数组是另一个数组，`Date` 还是 `Date`。

## 和 Web 的差别

三个函数的名字、参数、返回值和浏览器里的相同。不同的地方：

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| `btoa`、`atob`、`structuredClone` 出错时抛出的对象 | `DOMException` | `Error`，`name` 相同（`InvalidCharacterError`、`DataCloneError`）。按 `err.name` 判断的代码照常工作，按 `instanceof DOMException` 判断的不行，这里没有 `DOMException` 这个类 |
| `structuredClone(value, { transfer: [buffer] })` | 把 `buffer` 转移给拷贝，原来的不能再用 | 抛 `DataCloneError`。不写 `transfer`，`buffer` 会被复制一份 |
| `structuredClone(new SharedArrayBuffer(8))` | 拷贝和原来的共用同一块内存 | 抛 `DataCloneError` |
| `structuredClone(new Blob(['x']))` | 可以 | 抛 `DataCloneError` |

两个类的差别见 [`TextEncoder`](text-encoder.md#和-web-的差别) 和 [`TextDecoder`](text-decoder.md#和-web-的差别)。

## 还不能做的

| 想做的事 | 对应的 Web 能力 | 状态 |
| --- | --- | --- |
| 解码 GBK、UTF-16 等别的编码的文字 | `new TextDecoder('gbk')` | 未实现 |
| 拷贝时把 `ArrayBuffer` 转移过去而不是复制 | `structuredClone()` 的 `transfer` | 未实现 |
| 深拷贝 `Blob` | `structuredClone(blob)` | 未实现 |
| 边读数据流边解码 | `TextDecoderStream` | 未实现。用 `decode()` 的 `stream` 选项逐段解码 |
| 判断异常是不是 `DOMException` | `DOMException` 类 | 未实现。用 `err.name` 判断 |

## 参见

- [在文字和字节之间转换](../guides/text-and-bytes.md)：算字节数、分段解码、Base64、深拷贝的写法
- [`TextEncoder`](text-encoder.md)、[`TextDecoder`](text-decoder.md)：文字和字节互转的两个类
- [`fetch()`](fetch.md)：`response.text()` 和 `response.arrayBuffer()` 已经做了字节和文字的转换，读网络内容一般不需要自己解码
- [文件读写](filesystem.md)：读写文件的文字和字节
- [`crypto`](crypto.md)：生成随机字节，配合 `btoa()` 可以得到随机的文本令牌
- [运行时怎么工作](how-it-works.md)：有哪些全局对象
