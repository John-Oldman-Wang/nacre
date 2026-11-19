---
type: reference
web: TextEncoder.encode()
---

# `TextEncoder`：`encode()` 方法

**`encode()`** 方法把字符串编码成 UTF-8 的字节。

## 语法

```
encode([input])
```

### 参数

**`input`**

字符串，可以不给。不给或者给 `undefined` 时当成空串。别的类型先转成字符串：`encode(null)` 编码的是 `'null'` 这四个字母，`encode(12.5)` 编码的是 `'12.5'`。

### 返回值

一个新的 `Uint8Array`，长度是字节数。

一个字符占的字节数不固定：英文字母 1 个字节，带重音的字母 2 个，汉字 3 个，表情 4 个，见[码元、字符和字节](../text-encoder.md#码元字符和字节)。落单的代理项（半个表情）编码成 `�` 的三个字节 `ef bf bd`，不抛异常。

### 异常

**`TypeError`**

参数是 `Symbol`。

## 说明

每次调用返回一个新数组。要反复往同一块缓冲区里写，用 [`encodeInto()`](encodeinto.md)。

## 示例

```js
const bytes = new TextEncoder().encode('你好');
console.log(bytes.length, Array.from(bytes));
console.log(new TextEncoder().encode('a你😀').length);
```

**结果**：输出 `6 [228,189,160,229,165,189]`，然后 `8`。**未在模拟器验证。**

## 和 Web 的差别

和 Web 相同。

## 参见

- [`encodeInto()`](encodeinto.md)：写进已有的数组
- [`TextDecoder.decode()`](../text-decoder/decode.md)：反过来解码
