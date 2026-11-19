# 按地区显示数字和金额

这一篇讲怎么用 [`Intl.NumberFormat`](../api/intl.md) 按用户的地区显示数字、金额、百分比和大数。每个选项的细节在 [`Intl.NumberFormat()`](../api/intl/constructor.md) 构造函数的页面。

## 推荐的做法

- **给用户看的数字不指定地区，让它跟随系统。** 要固定成某种写法时才指定，比如固定用英文写法显示代码里的数值。不指定时用哪个地区，见[不指定地区时用哪个地区](../api/intl.md#不指定地区时用哪个地区)。
- **一组数用同一个格式化对象。** 对一组数反复格式化时，建一个 `Intl.NumberFormat` 反复用，不要对每个数调一次带选项的 `toLocaleString()`。
- **不要把格式化的结果当作固定的字符串去比较或解析。** 不同设备、不同系统版本的结果可能差一个字符。要比较数值，比较数本身。
- **超过 16 位的整数用 `BigInt`。** 普通的数只有约 16 位有效数字。

## 第一个例子

```js
const price = 1234.5;

// 1. 按系统的地区写数字
console.log(price.toLocaleString());

// 2. 写成货币。地区决定写法，currency 决定是哪种货币
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
console.log(usd.format(price));

// 3. 同一个格式化对象可以反复用
console.log([19.99, 5, 1200].map(usd.format).join(' / '));

// 4. 写成百分比
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
console.log(percent.format(0.256));

// 5. 大数写成紧凑的形式
console.log(new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(1234567.891));
```

**结果**：系统语言是简体中文时，控制台依次输出：

```
1,234.5
$1,234.50
$19.99 / $5.00 / $1,200.00
25.6%
123万
```

这段代码没有作为一个整体在模拟器运行过。其中每一种调用都在验收用例里和网页比对过。

## 显示金额

```js
const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
console.log(jpy.format(1234.5));
console.log(eur.format(1234.5));
```

**结果**：控制台输出 `¥1,235` 和 `1.234,50 €`。

- 小数位数由货币决定：日元没有小数，美元和欧元两位。不用自己写 `maximumFractionDigits`。
- 地区和货币是两回事。`zh-CN` 配 `USD` 得到 `US$1,234.50`：写法是中文的，货币是美元。
- `style` 是 `'currency'` 时必须给 `currency`，否则抛 `TypeError`。
- 德语的金额和 `€` 之间是一个不换行空格（U+00A0），不是普通空格。

## 固定小数位数

```js
const fixed = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
console.log(fixed.format(1234.5));
console.log(fixed.format(1.005));
```

**结果**：控制台输出 `1,234.50` 和 `1.01`。

舍入是四舍五入：正好在中间时往绝对值大的方向进。`2.5` 不留小数是 `3`，`3.5` 是 `4`。要换规则用 `roundingMode`，见[构造函数](../api/intl/constructor.md)。

## 显示涨跌幅

```js
const change = new Intl.NumberFormat('en-US', {
  style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero',
});
console.log(change.format(0.0312));
console.log(change.format(-0.0105));
console.log(change.format(0));
```

**结果**：控制台输出 `+3.12%`、`-1.05%`、`0%`。**这三个输出未在模拟器验证**；`signDisplay: 'exceptZero'` 配百分比这一组选项在验收用例里和网页比对过，用的是别的数值。

`signDisplay` 的五种取值见[构造函数](../api/intl/constructor.md)。

## 把大数写短

```js
console.log(new Intl.NumberFormat('en-US', { notation: 'compact' }).format(1234567.891));
console.log(new Intl.NumberFormat('en-US', { notation: 'compact' }).format(12345));
console.log(new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(12345));
```

**结果**：控制台输出 `1.2M`、`12K`、`1.2万`。

紧凑写法默认保留两位有效数字。单位跟着地区走：英文按千、百万，中文按万、亿。

## 不要千分位

```js
console.log(new Intl.NumberFormat('en-US', { useGrouping: false }).format(1234567.891));
```

**结果**：控制台输出 `1234567.891`。

## 一列数用同一种写法

```js
const amounts = [19.99, 5, 1200];
const labels = amounts.map(usd.format);
console.log(labels.join(' / '));
```

这一节沿用[第一个例子](#第一个例子)里的 `usd`。

**结果**：控制台输出 `$19.99 / $5.00 / $1,200.00`。

`usd.format` 是一个已经绑定好的函数，可以直接交给 `map`，不用写成 `(n) => usd.format(n)`。

## 格式化很大的整数

```js
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890n));
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890));
```

**结果**：第一行输出 `12,345,678,901,234,567,890`。第二行输出 `12,345,678,901,234,567,000`：普通的数只有约 16 位有效数字，后面的位在写进代码的那一刻就丢了。**第二行的输出未在模拟器验证。**

超过 16 位的整数用 `BigInt`（数字后面加 `n`）。`BigInt` 最多支持 38 位有效数字，再长的抛 `RangeError`。

## 参见

- [`Intl.NumberFormat`](../api/intl.md)：和浏览器一致到什么程度、地区标签、不支持的选项
- [按地区显示日期和时间](format-dates.md)
