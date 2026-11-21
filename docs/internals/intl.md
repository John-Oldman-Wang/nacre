# `Intl`

按地区格式化。API 文档在 [`Intl`](../api/intl.md) 和 [`Intl.DateTimeFormat`](../api/intl-date.md)，这里记怎么搭的、为什么这么选、量到了什么。

现在有两个：`Intl.NumberFormat`（这一页的前半）和 `Intl.DateTimeFormat`（[后半](#日期照-webkit-的流程做)）。

数字这边除了 `Intl.NumberFormat`，还有走同一套的 `Number.prototype.toLocaleString`、`BigInt.prototype.toLocaleString`。数组和类型化数组的 `toLocaleString` 也换掉了：标准要求它把地区和选项传给每个成员，没有 ICU 的 V8 不传（这一条是验收比对出来的，`[1234.5, 0.5].toLocaleString('de-DE')` 网页给 `1.234,5,0,5`）。排序、相对时间、列表是后面几步。

## 没做之前是什么样

预编译的 V8 关掉了 i18n，ICU 整个不在。实测（iPhone Air 模拟器，iOS 27.2）：

| 调用 | 结果 | 应该是 |
| --- | --- | --- |
| `typeof Intl` | `"undefined"` | 对象 |
| `(1234567.891).toLocaleString('de-DE')` | `"1234567.891"` | `1.234.567,891` |
| `n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })` | `"1234567.891"` | `$1,234,567.89` |
| `d.toLocaleString('zh-CN')` | `"Sun Nov 15 2026 08:00:00 GMT+0800 (CST)"` | `2026/11/15 08:00:00` |
| `'ä'.localeCompare('z')` | `106` | 负数 |
| `'istanbul'.toLocaleUpperCase('tr')` | `"ISTANBUL"` | `İSTANBUL` |
| `'é'.normalize('NFD').length` | `1` | `2` |

比「`Intl` 缺失」更严重的是前几行：**地区和选项被静默忽略**，写了 `currency: 'USD'` 不报错，出来的是裸数字。最后三行（`localeCompare` 按编码值相减、`toLocaleUpperCase` 忽略地区、`normalize` 什么都不做）是标准函数给出错的结果。其中 `normalize` 后来[修掉了](#normalizeicu-的变换不是-nsstring-的方法)，另外两个没修。

## 「和 Web 一致」是什么意思

要求是结果和 Web 一致。先量了 Web 自己：同一张用例表（27571 条 `Intl.NumberFormat` 调用）在 Chrome 内核（Node 22，ICU 76）和 WebKit（模拟器里的网页）各跑一遍，**1590 条不同，占 5.8%**。全是地区数据的差别：瑞士德语的千分位是 `’` 还是 `'`，日元符号是 `￥` 还是 `¥`，孟加拉语用不用本地数字。语义（选项怎么解析、默认值、报什么错）两边相同。

所以「Web」不是一个答案。定下来的是：

- **语义照 ECMA-402。**
- **输出和同一台设备上网页里的 `Intl` 逐条相同。** 网页（WebKit）用的是系统的 ICU 数据，我们用的也是系统的数据，这是唯一能做到逐条相同的对象。
- 和 Chrome 逐字相同只有自带一份 ICU 数据才行：包体积多十几 MB，还要自己编 V8。没走。

验收里这就是一条机械的检查，见下面「怎么验」。

## 底层用什么：量出来的

| 底层 | 谁能调 | 和网页比 | 问题 |
| --- | --- | --- | --- |
| `NSNumberFormatter` | ObjC | 每组 546 条里对上 22 到 522 条 | `∞` 写成 `+∞`，`NaN%` 丢了百分号，百分比的舍入不同，小数超过 15 位有效数字会丢，货币全称几乎全错；紧凑写法、正负号显示、科学计数做不了 |
| Foundation 的 `FormatStyle` | **只有 Swift** | 能表达的每一组都逐条相同 | 运行时里要有 Swift |
| 系统的 ICU（`libicucore`） | C | 理论上完全相同，网页用的就是它 | 不是公开接口：头文件不在 SDK 里，有 App 上传时被标成非公开 API（ITMS-90338）和被拒的报告 |

选了 `FormatStyle`。它底下是 ICU 较新的那套数字格式化器，和网页里 `Intl` 走的是同一个引擎，所以对得上不是巧合。

`libicucore` 没走，是因为风险落在每一个用 Nacre 的 App 身上——和「能力拆包」那一节的判据是同一条。SDK 里的 `.tbd` 确实导出了全部函数（`unumf_*`、`udat_*`、`ucol_*`、`uplrules_*` 都在），所以哪天要做 `Intl.PluralRules` 这类系统公开接口没有的东西，这是已知的一条路，但要先把审核这件事查清。

Hermes 在 iOS 上走的是 `NSNumberFormatter` 那条，它的 `Intl` 因此有一批公认的缺口（紧凑写法、`signDisplay`），使用者靠 FormatJS 的 polyfill 补。

### 耗时

| | 每次 |
| --- | --- |
| `FormatStyle` 直接出字符串 | 约 1 µs，每次新建样式和复用同一个没有差别（系统自己有缓存） |
| `FormatStyle` 出带分段的结果 | 慢得多。第一版全用它，43296 次格式化平均 81 µs；改成只在需要时用之后是 5.7 µs（含那几组要用分段的） |
| 进程里第一次格式化 | 34 ms（命令行探针里量的，是 ICU 数据的一次性加载；App 里 UIKit 多半已经加载过，没单独量） |

所以原生这边不用自己缓存样式对象。

从 JS 这边量（模拟器，Release 的预编译包，含过桥）：

| | 每次 |
| --- | --- |
| 复用一个 `Intl.NumberFormat`，调 `format()` | 9.2 µs |
| 带选项的 `toLocaleString()` | 9.7 µs（最近用过的 32 组参数各留着一个格式化对象） |
| 每次新建一个 `Intl.NumberFormat` 再格式化 | 78 µs。大头是没有 JIT 的解释器里走一遍选项解析 |

## 运行时里第一次有 Swift

`Bridge/NacreIntlNumber.swift` 是 framework 里的第一个 Swift 文件，只依赖 Foundation。日期那一步又加了一个 `NacreIntlDate.swift`（一个函数），同样的做法。运行时里的 Swift 就这两个文件，都只为了调 Swift 才有的格式化接口。

- **类是内部可见的**，用 `@objc(NacreIntlNumberFormat)` 起一个 ObjC 的名字。framework 自动生成的 `Nacre-Swift.h` 只收 `public` 的声明，所以桥（`NacreIntl.mm`）里**手写了一份 `@interface`**。名字或者选择子对不上，链接时报。
- `ios/project.yml` 加了 `SWIFT_VERSION`。Swift 的运行库在系统里，不跟着包走；framework 的二进制多链了 6 个系统的 Swift 库。
- **公开头没变，还是 `Nacre.h` 和 `NacreRuntime.h`。** 第一次打 xcframework 时发现 `Headers/` 里多了一个自动生成的 `Nacre-Swift.h`——383 行样板，一个声明都没有（没有公开的 Swift 类型）。加了 `SWIFT_INSTALL_OBJC_HEADER: NO` 不装它。`Modules/` 里另有一份 `Nacre.swiftmodule`，是打分发用的 framework 时编译器一定会出的，里面同样没有声明。
- **预编译的 xcframework 嵌进普通工程照常能用**，验过：重新打包之后，用它生成一个工程（不引运行时源码），`Intl` 的几种调用结果都对。
- 引擎层（`core/engine/`）仍然是纯 C++，不知道 Swift 的存在。

## 分工：标准的事在 JS，格式化在原生

```
core/builtin/parts/26-intl.js 选项怎么读、默认值、报什么错、resolvedOptions、地区标签解析
        │  nativeClassCallValue('NacreIntl', …)
Bridge/NacreIntl.mm           类级的几个调用，转给 Swift
Bridge/NacreIntlNumber.swift  按解析好的选项格式化一个值；系统有哪些地区和数字系统
```

`Intl.NumberFormat` 不是原生对象，是内置脚本里的一个普通构造函数。原生这边没有它的实例：JS 把解析好的选项交过去，拿回一个格式化器的**编号**，之后每次格式化传编号和值。同一组选项（按 JSON 文本认）只建一次。

这样分的好处是 JS 那一层可以脱离模拟器验：在 Node 里把原生的那几个调用换成 Node 自己的 `Intl`，跑同一张用例表，49086 条里只有 3 条不同——而那 3 条是 V8 自己的一处差别（`currencySign: 'accounting'` 配 `signDisplay: 'never'` 时 V8 把 `currencySign` 报成 `'standard'`，WebKit 和标准都是 `'accounting'`）。

### 值怎么过桥

数不走 JSON 的数，走字符串：

| 写法 | 是什么 |
| --- | --- |
| `d:1234.5`、`d:NaN`、`d:-Infinity`、`d:-0` | 双精度数。`String(数)` 是「能读回同一个双精度数的最短写法」，不丢位；`NaN`、`Infinity`、`-0` 在 JSON 里都没有 |
| `n:12345678901234567890` | 精确的十进制数：`BigInt`，和写成普通十进制的字符串（`'1234.5'`） |

`'1e3'`、`'0x10'` 这种字符串先变成数再走 `d:`，结果和网页相同。

## 系统的接口没有的，怎么补

`FormatStyle` 比 `Intl.NumberFormat` 少几样。量到能逐条对上就补，对不上就列为不支持。

### 补上了的三样

**`signDisplay: 'negative'`**——和 `auto` 一样，只是「结果为零」的负数不带负号（`-0.0004` 留三位小数是 `0` 而不是 `-0`）。做法：把值取反格式化一次，和零格式化的结果比，一样就用取反之后的值。

**`useGrouping: 'always'` / `true` 和 `'min2'`**——系统只有「按地区的习惯」和「不分组」两种。实测这两种和「按习惯」的差别只出现在**四位整数**上：

- 有的地区平时四位数不分组（西班牙语的 `1234`），紧凑写法下也是；`always` 要补上分隔符。
- `min2` 反过来，四位数一律不分组（`1,234` → `1234`）。

做法是拿带分段的结果，数整数部分有几位，正好四位时插入或删掉分隔符。分隔符不自己猜：从同一套选项格式化 `12345` 的结果里取；那里也没有（紧凑写法）就退到这个地区普通的十进制写法里取。

**`numberingSystem`**——地区标识后面加 `@numbers=arab`。

三样都在用例表里，和网页逐条相同。

### 不支持的，构造时抛 `RangeError`

| 选项 | 为什么做不了 |
| --- | --- |
| `style: 'unit'` | 能做（系统有 `Measurement` 的格式化，探针里公里那一组 546 条全对），但每个单位要单独映射，放到后面单独一步 |
| `notation: 'engineering'` | 系统没有 |
| `compactDisplay: 'long'` | 系统的紧凑写法只有短的 |
| `roundingMode` 的 `halfTrunc` / `halfCeil` / `halfFloor` | 系统的舍入规则只有六种 |
| `roundingPriority` 不是 `auto` | 系统的精度只能二选一：按小数位，或者按有效数字 |
| `trailingZeroDisplay: 'stripIfInteger'` | 系统没有 |
| `minimumIntegerDigits` 大于 1 同时给了有效数字 | 同上，二选一 |
| 超过 38 位有效数字的 `BigInt` 或十进制字符串 | 系统的十进制数（`Decimal`）最多 38 位。这一条是格式化时抛，不是构造时 |

最后两条是写实现时才发现的，不在一开始确认的清单里。

**为什么抛而不是忽略**：TypeScript 自带的类型认为这些都合法，编译期查不出来；而静默忽略一个舍入或者精度的选项，在显示金额时是最坏的结果。错误信息点名是哪个选项：

```
RangeError: notation: "engineering" is not supported by this runtime
```

标准里本来就不合法的值（`notation: 'tiny'`）报的是标准规定的错，两种分得开。

`formatToParts`、`formatRange`、`formatRangeToParts` 三个方法在原型上，调了抛 `TypeError`。留着是为了报一个说得清的错，而不是「不是函数」。`formatToParts` 系统给得出分段（已经用它做分组那两样了），后面可以做。

## 地区

- **默认地区**取系统的首选语言，原样跟着它走，只把写法收短（这一条有意不照网页，见[默认地区：跟系统，不照网页](#默认地区跟系统不照网页)）：文字那一段是这个语言和地区本来就隐含的，就去掉。`zh-Hans-CN` → `zh-CN`；`sr-Latn-RS` 不动（塞尔维亚默认是西里尔字母，`Latn` 不是隐含的）。判断用的是「补全之后是不是同一个」。模拟器上系统语言是简体中文，网页里读到 `zh-CN`，我们也是。
- **系统有哪些地区**：`Locale.availableIdentifiers`（1121 个），带文字的另外补一个不带文字的别名（`zh-Hans-CN` 之外还有 `zh-CN`）。WebKit 也是这么认的，否则 `zh-CN` 会被解析成 `zh`。
- **解析**照标准的 `BestAvailableLocale`：从后往前一段一段去掉，直到系统有。`en-ZZ` → `en`，`de-CH-1996` → `de-CH`，`xx` → 默认地区。
- 标签里的 `-u-nu-xxx` 认；别的扩展键（日历、小时制）对数字格式化没有意义，解析之后去掉。
- 标签的合法性只查形状（UTS 35），不做别名替换（`iw` → `he` 这类）。

## 怎么验

用例表在 `acceptance/src/steps/intl-number-cases.js`，是一个**自包含**的函数，返回 `[标签, 取结果的函数]`。验收里：

1. `toString()` 之后送进一个 `WebView`，在网页里整张跑完，拿回结果。
2. 同一个函数在运行时里再跑一遍。分批跑，每轮 400 条，免得四万多条一口气占住主线程。
3. 逐条比对，按选项分组断言「不同的条数是 0」。明确不支持的那几组不比对，断言全部抛 `RangeError`。

一共 49086 条：21 个地区 × 80 组选项 × 29 个值，加上 `resolvedOptions`、地区标签解析、不合法的选项该抛什么、别的入口（`toLocaleString`、`BigInt`、字符串、不带 `new`）。

另有十几条写死期望值的断言（网页起不来时它们还在），和每种「不支持」的错误信息里有没有点名的断言。

**期望值不写死在仓库里，是从同一台设备的网页里现取的。** 所以换一个系统版本、换一种系统语言，这条检查仍然成立——它验的是「和这台设备的网页一致」，不是「和某一次抄下来的字符串一致」。

按测试驱动的顺序，这些用例是先写的：没有实现时新加的 91 条断言全部失败（`Intl is not defined`），原有的 1825 条不受影响。

写实现的时候没有每次都上模拟器。JS 那一层在 Node 里对拍（见上）；Swift 那一层用一个命令行探针：把 JS 层交给原生的每一次调用记下来，用真的 Swift 文件格式化，和事先从网页里取的结果比。两样都是几秒钟一轮。

## 日期：照 WebKit 的流程做

数字那边「按标准实现一遍、底下换成系统的接口」就对上了。日期不行：同一张用例表（42094 条）Chrome 内核和 WebKit 有 **21.4%** 不同，差别不只在数据，还在流程——`dateStyle: 'medium'` 配 `timeStyle: 'short'`，WebKit 写 `Jan 5, 2026 at 3:04 AM`，Chrome 写 `Jan 5, 2026, 3:04 AM`。

所以日期是**照 WebKit 的源码做的**（`IntlDateTimeFormat.cpp`，公开的）。它的流程：

1. 选项 → 一个**骨架串**（`yMMMd`、`jmm`，只说要哪些字段、各多宽；`j` 表示「小时，12 还是 24 小时制按地区定」）。`dateStyle` / `timeStyle` 不走骨架，直接取现成的格式串。
2. 让 ICU 按这个地区的习惯把骨架串变成**格式串**（`y年M月d日`、`h:mm a`）。
3. 按小时制改写格式串里的小时字母。给了 `timeStyle` 而小时制和这个地区的习惯相反时，先把格式串推回骨架串、换掉小时字母、再走一次第 2 步。
4. 从最后的格式串反推 `resolvedOptions`——所以它报的是实际写出来的样子，不是写进去的选项。
5. 输出里的窄不换行空格（U+202F）和细空格（U+2009）换成普通空格。新一些的地区数据在时间和「上午/下午」之间用它们，而大量现成的代码按普通空格去解析，三家浏览器都换了。

Foundation 里每一步都有对应的公开接口，而且**全是 ObjC 的**：

| WebKit 调的 | 我们调的 |
| --- | --- |
| `udat_open(时间样式, 日期样式, …)` 再 `udat_toPattern` | `NSDateFormatter` 设两个样式，读 `dateFormat` |
| `udatpg_getBestPatternWithOptions(骨架串, …)` | `+[NSDateFormatter dateFormatFromTemplate:options:locale:]` |
| `udatpg_getSkeleton(格式串)` | 自己做：只留字段，按规范顺序排（十几行） |
| `udat_format` | `NSDateFormatter` 设 `dateFormat`，`stringFromDate:` |
| `udtitvfmt_open(骨架串)` | `NSDateIntervalFormatter` 的 `dateTemplate` |

格式串的改写、骨架串的拼法、`resolvedOptions` 的反推都是字符串处理，在 `core/builtin/parts/27-intl-date.js` 里。原生这边（`Bridge/NacreIntlDate.mm`）只做上表右边那几件事。

第一遍探针就对上了 96.6%。剩下的是下面这一件。

### 小时写一位还是两位：这一位要问 Swift

WebKit 第 2 步带了一个选项 `UDATPG_MATCH_HOUR_FIELD_LENGTH`（小时的位数按要求的来）。`dateFormatFromTemplate:options:locale:` 的 `options` 文档写的是「传 0」，实测传别的值没有任何效果。

不带这个选项的后果，看几个网页的实际结果：

| 地区 | `hour: 'numeric'` 配 | 网页 | 系统给的格式串 |
| --- | --- | --- | --- |
| zh-CN | `minute: '2-digit'` | `3:04` | `HH:mm` |
| zh-CN | `minute: 'numeric'` | `03:04` | `HH:mm` |
| de-DE | （只有小时） | `03 Uhr` | `HH 'Uhr'` |
| de-DE | `minute: '2-digit'` | `3:04` | `HH:mm` |
| en-US | `minute: '2-digit'`、`hour12: false` | `03:04` | `HH:mm` |

要两位的时候好办，一律两位。要一位而系统给的是两位时，**缩不缩从外面推不出来**。读了 Apple 开源的 ICU（`dtptngen.cpp` 的 `adjustFieldTypes`）才知道规则：匹配到的格式如果来自地区数据里**带骨架**的那一类（`availableFormats`），而且那个骨架里小时的位数和要求的一样，就保持格式串原来的位数；否则改成要求的位数。而匹配到哪一条取决于骨架之间的「距离」，中文的 `Hmm` 和地区自带的短时间格式 `HHmm` 距离是 1、和 `availableFormats` 里的 `Hm` 距离也是 1，打平时先加进去的赢。这张表在 ICU 内部，公开接口摸不到。

试过的三个办法：

| 办法 | 结果 |
| --- | --- |
| `options` 传那个选项的值（`1 << 11`） | 没有任何效果，被忽略了 |
| 自己按「时间部分等于这个地区四种标准时间格式之一就缩」来猜 | 81 组里对上 70 组。`minute: 'numeric'`、带时区、带星期的组合对不上 |
| **问 Swift 的 `Date.FormatStyle`** | **81 组全对** |

`Date.FormatStyle` 内部找格式串时带了那个选项，所以它的结果里小时是几位，就是 WebKit 的结果里小时是几位。做法：用同样的字段拼一个 `FormatStyle`，格式化一个小时是 3 的时刻，拿带分段的结果数「小时」那一段有几个字（`NacreIntlDate.swift`，一个函数）。只在「要一位而系统给了两位」时才问，结果按地区和骨架串缓存。

格式化本身没有换成 `Date.FormatStyle`：它不能指定格式串，`hourCycle` 的四种取值、从格式串反推 `resolvedOptions`、按字段分段都要靠格式串。

### 另外两处系统接口的怪行为

- **骨架串里小时连写两个字母，结果不对。** `en-US` 的 `jj` 给出 `h aaaa`（应该是 `hh a`）。所以交给系统的骨架里小时只写一个字母，位数回头自己调。
- **带了 `B`（按一天里的时段写）时，`j` 会让系统把 `B` 丢掉。** `en-US` 的 `jB` 给出 `h a`，`hB` 才是 `h B`（`3 in the morning`）。所以这时把 `j` 换成这个地区默认的小时字母。

### `formatToParts`：每个字段单独格式化再拼

`NSDateFormatter` 不给字段的位置。做法是把格式串切成字段和文字，每个字段用一个「只有这一个字段」的格式化器写，再按顺序拼。**实测 40824 条里拼出来和整串不同的是 0 条**，所以两个方法给的东西不会对不上。字段字母到类型名的映射（`M` → `month`、`a` → `dayPeriod`、`r` → `relatedYear`）照的是 WebKit 的表。

### `formatRange`：区间格式化器，外加一个判断

`NSDateIntervalFormatter` 的 `dateTemplate` 收的就是骨架串，和 WebKit 用的是同一个 ICU 接口。骨架串从最后的格式串推回去。

多出来的一个判断：两头在这个骨架的粒度上是同一个时（同一天，而只写日期），区间格式化器给的是单个日期，**而且是用骨架自己的格式串写的**（`2026/11/15`）；WebKit 这时改用正常的那个格式串（`2026年11月15日`）。WebKit 靠 ICU 给的「有没有区间段」来认，这个信息公开接口不给。我们的认法：区间的结果等于「用骨架的格式串写起点」。192 条全对；加了小时制和日历的那 144 条也全对。

`formatRangeToParts` 做不了：区间格式化器只给整串。调了抛 `TypeError`。

### 时区

- **`UTC` 要用 `Etc/UTC` 去建。** `+[NSTimeZone timeZoneWithName:@"UTC"]` 给的是 GMT 的别名，写出来是 `GMT` / `Greenwich Mean Time`；网页是 `UTC` / `Coordinated Universal Time`。
- **系统认的名字比标准宽**，要挡掉两类：`+timeZoneWithName:` 收缩写（`PST`）和 `GMT+8`、`UTC+8`，网页都拒绝。但 `EST`、`MST`、`HST` 既是缩写又是真的 IANA 名字，网页收——所以是「在系统的缩写表里、又不在那八个真名字里」才拒。
- 大小写不敏感靠一张小写 → 规范写法的表：系统的 `knownTimeZoneNames`（443 个）加上二十几个不在里面的别名（`PRC`、`Etc/UTC`、`EST5EDT`……）。
- 偏移量（`+08:00`、`-0530`）在 JS 里认，交给原生的是秒数。

### 1582 年之前

JS 的 `Date` 用的是往前一直推到头的公历。系统的公历默认在 1582 年换成儒略历，不改的话那之前的日期差十来天。`NSDateFormatter` 有个 `gregorianStartDate`，设成 JS 能表示的最早时刻（-8.64e15 毫秒）。用例里有公元前 100 年和最早的那个时刻（`April 20, 271822 BC`），都对得上。

### 日期的耗时

模拟器，Release 的预编译包，从 JS 这边量，含过桥：

| | 每次 |
| --- | --- |
| 复用一个 `Intl.DateTimeFormat`，调 `format()` | 12 µs |
| 带选项的 `toLocaleString()` | 11 µs（最近用过的 32 组参数各留着一个） |
| 每次新建一个再格式化 | 58 µs |
| `formatToParts()` | 27 µs |

### 日期这边的验收

和数字同一个做法、同一段代码（`acceptance/src/steps/intl-compare.js`）。用例表 42251 条：21 个地区 × 81 组选项 × 3 个时区 × 8 个时刻，加上分段、解析后的选项、一段时间、26 个时区名、16 种带扩展的地区标签、29 种不合法的写法、46 条别的入口。

**这两步的比对不能和别的步骤抢主线程。** 九万多条用例在主线程上要跑十几秒，为了不挤到别的步骤返工了两次：

| | 做法 | 结果 |
| --- | --- | --- |
| 第一版 | 每轮跑 300 条，和别的步骤同时进行 | 三条原有的、对时序敏感的断言自己报了「未验证」（写文件和定时器谁先那一条、GC 赶不赶得上那两条），主线程被占住的警告从 6 次涨到二十多次。**断言总数没少**，光看「通过多少条」发现不了，是逐条比对标签集合比出来的 |
| 第二版 | 挪到最后；等主线程连续闲 2 秒再开始；按 6 ms 的时间片跑 | 跑了两遍都好，第三遍「模态关掉之后页面被回收」那三条失败了：那组检查自己就有 3 秒的空等，比对正好插了进去。前两遍通过是碰巧 |
| 现在 | 明确排在生命周期那一步的 GC 检查之后（那一步把它的两段长检查作为一个 Promise 交出来）；有 GC 探测在进行时不算「闲」；再等 2 秒；按时间片跑 | Debug 和 Release 各一遍：那几条都在，警告 6 次。Release 那遍另有一组更早的检查（下载期间的 GC）报了未验证，它在加这两步之前就偶尔这样 |

第二版教的一条：**「等一会儿没动静」不是「前面的步骤跑完了」**。要排在谁后面，就得让谁说自己跑完了。

先写的用例：没有实现时日期的 102 组比对和 22 条固定期望全部失败。实现是从量好的探针移过来的，**放进运行时之后第一遍就全部逐条相同**（42250 条和网页比，1 条断言抛）。

## 默认地区：跟系统，不照网页

（2026-11-15 定。）「和同一台设备上网页里的 `Intl` 逐条相同」这条判据有一个例外：不指定地区时用哪个地区。

### 怎么发现的

数字和日期那两步只在模拟器上验过，模拟器的语言和地区是一致的，四万多条比对一直全过。第一次在真机上跑完整验收时，手机是简体中文加香港地区，有 12 条用例和网页不同：

| | 运行时 | 网页 |
| --- | --- | --- |
| 默认地区 | `zh-Hans-HK` | `zh-CN` |
| 小时制 | `h12`，`下午3:05` | `h23`，`15:05` |
| `new Date().toLocaleString()` | `15/11/2026 下午11:05:09` | `2026/11/15 23:05:09` |

### 网页是怎么取的

WebKit 不是拿系统语言直接用。它先把系统的首选语言「压缩」一遍（`minimizedLanguagesFromLanguages:`），再交给 `navigator.language` 和 `Intl`。源码里写明了目的，是为了减少指纹识别：语言和地区的组合有几千种，压成少数几种之后，网站就没法靠它认出人。压缩这一步是系统的私有接口，不能调。

在模拟器上换了 75 种语言和地区的组合，各启动一次同时打出两边的默认地区（`-AppleLanguages` / `-AppleLocale` 启动参数）：39 种相同，36 种不同。另外确认了只有语言那一项起作用，地区格式那一项两边都不看。

| 系统首选语言 | 网页 |
| --- | --- |
| `zh-Hans-HK`、`zh-Hans-MO`、`zh-Hans-US`、`zh-Hans` | `zh-CN`（`zh-Hans-SG` 留着，是 `zh-SG`） |
| `zh-Hant-CN`、`zh-Hant-US`、`zh-Hant` | `zh-TW`（香港、澳门留着） |
| `yue-Hant-HK` | `zh-HK` |
| `en-IE`、`en-ZA`、`en-HK`、`en-DE`、`en-FR` | `en-GB` |
| `en-CN`、`en-JP`、`en` | `en-US` |
| `de-AT`、`de-CH` | `de-DE` |
| `fr-CH`、`fr-BE`、`fr-US` | `fr-FR`（`fr-CA` 留着） |
| `it-CH`、`nl-BE` | `it-IT`、`nl-NL` |
| `es-AR` | `es-419`（`es-ES`、`es-MX`、`es-US` 留着） |
| `pt-AO` | `pt-PT` |
| `ja-JP`、`ja-US` | `ja` |
| `ru-RU`、`fa-IR`、`bn-BD`、`fil-PH` | `ru`、`fa`、`bn`、`fil` |
| `ar-SA`、`ar-EG`、`ar-AE` | `ar` |
| `sr-Latn-RS` | `sr-Latn` |

规律是按表查的，没有简单的规则：日语、俄语压成不带地区的，韩语、印地语、泰语却保留地区。

### 为什么不照

- **压缩是给不受信任的网页用的。** [project.md](../project.md#原则) 的原则 8 就是「不照搬浏览器的安全模型」：我们的 JS 是开发者自己打包进 App 的，不需要防指纹。
- **对 App 来说压缩的结果是错的。** 德语奥地利的金额写法和德语德国不一样，用户选了奥地利，就该按奥地利写。原生 App 也是这样。
- **照着做的代价高。** 那张表是系统私有的行为，要么把几千种组合全量出来，要么每次系统升级重量一遍。

所以默认地区就是系统首选语言本身（`Locale.preferredLanguages` 的第一个），只把写法收短：文字那一段是隐含的就去掉。指定了地区的调用不受影响，仍然和网页逐条相同。

顺带修了一个小错：系统语言是不带地区的 `en` 时，原来给的是 `en-Latn`（`Locale.Language` 会把隐含的文字补出来，原来直接拼了上去），现在是 `en`。

### 验收怎么比

依赖默认地区的用例有十几条：不指定地区的、地区解析不了要退回默认的（`xx`、`und`）、`Date` 的三个 `toLocale*String` 不带参数的。它们不再和网页的默认直接比：验收把运行时取到的默认地区交给网页，这些用例在网页那一边改成显式指定它（用例表里的 `loc()`）。验的是「不指定地区」等于「指定系统首选语言」，而那种语言本身怎么写，仍然由网页把关。

所以这张比对表在任何语言和地区的设备上都该全过。真机（简体中文加香港）上就是这样验的。

## 为什么到数字和日期为止

（2026-11-15 定。）下一步本来是排序。量完之后停在了这里：剩下的几样，要么对不上网页，要么要付一笔不值的代价。

### 排序：系统的字符串比较对不上

用例表 1428 条，其中排序是 18 个地区 × 16 组选项，每组 5776 对两两比较。`NSString` 带地区的比较（`compare:options:range:locale:`）和网页比：

| 选项 | 和网页相同 | 一边认为相等、另一边不认为 | 顺序相反 |
| --- | --- | --- | --- |
| 默认、`sensitivity` 四种、`numeric`、`caseFirst`、`collation` | 99.74% – 99.87% | 0.03% – 0.16% | 0.05% – 0.10% |
| `ignorePunctuation` | 98.6% – 98.8% | 0.6% – 0.9% | 0.4% – 0.6% |
| `usage: 'search'` | 93.3% | 0.1% | 6.5% |

**288 组里逐条相同的只有 4 组。** 差别是成规律的：全角和半角、平假名和片假名、`ﬁ` 和 `fi`，系统当成相同，网页分先后；繁体中文地区下 `a` 和 `á` 的先后相反；`usage: 'search'` 下中日韩地区的汉字排到了拉丁字母前面。

原因是 `NSString` 的比较不是把 ICU 的排序器原样包出来：它只拿 ICU 排第一级，大小写、音标、宽度这几级是 CoreFoundation 自己的规则。日期那一步「照 WebKit 的流程、底下换成 Foundation 的封装」的办法在这里用不上。

同一张表里的另外两样：`normalize` 用 `NSString` 是 90 / 90 逐条相同（后来用 2763 条再比，对不上，见[下面](#normalizeicu-的变换不是-nsstring-的方法)）；大小写是 394 / 408，差的是土耳其语等地区下带重音的希腊字母（系统把重音去掉了）。

### 能做到逐条相同的三条路，都没走

| 路 | 量到了什么 | 为什么不走 |
| --- | --- | --- |
| 系统公开的 JavaScriptCore 里的 `Intl` | 三张用例表（数字 49086、日期 42094、排序 1428）**全部和网页逐条相同**，包括数字那一步我们列为不支持的 5509 条。代价（模拟器）：进程里第一次建上下文 228 ms，第一次格式化数字 60 ms，都是一次性的；之后每次调用 3 – 6 µs；常驻约 3.8 MB；建过四万多个格式化对象后涨到约 65 MB，回收后没降 | 进程里多一个 JS 引擎，只为了格式化。不好 |
| 系统的 ICU（`libicucore`） | SDK 的 `.tbd` 里函数都在 | 不是公开接口，有上传被标记的报告 |
| V8 自己带 ICU | 结果和 Chrome、Node 相同，而且 iOS 和将来的 Android 会完全相同；我们自己的 `Intl` 代码可以全删。数据文件完整版 10.4 MB（Chromium 另有 iOS 档 5.8 MB、Android 档 7.8 MB） | 要自己编 V8：现在用的 NativeScript 预编译包写死了 `v8_enable_i18n_support=false`，没有带 ICU 的版本。每次升级编一次（它的 CI 上 iOS 一组约 2.5 小时），还要自己负责「iOS + lite 模式 + ICU」这个没人持续验证的组合；自带的 ICU 在 iOS 上读不读得到系统的语言和时区也没有验证。体积不是问题，**成本大于收益** |

数字那一步没有先量 JavaScriptCore，是个疏漏：当时只比了 `NSNumberFormatter`、`FormatStyle` 和系统的 ICU 库。量了之后结论也没变（不想为格式化多带一个引擎），但该早知道有这条路。

### 定下来的

- `Intl` 到 `NumberFormat` 和 `DateTimeFormat` 为止。这两样是每个 App 都要显示的东西，而且做到了和网页逐条相同。
- 排序、复数、相对时间、列表不在运行时里做。JS 能解决的交给 JS：FormatJS 有 `PluralRules`、`RelativeTimeFormat`、`ListFormat` 的纯 JS 垫片（自带地区数据），**没在 Nacre 上验证过**；`Collator` 的垫片没有确认到。
- 参照：Hermes（React Native 和 Expo 用的引擎）在 iOS 上有 `Collator`、`NumberFormat`、`DateTimeFormat`，没有后面那几样；它的 `NumberFormat` 不支持紧凑写法和 `signDisplay`，文档明说接受各平台结果有差别。NativeScript 的运行时里整个没有 `Intl`。

**留着的问题**：`localeCompare`、`toLocaleUpperCase` 是标准函数，现在给的是错的结果而且不报错（见本页开头的表）。这和「不做 `Collator`」是两件事。同一类里的 `normalize` 修掉了，见下一节。

## `normalize`：ICU 的变换，不是 `NSString` 的方法

`String.prototype.normalize` 不属于 `Intl`，但病根相同：没有 ICU 的 V8 把字符串原样返回，不报错。它是这一类里唯一能对上网页的，所以单独补了。代码和 `Intl` 放在一起（`26-intl.js` 的末尾、`NacreIntl.mm` 的 `normalize:`）。

### 两个系统接口，只有一个对得上

`NSString` 有四个现成的方法（`precomposedStringWithCanonicalMapping` 一组），名字和四种形式一一对应。最初定的就是它，依据是上面那 90 条。按测试驱动写的用例是 2763 条——四种形式下逐个码位扫完基本平面和第 1 平面，加上基字配组合记号、谚文、落单的代理项——跑出来对不上，于是停下来重新量。

探针用系统的 JavaScriptCore 当真值（它和网页是同一个 ICU），同一张表各跑一遍：

| 做法 | 2763 条里不同的 | 每次调用（模拟器，不含过桥） |
| --- | --- | --- |
| `NSString` 的四个方法 | 11 | 1.5 µs |
| ICU 的变换，变换名传 `NFC` / `NFD` / `NFKC` / `NFKD` | **0** | 1.5 µs |

`NSString` 那四个方法是 CoreFoundation 自己的实现，不是 ICU：

| 情况 | `NSString` | 网页 |
| --- | --- | --- |
| 谚文音节后面跟一个终声字母，NFC（`D558 11AB`） | 不合成 | 合成 `D55C` |
| 半角片假名加半角浊点，NFKC（`FF76 FF9E`） | `30AB 3099`，没合成 | `30AC` |
| Unicode 16 加的字，NFD（`105C9`、`105E4`） | 不拆 | 拆开 |
| Unicode 16 加的字，NFKC（`16D68` – `16D6A`） | 拆开了 | 不变 |

ICU 的变换是公开接口：`CFStringTransform` 的文档写明变换名可以传任何合法的 ICU 变换名。原生那一段只放行这四个名字——变换名是个开放的集合，转写、大小写之类的不该从这个入口进来。

教训和排序那一节是同一条：**Foundation 里名字对得上的接口，不等于底下是 ICU。** 90 条的样本没露出来，逐个码位扫才露出来。

### 过不了桥的两种码元，在 JS 里切开

标准要求 `normalize` 把这两种码元原样留着，而它们过不了桥：

| | 为什么过不了 |
| --- | --- |
| 落单的代理项 | 桥上走的是 JSON 和 UTF-8，它转不成 UTF-8 |
| U+FEFF | Foundation 从 UTF-8 建字符串时会去掉开头的那一个。实测 `NSJSONSerialization`（原样的和写成 `\ufeff` 的都一样）、`initWithBytes:`、`stringWithUTF8String` 都这样；中间和结尾的不动 |

这两种都不拆、不和前后的字符合成、也不参与重排，所以在它们那里把字符串切开、各段分别规范化、再接回去，结果和整个一起做相同。验收里有专门的用例（夹在中间的、紧挨着组合记号的、每隔一段夹一个的长字符串）。

另外纯 ASCII 的字符串不过桥：它在四种形式下都不变。

U+FEFF 那一条不只是 `normalize` 的事——**JS 传给原生的任何字符串，开头的 U+FEFF 都会丢**。这里只是绕开了，桥本身没改，记在[项目说明的待办](../project.md#7-还要做的)里。

### 换上去的函数要和内置的一样

`normalize` 写成对象里的方法（`{ normalize() { … } }.normalize`），不是 `function normalize() {}`：后一种能当构造函数、带 `prototype` 属性，内置的不能。`this` 和 `form` 转字符串用模板字符串，那是标准的 `ToString`——`String(x)` 对 Symbol 不抛，`'' + x` 会先问 `valueOf`。这几条验收里都和网页比了。

## 没做的和没验证的

| | |
| --- | --- |
| `Intl.Collator`、`RelativeTimeFormat`、`ListFormat`、`PluralRules` | 不做，见上一节 |
| `localeCompare`、`toLocaleUpperCase` 给出错的结果 | 没修，系统接口对不上网页 |
| `normalize` 在真机上 | 没跑 |
| `formatToParts` | 能做，没做 |
| 真机 | 没跑 |
| iOS 26 | 没跑。`FormatStyle` 的货币紧凑写法是 iOS 18 加的，最低版本 26 用得上 |

---

← 返回[实现原理](README.md) ・ [API 文档](../api/intl.md)
