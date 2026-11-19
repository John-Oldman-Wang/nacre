---
type: reference
---

# `Intl.DateTimeFormat`：`formatToParts()` 方法

**`formatToParts()`** 方法把格式化的结果一段一段给出来，每一段说明它是哪个字段。

## 语法

```
formatToParts()
formatToParts(date)
```

### 参数

**`date`** <small>可选</small>

同 [`format()`](format.md)。

### 返回值

数组，每一项是 `{ type, value }`。把所有 `value` 连起来就是 `format()` 的结果。

`type` 的取值：`'year'`、`'month'`、`'day'`、`'weekday'`、`'hour'`、`'minute'`、`'second'`、`'fractionalSecond'`、`'dayPeriod'`（上午、下午）、`'era'`、`'timeZoneName'`、`'literal'`（字段之间的标点和空格）。农历这类日历还会有 `'relatedYear'` 和 `'yearName'`。

### 异常

**`RangeError`**

`date` 是无效的日期，或者不是能转成数的值：`date value is not finite in DateTimeFormat formatToParts()`。

## 示例

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
const parts = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
  .formatToParts(moment);
console.log(parts.map((part) => part.type + '=' + part.value).join(' | '));
```

**结果**：控制台输出 `month=Jan | literal=  | day=5 | literal=,  | year=2026`。

要把月份和日期用不同的字号显示时用它，不要自己去切 `format()` 的结果：不同地区字段的顺序不一样。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`format()`](format.md)
