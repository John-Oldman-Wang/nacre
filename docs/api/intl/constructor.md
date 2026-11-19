---
type: reference
---

# `Intl.NumberFormat()` 构造函数

**`Intl.NumberFormat()`** 构造函数按给的地区和选项建一个数字格式化对象。

## 语法

```
new Intl.NumberFormat()
new Intl.NumberFormat(locales)
new Intl.NumberFormat(locales, options)
```

不写 `new` 直接调用，效果相同。

### 参数

**`locales`** <small>可选</small>

地区标签，或者地区标签的数组。不传用系统的首选语言。规则见[地区标签](../intl.md#地区标签)。

**`options`** <small>可选</small>

对象，成员见下表。不传全部用默认值。只在构造时读一次，之后改这个对象不影响格式化。

| 选项 | 取值 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `style` | `'decimal'`、`'percent'`、`'currency'` | `'decimal'` | 写成普通的数、百分比，还是金额。`'percent'` 会把数乘以 100：`0.256` 写成 `26%` |
| `currency` | 三个字母的货币代码，比如 `'USD'` | 无 | 哪种货币。`style` 是 `'currency'` 时必须给。大小写不敏感 |
| `currencyDisplay` | `'symbol'`、`'narrowSymbol'`、`'code'`、`'name'` | `'symbol'` | 货币怎么写。美元在 `en-US` 下依次是 `$1,234.50`、`$1,234.50`、`USD 1,234.50`、`1,234.50 US dollars`。`'symbol'` 在别的地区会带上国家（`zh-CN` 下是 `US$`），`'narrowSymbol'` 不带 |
| `currencySign` | `'standard'`、`'accounting'` | `'standard'` | `'accounting'`：负的金额用括号，`-1234.5` 写成 `($1,234.50)` |
| `notation` | `'standard'`、`'compact'`、`'scientific'` | `'standard'` | `'compact'`：`1.2M`。`'scientific'`：`1.235E6` |
| `signDisplay` | `'auto'`、`'always'`、`'exceptZero'`、`'never'`、`'negative'` | `'auto'` | 正负号。`'auto'`：只有负数带。`'always'`：都带，`0` 写成 `+0`。`'exceptZero'`：除了 0 都带。`'never'`：都不带。`'negative'`：只有负数带，舍入后是 0 的负数不带 |
| `useGrouping` | `'auto'`、`'always'`、`'min2'`、`true`、`false` | `'auto'`，紧凑写法下是 `'min2'` | 千分位。`'auto'`：按地区的习惯，西班牙语的四位数不分组，`1234` 就是 `1234`。`'always'` 和 `true`：一律分组，`1.234`。`'min2'`：四位数不分组，五位数起分组。`false`：不分组 |
| `minimumIntegerDigits` | 1 到 21 的整数，是位数 | `1` | 整数部分至少几位，不够的在前面补 0。`3` 时 `1` 写成 `001` |
| `minimumFractionDigits` | 0 到 100 的整数，是位数 | 普通的数和百分比是 `0`，金额看货币 | 小数至少几位，不够的补 0 |
| `maximumFractionDigits` | 0 到 100 的整数，是位数 | 普通的数是 `3`，百分比是 `0`，金额看货币 | 小数最多几位，多的舍入 |
| `minimumSignificantDigits` | 1 到 21 的整数，是位数 | `1` | 有效数字至少几位。给了有效数字的选项，小数位数的选项不起作用 |
| `maximumSignificantDigits` | 1 到 21 的整数，是位数 | `21` | 有效数字最多几位。`3` 时 `1234567.891` 写成 `1,230,000` |
| `roundingMode` | `'halfExpand'`、`'halfEven'`、`'ceil'`、`'floor'`、`'expand'`、`'trunc'` | `'halfExpand'` | 怎么舍入。`'halfExpand'`：四舍五入，正好在中间时往绝对值大的方向进。`'halfEven'`：正好在中间时取偶数，`2.5` 是 `2`。`'ceil'`：往大的方向。`'floor'`：往小的方向。`'expand'`：往绝对值大的方向。`'trunc'`：直接截掉 |
| `roundingIncrement` | 1、2、5、10、20、25、50、100 等 15 个值 | `1` | 最后一位小数按几的倍数舍入。两位小数、`5` 时结果的最后一位只会是 0 或 5。要求 `minimumFractionDigits` 和 `maximumFractionDigits` 相等 |
| `numberingSystem` | 数字系统的名字，比如 `'latn'`、`'arab'` | 地区的默认值 | 用哪一套数字。`'arab'`：`١٬٢٣٤٫٥` |
| `localeMatcher` | `'lookup'`、`'best fit'` | `'best fit'` | 只检查取值，两种的效果相同 |

数值选项给的不是整数时向下取整，`2.7` 当作 `2`。给的是字符串时先转成数，`'2'` 当作 `2`。

### 不支持的选项

下面这些标准里有、这里没有。用到时构造抛 `RangeError`，错误信息是 `<选项>: "<值>" is not supported by this runtime`。

| 选项 | 不支持的取值 |
| --- | --- |
| `style` | `'unit'` |
| `notation` | `'engineering'` |
| `compactDisplay` | `'long'`（紧凑写法只有短的形式） |
| `roundingMode` | `'halfTrunc'`、`'halfCeil'`、`'halfFloor'` |
| `roundingPriority` | `'morePrecision'`、`'lessPrecision'` |
| `trailingZeroDisplay` | `'stripIfInteger'` |
| `minimumIntegerDigits` | 大于 1，并且同时给了有效数字的选项 |

TypeScript 自带的类型认为这些选项都合法，所以类型检查查不出来，只有运行时会抛。

### 返回值

新建的 `Intl.NumberFormat`。

### 异常

**`RangeError`**

- `locales` 不是合法的地区标签，比如 `'en_US'`：`invalid language tag: en_US`。
- 选项的值不在标准规定的范围里，比如 `notation has no value "tiny"; expected one of: standard / scientific / engineering / compact`。
- 用到[不支持的选项](#不支持的选项)，比如 `notation: "engineering" is not supported by this runtime`。

**`TypeError`**

- `locales` 是 `null`：`locales must be a string or an array, got null`。数组里有不是字符串的成员时也抛。
- `options` 是 `null`：`options must be an object, got null`。
- `style` 是 `'currency'` 而没有给 `currency`：`currency is required when style is "currency"`。

## 示例

### 金额

```js
const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
console.log(jpy.format(1234.5));
console.log(eur.format(1234.5));
```

**结果**：控制台输出 `¥1,235` 和 `1.234,50 €`。小数位数由货币决定。德语的金额和 `€` 之间是一个不换行空格（U+00A0）。

### 用了不支持的选项

```js
try {
  new Intl.NumberFormat('en-US', { notation: 'engineering' });
} catch (err) {
  console.log(String(err));
}
```

**结果**：输出 `RangeError: notation: "engineering" is not supported by this runtime`。

## 和 Web 的差别

- [不支持的选项](#不支持的选项)在浏览器里能用，这里构造时抛 `RangeError`。
- 不传 `locales` 时，这里用系统的首选语言本身；Safari 里的网页先把它换成少数几种常见的语言，见[不指定地区时用哪个地区](../intl.md#不指定地区时用哪个地区)。
- 其余（选项的解析、默认值、报错的类型）和 Web 相同。

## 参见

- [`format()`](format.md)
- [`resolvedOptions()`](resolvedoptions.md)：读回实际用的选项
- [按地区显示数字和金额](../../guides/format-numbers.md)
