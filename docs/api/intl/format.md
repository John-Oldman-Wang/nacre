---
type: reference
---

# `Intl.NumberFormat`：`format()` 方法

**`format()`** 方法按这个格式化对象的地区和选项，把一个值写成文字。

## 语法

```
format(value)
```

`format` 已经绑定在这个对象上，可以单独取出来用，比如直接交给 `map`。

### 参数

**`value`**

数、`BigInt`，或者写着数的字符串。

- 别的值按 `Number()` 转：`null` 是 `0`，`undefined` 和转不成数的字符串是 `NaN`，`true` 是 `1`。
- 写成普通十进制的字符串（`'1234.5'`）按原样的每一位格式化，不先变成普通的数，所以超过 16 位也不丢。

### 返回值

字符串。

- `NaN` 写成 `NaN`。`Infinity` 写成 `∞`。`-0` 写成 `-0`。
- 普通的数只有约 16 位有效数字，超过的位在写进代码的那一刻就丢了。超过 16 位的整数用 `BigInt`。

### 异常

**`RangeError`**

`BigInt` 或十进制字符串超过 38 位有效数字：`numbers with more than 38 significant digits are not supported by this runtime`。

## 示例

### 几种值

```js
const plain = new Intl.NumberFormat('en-US');
console.log(plain.format(1234567.891));
console.log(plain.format('1234.5'));
console.log(plain.format(NaN));
```

**结果**：控制台输出 `1,234,567.891`、`1,234.5`、`NaN`。

### 交给 `map`

```js
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log([19.99, 5, 1200].map(usd.format).join(' / '));
```

**结果**：控制台输出 `$19.99 / $5.00 / $1,200.00`。

### 很大的整数

```js
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890n));
```

**结果**：控制台输出 `12,345,678,901,234,567,890`。

## 和 Web 的差别

`BigInt` 和十进制字符串最多 38 位有效数字，浏览器不限。其余和 Web 相同。

## 参见

- [`Number.prototype.toLocaleString()`](tolocalestring.md)：一次性的写法
- [构造函数](constructor.md)：选项
