---
type: reference
---

# `Date.prototype.toLocaleDateString()` 方法

**`toLocaleDateString()`** 方法按地区把一个 `Date` 写成文字。它用的是 [`Intl.DateTimeFormat`](../intl-date.md) 同一套，没给字段和样式时写的是只有日期。

## 语法

```
toLocaleDateString()
toLocaleDateString(locales)
toLocaleDateString(locales, options)
```

### 参数

**`locales`** <small>可选</small>

同 [`Intl.DateTimeFormat()`](constructor.md) 构造函数。

**`options`** <small>可选</small>

同 [`Intl.DateTimeFormat()`](constructor.md) 构造函数。不接受 `timeStyle`。

### 返回值

字符串。无效的日期不抛，返回 `'Invalid Date'`。

### 异常

同 [`Intl.DateTimeFormat()`](constructor.md#异常) 构造函数。

另外，`options` 里给了 `timeStyle` 时抛 `TypeError: timeStyle is specified while formatting date is requested`。

## 三个方法的默认写法

| 方法 | 没给字段和样式时 | `en-US` 的例子 |
| --- | --- | --- |
| [`toLocaleString()`](tolocalestring.md) | 日期和时间 | `11/15/2026, 3:05:09 PM` |
| [`toLocaleDateString()`](tolocaledatestring.md) | 只有日期 | `11/15/2026` |
| [`toLocaleTimeString()`](tolocaletimestring.md) | 只有时间 | `3:05:09 PM` |

## 示例

```js
const moment = new Date(Date.UTC(2026, 0, 5, 3, 4, 5));
console.log(moment.toLocaleDateString('de-DE', { timeZone: 'UTC' }));
```

**结果**：控制台输出 `5.1.2026`。

## 和 Web 的差别

和 `Intl.DateTimeFormat` 的差别相同，见 [`Intl.DateTimeFormat`](../intl-date.md#和-web-的差别)。

## 参见

- [按用户的地区和时区显示](../../guides/format-dates.md#按用户的地区和时区显示)
