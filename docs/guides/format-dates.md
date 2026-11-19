# 按地区显示日期和时间

这一篇讲怎么用 [`Intl.DateTimeFormat`](../api/intl-date.md) 和 `Date` 的 `toLocale*String()` 按用户的地区和时区显示时间，以及只显示时间、显示星期几、写一段时间。每个选项的细节在 [`Intl.DateTimeFormat()`](../api/intl-date/constructor.md) 构造函数的页面。

## 推荐的做法

- **给用户看的时间，地区和时区都不给，跟随设备。** 要固定成某个时区时才给 `timeZone`。
- **优先用整体的样式 `dateStyle`、`timeStyle`。** 它不会写出这个地区不习惯的组合。只在样式里没有想要的组合时（比如只要「月和日」）才逐个字段选。见[两种选法](../api/intl-date.md#两种选法整体的样式或者逐个字段)。
- **要固定两位，写 `'2-digit'`。** `'numeric'` 不保证是一位。
- **不要解析格式化出来的字符串，也不要拿它和写死的字符串比较。** 要传给服务器或者存下来的时间用 `toISOString()` 或者毫秒数。
- **一组时刻用同一个格式化对象。** 对一组时刻反复格式化时，建一个 `Intl.DateTimeFormat` 反复用。

## 第一个例子

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

以下各节都沿用上面的 `moment`。

## 按用户的地区和时区显示

```js
console.log(moment.toLocaleString());
console.log(moment.toLocaleDateString());
console.log(moment.toLocaleTimeString());
```

**结果**：系统语言是简体中文、时区是中国时，输出 `2026/1/5 11:04:05`、`2026/1/5`、`11:04:05`。**这三个输出未在模拟器验证**；不带参数的这三个方法在验收用例里和网页比对过，用的是别的时刻。

给用户看的时间这样写：地区和时区都不给，跟随设备。

## 四档样式各是什么样

```js
for (const style of /** @type {const} */ (['full', 'long', 'medium', 'short'])) {
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

## 只显示时间，24 小时制

```js
const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: false, timeZone: 'UTC',
});
console.log(clock.format(moment));
```

**结果**：控制台输出 `03:04`。

不写 `hour12` 时按地区的习惯：`en-US` 是 `3:04 AM`，`de-DE` 是 `3:04`。

## 显示星期几

```js
console.log(new Intl.DateTimeFormat('zh-CN', { weekday: 'long', timeZone: 'UTC' }).format(moment));
console.log(new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
}).format(moment));
```

**结果**：控制台输出 `星期一` 和 `Mon, Jan 5`。

## 带上时区的名字

```js
console.log(new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: 'America/New_York',
}).format(moment));
```

**结果**：控制台输出 `10:04 PM EST`。

`timeZoneName` 的六种写法见[构造函数](../api/intl-date/constructor.md)。

## 写一段时间

```js
const from = new Date(Date.UTC(2026, 10, 15, 8));
const to = new Date(Date.UTC(2026, 10, 18, 8));
const range = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
console.log(range.formatRange(from, to));
```

**结果**：控制台输出 `Nov 15 – 18, 2026`。两头相同的部分（月份和年份）只写一次。

- 中间的连接符是短破折号（U+2013），两边各有一个空格。
- 两头在这种写法下看不出区别时（同一天的两个时刻，而只写日期），输出的是单个日期 `Nov 15, 2026`。

## 把结果拆开，分别加样式

```js
const parts = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
  .formatToParts(moment);
console.log(parts.map((part) => part.type + '=' + part.value).join(' | '));
```

**结果**：控制台输出 `month=Jan | literal=  | day=5 | literal=,  | year=2026`。

要把月份和日期用不同的字号显示时用它，不要自己去切 `format()` 的结果：不同地区字段的顺序不一样。

## 一列时间用同一种写法

```js
const times = [0, 86400000];
const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeZone: 'UTC' });
console.log(times.map(day.format).join(' / '));
```

**结果**：控制台输出 `1/1/70 / 1/2/70`。**这个输出未在模拟器验证**；把 `format` 取出来交给 `map`、以及给它毫秒数，在验收用例里和网页比对过。

`day.format` 是一个已经绑定好的函数，可以直接交给 `map`。它也接受毫秒数。

## 知道设备当前的时区

```js
console.log(new Intl.DateTimeFormat().resolvedOptions().timeZone);
```

**结果**：输出设备当前的时区名，比如 `Asia/Shanghai`。

## 参见

- [`Intl.DateTimeFormat`](../api/intl-date.md)：时区、两种选法、和浏览器一致到什么程度
- [按地区显示数字和金额](format-numbers.md)
