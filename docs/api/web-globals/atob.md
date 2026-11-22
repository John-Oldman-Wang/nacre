---
type: reference
web: atob()
---

# `atob()` 全局函数

**`atob()`** 全局函数把 Base64 文本解码成字节。返回的是「每个字符是一个字节」的字符串。

## 语法

```
atob(data)
```

### 参数

**`data`**

Base64 字符串。不是字符串的值先转成字符串。

- 里面的空格、制表符、换行、换页、回车先被去掉，可以出现在任何位置。
- 结尾的 `=` 可以不写：`atob('YQ')` 和 `atob('YQ==')` 结果相同。

### 返回值

[「每个字符是一个字节」的字符串](../web-globals.md#每个字符是一个字节的字符串)。原文是文字时，还要用 [`TextDecoder`](../text-decoder.md) 解码一次。

### 异常

**[`DOMException`](../dom-exception.md)**，`name` 是 `InvalidCharacterError`，`code` 是 5

下面几种情况抛出，报错原文都是 `atob: the string is not correctly encoded Base64`：

- 有 Base64 字母表之外的字符。`-` 和 `_`（URL 里用的那种 Base64）也不认。
- 去掉空白之后长度除以 4 余 1，比如 `'Y'`。
- `=` 的位置或个数不对，比如 `'YQ='`、`'YQ==='`、`'Y=Q='`。

**`TypeError`**

不给参数：`atob: 1 argument required, but only 0 present`

## 示例

```js
const binary = atob('SGn/');
const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
console.log(binary.length, Array.from(bytes));
console.log(atob('aGVs bG8'));
```

**结果**：输出 `3 [72,105,255]`，然后 `hello`：空格被去掉，结尾的 `=` 可以不写。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`btoa()`](btoa.md)：反过来编码
- [把文字编码成 Base64](../../guides/text-and-bytes.md#把文字编码成-base64)：和文字之间的转换
