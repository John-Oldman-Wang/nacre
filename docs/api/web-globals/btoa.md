---
type: reference
web: btoa()
---

# `btoa()` 全局函数

**`btoa()`** 全局函数把字节编码成 Base64 文本。它的参数是「每个字符是一个字节」的字符串，不是任意文字。

## 语法

```
btoa(data)
```

### 参数

**`data`**

[「每个字符是一个字节」的字符串](../web-globals.md#每个字符是一个字节的字符串)：每个字符的编码在 0 到 255 之间。不是字符串的值先转成字符串：`btoa(null)` 编码的是 `'null'` 这四个字母。

### 返回值

Base64 字符串。只含 `A–Z`、`a–z`、`0–9`、`+`、`/`，结尾用 `=` 补到长度是 4 的倍数。

### 异常

**`Error`**，`name` 是 `InvalidCharacterError`

字符串里有编码大于 255 的字符（汉字、表情）：`btoa: the string contains characters outside of the Latin1 range (code points above 0xFF). To encode arbitrary text, convert it to UTF-8 bytes with TextEncoder first`

**`TypeError`**

不给参数：`btoa: 1 argument required, but only 0 present`

## 说明

要把任意文字编码成 Base64，先用 [`TextEncoder`](../text-encoder.md) 转成字节，写法见[把文字编码成 Base64](../../guides/text-and-bytes.md#把文字编码成-base64)。直接写 `btoa('你好，世界')` 会抛 `InvalidCharacterError`。

## 示例

```js
const bytes = new Uint8Array([72, 105, 255]);
const binary = String.fromCharCode(...bytes);
console.log(btoa(binary));
console.log(btoa('hello'));
```

**结果**：输出 `SGn/`，然后 `aGVsbG8=`。**未在模拟器验证。**

## 和 Web 的差别

浏览器抛出的是 `DOMException`，这里是 `Error`，`name` 相同（`InvalidCharacterError`）。按 `err.name` 判断的代码照常工作，按 `instanceof DOMException` 判断的不行，这里没有 `DOMException` 这个类。

## 参见

- [`atob()`](atob.md)：反过来解码
- [Base64 的两个函数处理的是字节，不是文字](../web-globals.md#base64-的两个函数处理的是字节不是文字)
