---
type: reference
---

# `Intl.DateTimeFormat()` 构造函数

**`Intl.DateTimeFormat()`** 构造函数按给的地区和选项建一个日期时间格式化对象。

## 语法

```
new Intl.DateTimeFormat()
new Intl.DateTimeFormat(locales)
new Intl.DateTimeFormat(locales, options)
```

不写 `new` 直接调用，效果相同。建好之后不能改。

### 参数

**`locales`** <small>可选</small>

地区标签，或者地区标签的数组。不传用系统的首选语言。规则见[地区标签](../intl.md#地区标签)。

**`options`** <small>可选</small>

对象，成员见下表。整体的样式（`dateStyle`、`timeStyle`）和单个字段不能同时给，见[两种选法](../intl-date.md#两种选法整体的样式或者逐个字段)。

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
| `timeZone` | 时区名或偏移，见[时区](../intl-date.md#时区) | 用哪个时区。不给是设备当前的时区 |
| `calendar` | `'gregory'`、`'chinese'`、`'japanese'`、`'buddhist'`、`'persian'`、`'islamic-umalqura'` 等 | 用哪种日历。不给是这个地区默认的日历（泰国是佛历） |
| `numberingSystem` | `'latn'`、`'arab'` 等 | 用哪一套数字 |
| `localeMatcher`、`formatMatcher` | 标准规定的取值 | 只检查取值，不影响结果 |

- 没有给任何字段、也没有给样式时，按 `year`、`month`、`day` 都是 `'numeric'` 处理。
- **`'numeric'` 不保证是一位，`'2-digit'` 保证是两位。** 小时的 `'numeric'` 尤其如此：`zh-CN` 下「`hour: 'numeric'` 加 `minute: '2-digit'`」是 `3:04`，「`hour: 'numeric'` 加 `minute: 'numeric'`」是 `03:04`。这是系统的地区数据决定的，Safari 里也是这样。要固定两位，写 `'2-digit'`。
- 分和秒写 `'numeric'` 时，和别的字段一起出现仍然是两位（`3:04`），单独出现才是一位。

### 返回值

新建的 `Intl.DateTimeFormat`。

### 异常

**`RangeError`**

- 选项的值不在规定的范围里。
- `timeZone` 认不出来：`invalid time zone: PST`，最后是给的那个值。
- `locales` 不是合法的地区标签：`invalid language tag: en_US`。

**`TypeError`**

- `dateStyle` 或 `timeStyle` 和单个字段的选项同时给：`dateStyle and timeStyle may not be used with other DateTimeFormat options`。
- `options` 是 `null`：`options must be an object, got null`。
- `locales` 是 `null`：`locales must be a string or an array, got null`。

## 示例

### 整体的样式

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
const medium = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
});
console.log(medium.format(moment));
```

**结果**：控制台输出 `Jan 5, 2026 at 3:04 AM`。

### 逐个字段

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
console.log(new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));
```

**结果**：控制台输出 `1月5日`。

### 不合法的时区

```js
try {
  new Intl.DateTimeFormat('en-US', { timeZone: 'PST' });
} catch (err) {
  console.log(String(err));
}
```

**结果**：输出 `RangeError: invalid time zone: PST`。

## 和 Web 的差别

不传 `locales` 时，这里用系统的首选语言本身；Safari 里的网页先把它换成少数几种常见的语言，见[不指定地区时用哪个地区](../intl.md#不指定地区时用哪个地区)。其余和 Web 相同。

## 参见

- [`format()`](format.md)
- [`resolvedOptions()`](resolvedoptions.md)：读回实际用的选项
- [按地区显示日期和时间](../../guides/format-dates.md)
