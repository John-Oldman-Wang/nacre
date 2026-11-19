---
type: reference
---

# `String.prototype.normalize()` 方法

**`normalize()`** 方法把字符串换成 Unicode 的规范形式。它是字符串自己的方法，不属于 `Intl`，写法和浏览器里相同。

同一个字可以有几种写法：`é` 可以是一个字符（U+00E9），也可以是 `e` 后面跟一个组合记号（U+0065 U+0301）。两种写法显示出来一样，但 `===` 不相等、`length` 不同。比较、查找、当键用之前先规范化，两种写法就变成同一个字符串。

## 语法

```
normalize()
normalize(form)
```

### 参数

**`form`** <small>可选</small>

下面四个字符串之一，不传是 `'NFC'`。名字分大小写。

| `form` | 做什么 | `'ﬁ'`（连字 ﬁ）的结果 |
| --- | --- | --- |
| `'NFC'` | 能合成一个字符的合成 | 不变 |
| `'NFD'` | 拆成基字加组合记号 | 不变 |
| `'NFKC'` | 先把兼容字符换成普通字符，再合成 | `fi` 两个字符 |
| `'NFKD'` | 先把兼容字符换成普通字符，再拆开 | `fi` 两个字符 |

兼容字符指连字、带圈数字、全角字母、半角片假名这一类：`'①'.normalize('NFKC')` 是 `'1'`，`'ｱ'.normalize('NFKC')` 是 `'ア'`。`'NFKC'` 和 `'NFKD'` 会丢掉这些区别，用来做搜索合适，不要用来保存用户输入的原文。

### 返回值

新的字符串，原来的不变。

结果和同一台设备上网页里的 `normalize()` 逐条相同，用的是系统的 Unicode 数据，所以新版 Unicode 加的字跟着系统版本走。

### 异常

**`RangeError`**

`form` 不是这四个之一，`'nfc'` 也算：`The normalization form should be one of NFC, NFD, NFKC, NFKD.`。类型检查查不出这个错，`form` 的类型是 `string`。

## 示例

```js
/** @type {string} */
const a = 'caf\u00e9';   // é 是一个字符
const b = 'cafe\u0301';  // e + 组合记号
console.log(a === b, a.length, b.length);
console.log(a.normalize() === b.normalize());
console.log(b.normalize().length, a.normalize('NFD').length);
```

**结果**：控制台输出 `false 4 5`、`true`、`4 5`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`Intl.NumberFormat`](../intl.md)
