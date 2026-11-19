---
type: reference
status: partial
---

# `Intl.DateTimeFormat`

**`Intl.DateTimeFormat`** 表示一个按某个地区的习惯把时刻写成文字的格式化对象。同一个时刻，美国写成 `Jan 5, 2026 at 3:04 AM`，中国写成 `2026年1月5日 03:04`，德国写成 `05.01.2026, 03:04`。

`Date` 的 `toLocaleString()`、`toLocaleDateString()`、`toLocaleTimeString()` 用的是同一套。

写法和浏览器里完全相同，按标准（ECMA-402）实现。`Intl` 的总体说明（地区标签的规则、不指定地区时用哪个、数字的格式化）见 [`Intl.NumberFormat`](intl.md)。

怎么按用户的地区和时区显示时间、只显示时间、写一段时间，见指南[按地区显示日期和时间](../guides/format-dates.md)。

**继承关系**：`Intl.DateTimeFormat`

## 构造函数

[`Intl.DateTimeFormat()`](intl-date/constructor.md)

按给的地区和选项建一个格式化对象。建好之后不能改。

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`Intl.DateTimeFormat.supportedLocalesOf()`](intl-date/supportedlocalesof.md) | 从给的地区里挑出系统有数据的 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`format()`](intl-date/format.md) | 把一个时刻写成文字。已经绑定在这个对象上，可以单独取出来用 |
| [`formatToParts()`](intl-date/formattoparts.md) | 把结果一段一段给出来 |
| [`formatRange()`](intl-date/formatrange.md) | 写一段时间，两头相同的部分只写一次 |
| [`resolvedOptions()`](intl-date/resolvedoptions.md) | 实际用的地区、日历、时区和各个字段 |
| [`formatRangeToParts()`](intl-date/formatrangetoparts.md) | 调用时抛 `TypeError` |

## 相关的函数

`Date` 的三个方法用的是同一套，参数和 `Intl.DateTimeFormat` 的构造函数相同：

| 函数 | 说明 |
| --- | --- |
| [`Date.prototype.toLocaleString()`](intl-date/tolocalestring.md) | 日期和时间 |
| [`Date.prototype.toLocaleDateString()`](intl-date/tolocaledatestring.md) | 只有日期 |
| [`Date.prototype.toLocaleTimeString()`](intl-date/tolocaletimestring.md) | 只有时间 |

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

## 示例

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

## 和 Web 的差别

| 情况 | 浏览器 | 这里 |
| --- | --- | --- |
| 结果的每个字符 | 各浏览器有自己的地区数据 | 和同一台设备上的 Safari 逐条相同 |
| 不指定地区时用哪个地区 | Safari 把系统语言换成少数几种常见的语言 | 用系统的首选语言本身，见[不指定地区时用哪个地区](intl.md#不指定地区时用哪个地区) |
| `formatRangeToParts()` | 有 | 调用时抛 `TypeError` |

## 参见

- [按地区显示日期和时间](../guides/format-dates.md)：跟随用户的地区和时区、24 小时制、星期几、时区名、一段时间、拆开加样式
- [`Intl.NumberFormat`](intl.md)：数字的格式化，地区标签的规则，和浏览器一致到什么程度
