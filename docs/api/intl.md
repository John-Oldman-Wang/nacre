---
type: reference
status: partial
---

# `Intl.NumberFormat`

**`Intl.NumberFormat`** 表示一个按某个地区的习惯把数字写成文字的格式化对象，可以写普通的数、金额、百分比。同一个数 1234567.891，美国写成 `1,234,567.891`，德国写成 `1.234.567,891`，印度写成 `12,34,567.891`。

`Intl` 是 ECMAScript 的国际化接口。现在提供两个类：

- **`Intl.NumberFormat`**：数字、金额、百分比。`Number.prototype.toLocaleString()` 和 `BigInt.prototype.toLocaleString()` 用的是它。这一页讲它。
- **[`Intl.DateTimeFormat`](intl-date.md)**：日期和时间。`Date` 的三个 `toLocale*String()` 用的是它。

排序、相对时间等其他成员还没有，见[还不能做的](#还不能做的)。

**写法和浏览器里完全相同**，按标准（ECMA-402）实现。已经会用浏览器里的 `Intl.NumberFormat` 的话，直接照原样写。

怎么显示金额、百分比、涨跌幅、大数，见指南[按地区显示数字和金额](../guides/format-numbers.md)。

**继承关系**：`Intl.NumberFormat`

## 构造函数

[`Intl.NumberFormat()`](intl/constructor.md)

按给的地区和选项建一个格式化对象。建好之后不能改。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`Intl.NumberFormat.supportedLocalesOf()`](intl/supportedlocalesof.md) | 从给的地区里挑出系统有数据的 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`format()`](intl/format.md) | 把一个值写成文字。已经绑定在这个对象上，可以单独取出来用 |
| [`resolvedOptions()`](intl/resolvedoptions.md) | 实际用的地区和选项，默认值已经填上 |
| [`formatToParts()`](intl/formattoparts.md) | 还不能用，调用时抛 `TypeError` |
| [`formatRange()`](intl/formatrange.md) | 还不能用，调用时抛 `TypeError` |
| [`formatRangeToParts()`](intl/formatrangetoparts.md) | 还不能用，调用时抛 `TypeError` |

## 相关的函数

下面这几个不是 `Intl.NumberFormat` 的成员，但用的是同一套地区数据，放在这里一起说明。

| 函数 | 说明 |
| --- | --- |
| [`Intl.getCanonicalLocales()`](intl/getcanonicallocales.md) | 把地区标签改成规范的大小写 |
| [`Number.prototype.toLocaleString()`](intl/tolocalestring.md) | 按地区把一个数写成文字。`BigInt` 的同名方法相同 |
| [`String.prototype.normalize()`](intl/normalize.md) | 把字符串换成 Unicode 的规范形式 |

## 结果和浏览器一致吗

**指定了地区时，和同一台设备上的 Safari 逐条相同。** 地区的数据（分隔符用什么、货币符号怎么写）来自 iOS 系统，Safari 用的也是这一份。验收用例在同一台设备的网页里和运行时里各跑一遍四万多条调用，逐条比对。

**不指定地区时可能和 Safari 不同**：用哪个地区，两边的取法不一样，见[不指定地区时用哪个地区](#不指定地区时用哪个地区)。

和 Chrome 不保证每个字符都相同。Chrome 自带另一份地区数据，它和 Safari 之间本来就有差别：实测同一批数字的调用有 5.8% 的结果不同（日期是 21.4%），比如瑞士德语的千分位，Safari 用 `'`，Chrome 用 `’`。选项怎么解析、默认值是什么、什么情况报错，三者相同。

所以不要把格式化的结果当作固定的字符串去比较或解析。要比较数值，比较数本身。

## 地区标签

地区用一个字符串表示，叫地区标签，比如 `'en-US'`、`'zh-CN'`、`'de-CH'`。前一段是语言，后一段是国家或地区。

- 大小写不敏感，`'EN-us'` 和 `'en-US'` 一样。
- 用连字符，不用下划线。`'en_US'` 抛 `RangeError`。
- 系统没有这个地区的数据时，从后往前一段一段去掉再找。`'en-ZZ'` 按 `'en'` 处理。整个语言都没有时（`'xx'`）用系统的首选语言，不报错。
- 可以给一个数组，用第一个系统有的：`new Intl.NumberFormat(['xx', 'de-DE'])` 用的是 `de-DE`。
- 实际用了哪个地区，从 [`resolvedOptions()`](intl/resolvedoptions.md) 的 `locale` 读。

## 不指定地区时用哪个地区

用系统的首选语言，也就是「设置 → 通用 → 语言与地区」里排在第一位的那个语言，连同它的地区。

```js
console.log(new Intl.NumberFormat().resolvedOptions().locale);
```

**结果**：系统语言是简体中文、地区是中国大陆时，控制台输出 `zh-CN`；简体中文、地区是香港时输出 `zh-Hans-HK`；德语、地区是奥地利时输出 `de-AT`。

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

## 不支持的选项

iOS 系统公开的格式化接口比标准少几样。**用到不支持的选项时，构造 `Intl.NumberFormat` 会抛 `RangeError`**，错误信息里写明是哪个选项：

```
RangeError: notation: "engineering" is not supported by this runtime
```

不支持的选项列在[构造函数](intl/constructor.md#不支持的选项)的页面上。它们不会被悄悄忽略：一个舍入或者精度的选项没有生效而又不报错，显示金额时会出错而且很难发现。

TypeScript 自带的类型认为这些选项都合法，所以类型检查查不出来，只有运行时会抛。

## 选项只在构造时读一次

`Intl.NumberFormat` 建好之后不能改。要换一种写法，再建一个。`resolvedOptions()` 返回的是一份新的对象，改它不影响格式化。

## 示例

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

## 和 Web 的差别

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 不指定地区时用哪个地区 | Safari 把系统语言换成少数几种常见的语言 | 用系统的首选语言本身，见[不指定地区时用哪个地区](#不指定地区时用哪个地区) |
| 结果的每个字符 | 各浏览器有自己的地区数据 | 指定地区时和同一台设备上的 Safari 逐条相同 |
| 一部分选项 | 支持 | 构造时抛 `RangeError`，见[不支持的选项](intl/constructor.md#不支持的选项) |
| `formatToParts()`、`formatRange()`、`formatRangeToParts()` | 有 | 调用时抛 `TypeError` |
| `BigInt` 和十进制字符串的有效数字 | 不限 | 最多 38 位，再长抛 `RangeError` |

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

- [按地区显示数字和金额](../guides/format-numbers.md)：金额、固定小数位、涨跌幅、大数、很大的整数
- [`Intl.DateTimeFormat`](intl-date.md)：日期和时间的格式化
- [运行时怎么工作](how-it-works.md)：有哪些标准的全局对象，哪些没有
- [实现原理：`Intl`](../internals/intl.md)：为什么结果和 Safari 相同，不支持的选项是怎么定的
