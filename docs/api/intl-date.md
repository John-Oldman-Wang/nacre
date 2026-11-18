---
type: reference
status: partial
---

# `Intl.DateTimeFormat`

`Intl.DateTimeFormat` 把一个时刻按某个地区的习惯写成文字。同一个时刻，美国写成 `Jan 5, 2026 at 3:04 AM`，中国写成 `2026年1月5日 03:04`，德国写成 `05.01.2026, 03:04`。

`Date` 的 `toLocaleString()`、`toLocaleDateString()`、`toLocaleTimeString()` 用的是同一套。

写法和浏览器里完全相同，按标准（ECMA-402）实现。`Intl` 的总体说明（不指定地区时用哪个、和浏览器一致到什么程度）见 [`Intl`](intl.md)。

## 结果和浏览器一致吗

**和同一台设备上的 Safari 逐条相同。** 验收用例在同一台设备的网页里和运行时里各跑四万多条调用，逐条比对。

**和 Chrome 的差别比数字大。** 实测同一批调用有 21.4% 的结果不同。比如日期和时间之间，Safari 写 `Jan 5, 2026 at 3:04 AM`，Chrome 写 `Jan 5, 2026, 3:04 AM`。选项的含义、默认值、什么情况报错，两者相同。

所以不要解析格式化出来的字符串，也不要拿它和写死的字符串比较。要传给服务器或者存下来的时间用 `toISOString()` 或者毫秒数。

## 时区

`Date` 对象表示的是一个时刻，不带时区。写成文字时用哪个时区，由 `timeZone` 选项决定：

- **不给**：用设备当前的时区。给用户看的时间一般不给。
- **给一个时区名**：`'Asia/Shanghai'`、`'America/New_York'`、`'UTC'`。名字是 IANA 时区库里的名字，大小写不敏感。
- **给一个固定的偏移**：`'+08:00'`、`'-05:30'`。

`'PST'`、`'UTC+8'`、`'GMT+8'` 这些不是合法的写法，抛 `RangeError`。

同一个时刻在不同时区可能是不同的日期：UTC 的 1 月 5 日 3 点，在纽约是 1 月 4 日晚上 10 点。

## 两种选法：整体的样式，或者逐个字段

**整体的样式**：`dateStyle` 和 `timeStyle`，各有 `'full'`、`'long'`、`'medium'`、`'short'` 四档。这个地区习惯怎么写就怎么写，包括字段的顺序和中间的标点。只给其中一个，就只写日期或者只写时间。

**逐个字段**：`year`、`month`、`day`、`weekday`、`hour`、`minute`、`second` 等。只说要哪些字段、各写多宽；字段的顺序和中间的标点仍然由地区决定。

两种不能混用，同时给了抛 `TypeError`。**优先用整体的样式**：它不会写出这个地区不习惯的组合。只在样式里没有想要的组合时（比如只要「月和日」）才逐个字段选。

两种都不给时，写的是年月日，数字的形式：`1/5/2026`。

## 完整例子

```js
// 2026-01-05 03:04:05 UTC
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));

// 1. 整体的样式。这里固定了时区，结果不随设备变
const medium = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
});
console.log(medium.format(moment));

// 2. 同一个时刻，换一个时区
const newYork = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York',
});
console.log(newYork.format(moment));

// 3. 换一个地区
console.log(new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
}).format(moment));

// 4. 逐个字段：只要月和日
console.log(new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));

// 5. Date 自己的方法，用的是同一套
console.log(moment.toLocaleDateString('de-DE', { timeZone: 'UTC' }));
```

**结果**：控制台依次输出：

```
Jan 5, 2026 at 3:04 AM
Jan 4, 2026 at 10:04 PM
2026年1月5日 03:04
1月5日
5.1.2026
```

这段代码没有作为一个整体在模拟器运行过。其中每一种调用都在验收用例里和网页比对过。

## 常见用法

以下例子都沿用上面的 `moment`。

### 按用户的地区和时区显示

```js
console.log(moment.toLocaleString());
console.log(moment.toLocaleDateString());
console.log(moment.toLocaleTimeString());
```

**结果**：系统语言是简体中文、时区是中国时，输出 `2026/1/5 11:04:05`、`2026/1/5`、`11:04:05`。**这三个输出未在模拟器验证**；不带参数的这三个方法在验收用例里和网页比对过，用的是别的时刻。

给用户看的时间这样写：地区和时区都不给，跟随设备。

### 四档样式各是什么样

```js
for (const style of ['full', 'long', 'medium', 'short']) {
  console.log(new Intl.DateTimeFormat('en-US', { dateStyle: style, timeZone: 'UTC' }).format(moment));
}
```

**结果**：

```
Monday, January 5, 2026
January 5, 2026
Jan 5, 2026
1/5/26
```

同样的四档在 `zh-CN` 下是 `2026年1月5日 星期一`、`2026年1月5日`、`2026年1月5日`、`2026/1/5`。不同地区同一档的详细程度不完全一样。

### 只显示时间，24 小时制

```js
const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: false, timeZone: 'UTC',
});
console.log(clock.format(moment));
```

**结果**：控制台输出 `03:04`。

不写 `hour12` 时按地区的习惯：`en-US` 是 `3:04 AM`，`de-DE` 是 `3:04`。

### 显示星期几

```js
console.log(new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: 'UTC' }).format(moment));
console.log(new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));
```

**结果**：控制台输出 `星期一` 和 `Mon, Jan 5`。

### 带上时区的名字

```js
console.log(new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: 'America/New_York',
}).format(moment));
```

**结果**：控制台输出 `10:04 PM EST`。

`timeZoneName` 的六种写法见[选项](#选项)。

### 写一段时间

```js
const from = new Date(Date.UTC(2026, 10, 15, 8));
const to = new Date(Date.UTC(2026, 10, 18, 8));
const range = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
console.log(range.formatRange(from, to));
```

**结果**：控制台输出 `Nov 15 – 18, 2026`。两头相同的部分（月份和年份）只写一次。

- 中间的连接符是短破折号（U+2013），两边各有一个空格。
- 两头在这种写法下看不出区别时（同一天的两个时刻，而只写日期），输出的是单个日期 `Nov 15, 2026`。

### 把结果拆开，分别加样式

```js
const parts = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
  .formatToParts(moment);
console.log(parts.map((part) => part.type + '=' + part.value).join(' | '));
```

**结果**：控制台输出 `month=Jan | literal=  | day=5 | literal=,  | year=2026`。

要把月份和日期用不同的字号显示时用它，不要自己去切 `format()` 的结果：不同地区字段的顺序不一样。

### 一列时间用同一种写法

对一组时刻反复格式化时，建一个 `Intl.DateTimeFormat` 反复用。

```js
const times = [0, 86400000];
const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeZone: 'UTC' });
console.log(times.map(day.format).join(' / '));
```

**结果**：控制台输出 `1/1/70 / 1/2/70`。**这个输出未在模拟器验证**；把 `format` 取出来交给 `map`、以及给它毫秒数，在验收用例里和网页比对过。

`day.format` 是一个已经绑定好的函数，可以直接交给 `map`。它也接受毫秒数。

## 成员说明

### `new Intl.DateTimeFormat(locales?, options?)`

- **参数** `locales`：地区标签，或者地区标签的数组。不传用系统的首选语言。规则见 [`Intl`](intl.md#地区标签)。
- **参数** `options`：对象，成员见[选项](#选项)。
- **返回**：`Intl.DateTimeFormat`。不写 `new` 直接调用，效果相同。建好之后不能改。
- **出错**：
  - 选项的值不在规定的范围里：`RangeError`
  - `timeZone` 认不出来：`RangeError: invalid time zone: PST`
  - `dateStyle` 或 `timeStyle` 和单个字段的选项同时给：`TypeError: dateStyle and timeStyle may not be used with other DateTimeFormat options`
  - `options` 是 `null`：`TypeError`

### 选项

| 选项 | 取值 | 含义 |
| --- | --- | --- |
| `dateStyle` | `'full'`、`'long'`、`'medium'`、`'short'` | 日期部分的整体样式，从详细到简短。`en-US` 下依次是 `Monday, January 5, 2026`、`January 5, 2026`、`Jan 5, 2026`、`1/5/26` |
| `timeStyle` | 同上 | 时间部分的整体样式。`en-US` 下 `'short'` 是 `3:04 AM`，`'medium'` 是 `3:04:05 AM`，`'long'` 和 `'full'` 带时区 |
| `weekday` | `'long'`、`'short'`、`'narrow'` | 星期几。`Monday`、`Mon`、`M` |
| `era` | `'long'`、`'short'`、`'narrow'` | 纪元。`'short'` 是 `AD` |
| `year` | `'numeric'`、`'2-digit'` | 年。`2026`、`26` |
| `month` | `'numeric'`、`'2-digit'`、`'long'`、`'short'`、`'narrow'` | 月。`1`、`01`、`January`、`Jan`、`J` |
| `day` | `'numeric'`、`'2-digit'` | 日。`5`、`05` |
| `hour` | `'numeric'`、`'2-digit'` | 时 |
| `minute` | `'numeric'`、`'2-digit'` | 分 |
| `second` | `'numeric'`、`'2-digit'` | 秒 |
| `fractionalSecondDigits` | `1`、`2`、`3` | 秒的小数写几位，是位数 |
| `dayPeriod` | `'long'`、`'short'`、`'narrow'` | 按一天里的时段写，代替上午、下午。`en-US` 下 3 点是 `3 in the morning` |
| `timeZoneName` | `'short'`、`'long'`、`'shortOffset'`、`'longOffset'`、`'shortGeneric'`、`'longGeneric'` | 时区写成什么。纽约在冬天依次是 `EST`、`Eastern Standard Time`、`GMT-5`、`GMT-05:00`、`ET`、`Eastern Time`。**后四个的例子未在模拟器验证**，这六种取值各自在验收用例里和网页比对过 |
| `hour12` | 布尔 | `true`：12 小时制。`false`：24 小时制。不给：按地区的习惯 |
| `hourCycle` | `'h11'`、`'h12'`、`'h23'`、`'h24'` | 更细的小时制：一天从 0 还是从 1 数、数到 11、12、23 还是 24。给了 `hour12` 时它不起作用 |
| `timeZone` | 时区名或偏移，见[时区](#时区) | 用哪个时区。不给是设备当前的时区 |
| `calendar` | `'gregory'`、`'chinese'`、`'japanese'`、`'buddhist'`、`'persian'`、`'islamic-umalqura'` 等 | 用哪种日历。不给是这个地区默认的日历（泰国是佛历） |
| `numberingSystem` | `'latn'`、`'arab'` 等 | 用哪一套数字 |
| `localeMatcher`、`formatMatcher` | 标准规定的取值 | 只检查取值，不影响结果 |

- 没有给任何字段、也没有给样式时，按 `year`、`month`、`day` 都是 `'numeric'` 处理。
- **`'numeric'` 不保证是一位，`'2-digit'` 保证是两位。** 小时的 `'numeric'` 尤其如此：`zh-CN` 下「`hour: 'numeric'` 加 `minute: '2-digit'`」是 `3:04`，「`hour: 'numeric'` 加 `minute: 'numeric'`」是 `03:04`。这是系统的地区数据决定的，Safari 里也是这样。要固定两位，写 `'2-digit'`。
- 分和秒写 `'numeric'` 时，和别的字段一起出现仍然是两位（`3:04`），单独出现才是一位。

### `format(date?)`

- **参数** `date`：`Date` 对象，或者毫秒数。不传是当前时刻。
- **返回**：字符串。
- `format` 已经绑定在这个对象上，可以单独取出来用。
- **出错**：`date` 是无效的日期（`new Date(NaN)`），或者不是能转成数的值时，抛 `RangeError: date value is not finite in DateTimeFormat format()`。字符串不会被当成日期来解析：`format('2026-11-15')` 抛 `RangeError`，要先 `new Date(...)`。

### `formatToParts(date?)`

把结果一段一段给出来。参数和出错情况同 `format()`。

- **返回**：数组，每一项是 `{ type, value }`。把所有 `value` 连起来就是 `format()` 的结果。
- `type` 的取值：`'year'`、`'month'`、`'day'`、`'weekday'`、`'hour'`、`'minute'`、`'second'`、`'fractionalSecond'`、`'dayPeriod'`（上午、下午）、`'era'`、`'timeZoneName'`、`'literal'`（字段之间的标点和空格）。农历这类日历还会有 `'relatedYear'` 和 `'yearName'`。

### `formatRange(startDate, endDate)`

写一段时间。

- **参数**：两个都必须给，`Date` 对象或者毫秒数。
- **返回**：字符串。
- **出错**：少给一个参数抛 `TypeError`。有一个是无效的日期抛 `RangeError: Passed date is out of range`。
- 起点比终点晚时不交换，照原样写。

### `resolvedOptions()`

返回实际用的地区、日历、数字系统、时区和各个字段。

```js
const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'utc' });
const resolved = clock.resolvedOptions();
console.log(resolved.timeZone, resolved.hourCycle, resolved.hour12);
```

**结果**：控制台输出 `UTC h12 true`。

- **返回**：一个新的普通对象。成员依次是 `locale`、`calendar`、`numberingSystem`、`timeZone`；有小时时还有 `hourCycle` 和 `hour12`；然后是各个字段，或者 `dateStyle` 和 `timeStyle`。
- **字段报的是实际写出来的样子，不一定是你写的选项。** `en-US` 下给 `hour: 'numeric', hour12: false`，读回来的 `hour` 是 `'2-digit'`，因为这个地区的 24 小时写法是两位的。
- 要知道设备当前的时区：`new Intl.DateTimeFormat().resolvedOptions().timeZone`。

### `formatRangeToParts()`

这个方法还不能用。调用时抛 `TypeError: Intl.DateTimeFormat.prototype.formatRangeToParts is not supported by this runtime`。

### `Intl.DateTimeFormat.supportedLocalesOf(locales)`

从给的地区里挑出系统有数据的。返回规范写法的地区标签的数组。

### `Date.prototype.toLocaleString(locales?, options?)`

三个方法的参数和 `Intl.DateTimeFormat` 的构造函数相同，区别是默认写什么：

| 方法 | 没给字段和样式时 | `en-US` 的例子 |
| --- | --- | --- |
| `toLocaleString()` | 日期和时间 | `11/15/2026, 3:05:09 PM` |
| `toLocaleDateString()` | 只有日期 | `11/15/2026` |
| `toLocaleTimeString()` | 只有时间 | `3:05:09 PM` |

- 无效的日期不抛，返回 `'Invalid Date'`。
- `toLocaleDateString()` 不接受 `timeStyle`，`toLocaleTimeString()` 不接受 `dateStyle`，给了抛 `TypeError`。

## 还不能做的

| 想做的事 | 标准里的成员 | 状态 |
| --- | --- | --- |
| 把一段时间的结果拆开，知道每一段属于起点还是终点 | `formatRangeToParts()` | 未实现 |
| 写「3 小时前」「昨天」 | `Intl.RelativeTimeFormat` | 未实现，运行时不打算提供。FormatJS 有纯 JS 的垫片，**未在 Nacre 上验证** |

## 参见

- [`Intl`](intl.md)：数字的格式化，地区标签的规则，和浏览器一致到什么程度
- [实现原理：`Intl`](../internals/intl.md)：日期的结果为什么能和 Safari 逐条相同
