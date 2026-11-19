---
type: reference
web: TextDecoder()
---

# `TextDecoder()` 构造函数

**`TextDecoder()`** 构造函数创建一个把 UTF-8 字节解码成字符串的解码器。

## 语法

```
new TextDecoder([label[, options]])
```

### 参数

**`label`**

可选。编码的名字，默认 `'utf-8'`。只认 UTF-8 的几种写法：`utf-8`、`utf8`、`unicode-1-1-utf-8`、`unicode11utf8`、`unicode20utf8`、`x-unicode20utf8`。不分大小写，首尾的空白会被去掉。

**`options`**

可选，一个对象。`null` 和 `undefined` 当成没给。

**`options.fatal`**

布尔，默认 `false`。`true`：遇到不合法的字节时 [`decode()`](decode.md) 抛 `TypeError`。`false`：换成 `�`（U+FFFD，替换字符）。

**`options.ignoreBOM`**

布尔，默认 `false`。`true`：保留开头的 [BOM](../text-decoder.md#bom)。`false`：去掉。

两个键的值按布尔转换：`{ fatal: 1 }` 是 `true`，`{ fatal: 'false' }` 也是 `true`（非空字符串）。

### 返回值

新建的 `TextDecoder`。

### 异常

**`RangeError`**

别的编码，或者不认识的名字：`TextDecoder: the encoding "gbk" is not supported. This runtime only decodes UTF-8; expected one of: utf-8, utf8, unicode-1-1-utf-8, unicode11utf8, unicode20utf8, x-unicode20utf8`

**`TypeError`**

`options` 不是对象（比如数字）：`TextDecoder: the options must be an object`

## 示例

```js
const strict = new TextDecoder('UTF8', { fatal: true });
console.log(strict.encoding, strict.fatal, strict.ignoreBOM);
```

**结果**：输出 `utf-8 true false`。**未在模拟器验证。**

## 和 Web 的差别

浏览器支持 UTF-8、UTF-16、GBK、Shift_JIS 等几十种编码。这里只有 UTF-8，别的在创建时抛 `RangeError`。

## 参见

- [`decode()`](decode.md)
