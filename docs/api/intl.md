---
type: reference
status: partial
---

# `Intl`

`Intl` 是 ECMAScript 的国际化接口，把数字、日期等按某个地区的习惯写成文字。同一个数 1234567.891，美国写成 `1,234,567.891`，德国写成 `1.234.567,891`，印度写成 `12,34,567.891`。

现在提供两个成员：

- **`Intl.NumberFormat`**：数字、金额、百分比。`Number.prototype.toLocaleString()` 和 `BigInt.prototype.toLocaleString()` 用的是它。这一页讲它。
- **[`Intl.DateTimeFormat`](intl-date.md)**：日期和时间。`Date` 的三个 `toLocale*String()` 用的是它。

排序、相对时间等其他成员还没有，见[还不能做的](#还不能做的)。

**写法和浏览器里完全相同**，按标准（ECMA-402）实现。已经会用浏览器里的 `Intl.NumberFormat` 的话，直接照原样写。

## 结果和浏览器一致吗

**指定了地区时，和同一台设备上的 Safari 逐条相同。** 地区的数据（分隔符用什么、货币符号怎么写）来自 iOS 系统，Safari 用的也是这一份。验收用例在同一台设备的网页里和运行时里各跑一遍四万多条调用，逐条比对。

**不指定地区时可能和 Safari 不同**：用哪个地区，两边的取法不一样，见[下一节](#不指定地区时用哪个地区)。

和 Chrome 不保证每个字符都相同。Chrome 自带另一份地区数据，它和 Safari 之间本来就有差别：实测同一批数字的调用有 5.8% 的结果不同（日期是 21.4%），比如瑞士德语的千分位，Safari 用 `'`，Chrome 用 `’`。选项怎么解析、默认值是什么、什么情况报错，三者相同。

所以不要把格式化的结果当作固定的字符串去比较或解析。要比较数值，比较数本身。

## 不指定地区时用哪个地区

用系统的首选语言，也就是「设置 → 通用 → 语言与地区」里排在第一位的那个语言，连同它的地区。

```js
console.log(new Intl.NumberFormat().resolvedOptions().locale);
```

**结果**：系统语言是简体中文、地区是中国大陆时，控制台输出 `zh-CN`；简体中文、地区是香港时输出 `zh-Hans-HK`；德语、地区是奥地利时输出 `de-AT`。

给用户看的数字和日期不指定地区，让它跟随系统。要固定成某种写法时才指定，比如固定用英文写法显示代码里的数值。

> **注意**：这一条和 Safari 不同。Safari 里的网页拿到的不是系统语言本身：浏览器会先把它换成少数几种常见的语言，让网站没法靠语言设置认出用户。所以同一台手机上，网页里不指定地区的结果可能和这里不同：
>
> | 系统的首选语言 | 这里 | Safari 里的网页 |
> | --- | --- | --- |
> | 简体中文（香港） | `zh-Hans-HK` | `zh-CN` |
> | 德语（奥地利） | `de-AT` | `de-DE` |
> | 法语（瑞士） | `fr-CH` | `fr-FR` |
> | 英语（爱尔兰） | `en-IE` | `en-GB` |
> | 日语（日本） | `ja-JP` | `ja` |
>
> App 里的代码是你自己写的，不存在被网站识别的问题，所以这里按用户实际选的地区来。比如德语奥地利的金额写法和德语德国不同，用户选了奥地利，就按奥地利的写。语言和地区一致时（简体中文加中国大陆、英语加美国）两边相同。

## 有些选项不支持

iOS 系统公开的格式化接口比标准少几样。**用到不支持的选项时，构造 `Intl.NumberFormat` 会抛 `RangeError`**，错误信息里写明是哪个选项：

```
RangeError: notation: "engineering" is not supported by this runtime
```

不支持的选项列在[不支持的选项](#不支持的选项)里。它们不会被悄悄忽略：一个舍入或者精度的选项没有生效而又不报错，显示金额时会出错而且很难发现。

TypeScript 自带的类型认为这些选项都合法，所以类型检查查不出来，只有运行时会抛。

## 完整例子

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

## 常见用法

### 显示金额

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

### 固定小数位数

```js
const fixed = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
console.log(fixed.format(1234.5));
console.log(fixed.format(1.005));
```

**结果**：控制台输出 `1,234.50` 和 `1.01`。

舍入是四舍五入：正好在中间时往绝对值大的方向进。`2.5` 不留小数是 `3`，`3.5` 是 `4`。要换规则用 `roundingMode`，见[选项](#选项)。

### 显示涨跌幅

```js
const change = new Intl.NumberFormat('en-US', {
  style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero',
});
console.log(change.format(0.0312));
console.log(change.format(-0.0105));
console.log(change.format(0));
```

**结果**：控制台输出 `+3.12%`、`-1.05%`、`0%`。**这三个输出未在模拟器验证**；`signDisplay: 'exceptZero'` 配百分比这一组选项在验收用例里和网页比对过，用的是别的数值。

`signDisplay` 的五种取值见[选项](#选项)。

### 把大数写短

```js
console.log(new Intl.NumberFormat('en-US', { notation: 'compact' }).format(1234567.891));
console.log(new Intl.NumberFormat('en-US', { notation: 'compact' }).format(12345));
console.log(new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(12345));
```

**结果**：控制台输出 `1.2M`、`12K`、`1.2万`。

紧凑写法默认保留两位有效数字。单位跟着地区走：英文按千、百万，中文按万、亿。

### 不要千分位

```js
console.log(new Intl.NumberFormat('en-US', { useGrouping: false }).format(1234567.891));
```

**结果**：控制台输出 `1234567.891`。

### 一列数用同一种写法

对一组数反复格式化时，建一个 `Intl.NumberFormat` 反复用，不要对每个数调一次带选项的 `toLocaleString()`。

```js
const amounts = [19.99, 5, 1200];
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const labels = amounts.map(usd.format);
console.log(labels.join(' / '));
```

**结果**：控制台输出 `$19.99 / $5.00 / $1,200.00`。

`usd.format` 是一个已经绑定好的函数，可以直接交给 `map`，不用写成 `(n) => usd.format(n)`。

### 格式化很大的整数

```js
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890n));
console.log(new Intl.NumberFormat('en-US').format(12345678901234567890));
```

**结果**：第一行输出 `12,345,678,901,234,567,890`。第二行输出 `12,345,678,901,234,567,000`：普通的数只有约 16 位有效数字，后面的位在写进代码的那一刻就丢了。**第二行的输出未在模拟器验证。**

超过 16 位的整数用 `BigInt`（数字后面加 `n`）。`BigInt` 最多支持 38 位有效数字，再长的抛 `RangeError`。

## 概念

### 地区标签

地区用一个字符串表示，叫地区标签，比如 `'en-US'`、`'zh-CN'`、`'de-CH'`。前一段是语言，后一段是国家或地区。

- 大小写不敏感，`'EN-us'` 和 `'en-US'` 一样。
- 用连字符，不用下划线。`'en_US'` 抛 `RangeError`。
- 系统没有这个地区的数据时，从后往前一段一段去掉再找。`'en-ZZ'` 按 `'en'` 处理。整个语言都没有时（`'xx'`）用系统的首选语言，不报错。
- 可以给一个数组，用第一个系统有的：`new Intl.NumberFormat(['xx', 'de-DE'])` 用的是 `de-DE`。
- 实际用了哪个地区，从 `resolvedOptions().locale` 读。

### 选项只在构造时读一次

`Intl.NumberFormat` 建好之后不能改。要换一种写法，再建一个。`resolvedOptions()` 返回的是一份新的对象，改它不影响格式化。

## 成员说明

### `new Intl.NumberFormat(locales?, options?)`

- **参数** `locales`：地区标签，或者地区标签的数组。不传用系统的首选语言。
- **参数** `options`：对象，成员见[选项](#选项)。不传全部用默认值。
- **返回**：`Intl.NumberFormat`。不写 `new` 直接调用，效果相同。
- **出错**：
  - `locales` 不是合法的地区标签：`RangeError`
  - `locales` 是 `null`，或者数组里有不是字符串的成员：`TypeError`
  - `options` 是 `null`：`TypeError`
  - 选项的值不在标准规定的范围里：`RangeError`，比如 `RangeError: notation has no value "tiny"; expected one of: standard / scientific / engineering / compact`
  - `style` 是 `'currency'` 而没有给 `currency`：`TypeError: currency is required when style is "currency"`
  - 用到[不支持的选项](#不支持的选项)：`RangeError`

### 选项

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
| `roundingMode` | `'halfExpand'`、`'halfEven'`、`'ceil'`、`'floor'`、`'expand'`、`'trunc'` | `'halfExpand'` | 怎么舍入。`'halfExpand'`：四舍五入。`'halfEven'`：正好在中间时取偶数，`2.5` 是 `2`。`'ceil'`：往大的方向。`'floor'`：往小的方向。`'expand'`：往绝对值大的方向。`'trunc'`：直接截掉 |
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

### `format(value)`

把一个值写成文字。

```js
const plain = new Intl.NumberFormat('en-US');
console.log(plain.format(1234567.891));
console.log(plain.format('1234.5'));
console.log(plain.format(NaN));
```

**结果**：控制台输出 `1,234,567.891`、`1,234.5`、`NaN`。

- **参数** `value`：数、`BigInt`，或者写着数的字符串。别的值按 `Number()` 转：`null` 是 `0`，`undefined` 和转不成数的字符串是 `NaN`，`true` 是 `1`。
- **返回**：字符串。
- 写成普通十进制的字符串（`'1234.5'`）按原样的每一位格式化，不先变成普通的数，所以超过 16 位也不丢。
- `Infinity` 写成 `∞`。`-0` 写成 `-0`。
- `format` 已经绑定在这个对象上，可以单独取出来用。
- **出错**：`BigInt` 或十进制字符串超过 38 位有效数字时抛 `RangeError: numbers with more than 38 significant digits are not supported by this runtime`。

### `resolvedOptions()`

返回这个格式化对象实际用的地区和选项，默认值已经填上。

```js
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' });
const resolved = usd.resolvedOptions();
console.log(resolved.locale, resolved.currency, resolved.maximumFractionDigits);
```

**结果**：控制台输出 `en-US USD 2`。

- **返回**：一个新的普通对象。成员和顺序与浏览器相同：`locale`、`numberingSystem`、`style`、`currency`、`currencyDisplay`、`currencySign`、`minimumIntegerDigits`、小数位数或有效数字的两项、`useGrouping`、`notation`、`compactDisplay`、`signDisplay`、`roundingIncrement`、`roundingMode`、`roundingPriority`、`trailingZeroDisplay`。和当前 `style` 无关的成员不出现。
- `useGrouping` 写的是 `true` 时，读出来是 `'always'`。

### `formatToParts()`、`formatRange()`、`formatRangeToParts()`

这三个方法还不能用。调用时抛 `TypeError`，比如 `TypeError: Intl.NumberFormat.prototype.formatToParts is not supported by this runtime`。

### `Intl.NumberFormat.supportedLocalesOf(locales)`

从给的地区里挑出系统有数据的。

```js
console.log(Intl.NumberFormat.supportedLocalesOf(['zh-CN', 'xx', 'en-us']));
```

**结果**：控制台输出 `["zh-CN","en-US"]`。

- **参数** `locales`：同构造函数。
- **返回**：字符串数组，是规范写法的地区标签。

### `Intl.getCanonicalLocales(locales)`

把地区标签改成规范的大小写。

```js
console.log(Intl.getCanonicalLocales(['EN-us', 'zh-hans-cn']));
```

**结果**：控制台输出 `["en-US","zh-Hans-CN"]`。

- **出错**：不是合法的地区标签时抛 `RangeError: invalid language tag: en_US`。
- 只改大小写，不把旧的写法换成新的（`'iw'` 不会变成 `'he'`）。**这一条未在模拟器验证**，来自代码。

### `Number.prototype.toLocaleString(locales?, options?)`

等于 `new Intl.NumberFormat(locales, options).format(这个数)`。`BigInt.prototype.toLocaleString()` 相同。

```js
console.log((1234567.891).toLocaleString('de-DE'));
console.log((1234.5).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
```

**结果**：控制台输出 `1.234.567,891` 和 `$1,234.50`。

参数、出错情况同 `Intl.NumberFormat` 的构造函数。

数组和类型化数组的 `toLocaleString()` 会把这两个参数传给每个成员：

```js
console.log([1234.5, 0.5].toLocaleString('de-DE'));
```

**结果**：控制台输出 `1.234,5,0,5`。成员之间固定用英文逗号连接，和小数点用的逗号分不开，所以给人看的列表不要这样写，自己逐个格式化再连接。

### `String.prototype.normalize(form?)`

把字符串换成 Unicode 的规范形式。同一个字可以有几种写法：`é` 可以是一个字符（U+00E9），也可以是 `e` 后面跟一个组合记号（U+0065 U+0301）。两种写法显示出来一样，但 `===` 不相等、`length` 不同。比较、查找、当键用之前先规范化，两种写法就变成同一个字符串。

它不属于 `Intl`，是字符串自己的方法，写法和浏览器里相同。

```js
const a = 'caf\u00e9';      // é 是一个字符
const b = 'cafe\u0301';     // e + 组合记号
console.log(a === b, a.length, b.length);
console.log(a.normalize() === b.normalize());
console.log(b.normalize().length, a.normalize('NFD').length);
```

**结果**：控制台输出 `false 4 5`、`true`、`4 5`。

- **参数**：`form` 是下面四个字符串之一，不传是 `'NFC'`。

  | `form` | 做什么 | `'\ufb01'`（连字 ﬁ）的结果 |
  | --- | --- | --- |
  | `'NFC'` | 能合成一个字符的合成 | 不变 |
  | `'NFD'` | 拆成基字加组合记号 | 不变 |
  | `'NFKC'` | 先把兼容字符换成普通字符，再合成 | `fi` 两个字符 |
  | `'NFKD'` | 先把兼容字符换成普通字符，再拆开 | `fi` 两个字符 |

  兼容字符指连字、带圈数字、全角字母、半角片假名这一类：`'①'.normalize('NFKC')` 是 `'1'`，`'ｱ'.normalize('NFKC')` 是 `'ア'`。`'NFKC'` 和 `'NFKD'` 会丢掉这些区别，用来做搜索合适，不要用来保存用户输入的原文。
- **返回值**：新的字符串，原来的不变。
- **出错**：`form` 不是这四个之一时抛 `RangeError`，名字分大小写，`'nfc'` 也抛。类型检查查不出这个错，`form` 的类型是 `string`。

结果和同一台设备上网页里的 `normalize()` 逐条相同，用的是系统的 Unicode 数据，所以新版 Unicode 加的字跟着系统版本走。

## 还不能做的

| 想做的事 | 标准里的成员 | 状态 |
| --- | --- | --- |
| 按地区的规则给字符串排序、比较 | `Intl.Collator`，`String.prototype.localeCompare()` | 未实现，运行时不打算提供。`localeCompare()` 按字符的编码值比较，`'ä'.localeCompare('z')` 是正数，中文不按拼音排。需要时在 JS 里自己处理 |
| 写「3 小时前」「昨天」 | `Intl.RelativeTimeFormat` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片（`@formatjs/intl-relativetimeformat`），**未在 Nacre 上验证** |
| 把几项连成「A、B 和 C」 | `Intl.ListFormat` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片（`@formatjs/intl-listformat`），**未在 Nacre 上验证** |
| 选单数、复数的写法 | `Intl.PluralRules` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片（`@formatjs/intl-pluralrules`），**未在 Nacre 上验证** |
| 带单位的数（公里、字节） | `style: 'unit'` | 未实现 |
| 把格式化的结果拆成整数、小数、货币符号等部分 | `formatToParts()` | 未实现 |
| 写一个范围，「3–5」 | `formatRange()` | 未实现 |
| 按地区转大小写 | `toLocaleUpperCase()`、`toLocaleLowerCase()` | 忽略地区，`'istanbul'.toLocaleUpperCase('tr')` 得到 `ISTANBUL`。这是标准函数给出错的结果，不报错 |

## 参见

- [`Intl.DateTimeFormat`](intl-date.md)：日期和时间的格式化
- [运行时怎么工作](how-it-works.md)：有哪些标准的全局对象，哪些没有
- [实现原理：`Intl`](../internals/intl.md)：为什么结果和 Safari 相同，不支持的选项是怎么定的
