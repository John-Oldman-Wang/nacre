---
type: reference
---

# `Intl.DateTimeFormat`：`formatRange()` 方法

**`formatRange()`** 方法写一段时间。两头相同的部分只写一次。

## 语法

```
formatRange(startDate, endDate)
```

### 参数

**`startDate`**

起点，`Date` 对象或者毫秒数。必须给。

**`endDate`**

终点，`Date` 对象或者毫秒数。必须给。起点比终点晚时不交换，照原样写。

### 返回值

字符串。

- 中间的连接符是短破折号（U+2013），两边各有一个空格。
- 两头在这种写法下看不出区别时（同一天的两个时刻，而只写日期），输出的是单个日期。

### 异常

**`TypeError`**

少给一个参数：`formatRange needs a start date and an end date`。

**`RangeError`**

有一个是无效的日期：`Passed date is out of range`。

## 示例

```js
const from = new Date(Date.UTC(2026, 10, 15, 8));
const to = new Date(Date.UTC(2026, 10, 18, 8));
const range = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
console.log(range.formatRange(from, to));
console.log(range.formatRange(from, from));
```

**结果**：控制台输出 `Nov 15 – 18, 2026` 和 `Nov 15, 2026`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`formatRangeToParts()`](formatrangetoparts.md)：还不能用
