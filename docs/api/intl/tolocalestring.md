---
type: reference
---

# `Number.prototype.toLocaleString()` 方法

**`toLocaleString()`** 方法按地区把一个数写成文字。它等于 `new Intl.NumberFormat(locales, options).format(这个数)`。`BigInt.prototype.toLocaleString()` 相同。

## 语法

```
toLocaleString()
toLocaleString(locales)
toLocaleString(locales, options)
```

### 参数

**`locales`** <small>可选</small>

同 [`Intl.NumberFormat()`](constructor.md) 构造函数。

**`options`** <small>可选</small>

同 [`Intl.NumberFormat()`](constructor.md) 构造函数。

### 返回值

字符串。

### 异常

同 [`Intl.NumberFormat()`](constructor.md#异常) 构造函数。

## 说明

数组和类型化数组的 `toLocaleString()` 会把这两个参数传给每个成员。成员之间固定用英文逗号连接，和小数点用的逗号分不开，所以给人看的列表不要这样写，自己逐个格式化再连接。

对一组数反复格式化时，建一个 `Intl.NumberFormat` 反复用，不要对每个数调一次带选项的 `toLocaleString()`。

## 示例

### 一个数

```js
console.log((1234567.891).toLocaleString('de-DE'));
console.log((1234.5).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
```

**结果**：控制台输出 `1.234.567,891` 和 `$1,234.50`。

### 数组

```js
console.log([1234.5, 0.5].toLocaleString('de-DE'));
```

**结果**：控制台输出 `1.234,5,0,5`。

## 和 Web 的差别

和 `Intl.NumberFormat` 的差别相同，见 [`Intl.NumberFormat`](../intl.md#和-web-的差别)。

## 参见

- [`format()`](format.md)
