---
type: reference
native: "+[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:repeats:]"
---

# `UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()` 静态方法

**`UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()`** 静态方法建一个「到了和这些日期分量对得上的时刻送达」的触发器。

## 语法

```
UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(dateComponents[, { repeats }])
```

### 参数

**`dateComponents`**

一个普通对象，只写要匹配的分量。值是整数，小数向零取整，看起来像数的字符串按数转。值是 `null` 或 `undefined` 的分量等于没写。

| 分量 | 含义 |
| --- | --- |
| `year`、`month`、`day` | 年、月（1 到 12）、日（1 到 31） |
| `hour`、`minute`、`second`、`nanosecond` | 时（0 到 23）、分、秒、纳秒 |
| `weekday` | 星期几：1 是星期日，2 是星期一，7 是星期六 |
| `weekdayOrdinal` | 这个月的第几个 `weekday`：和 `weekday: 2` 一起写 2，是第二个星期一 |
| `weekOfMonth`、`weekOfYear`、`yearForWeekOfYear` | 这个月的第几周、这一年的第几周、按周算的年份 |
| `dayOfYear`、`quarter`、`era` | 这一年的第几天、季度（1 到 4）、纪元（公历的公元后是 1） |

`{ hour: 8, minute: 30 }` 匹配每一天的 8:30；加上 `weekday: 2` 就只匹配星期一。

用的是用户手机上现在的日历和时区。这里不检查分量能不能凑出一个时刻：`{ hour: 99 }` 和 `{}` 都建得出触发器，交给系统时的结果**未在模拟器验证**。

**`options.repeats`**

可选，布尔。`true`：每次对得上都送达。不带是 `false`：只在最近的一次送达。按真假值转换。

### 返回值

新的 `UNCalendarNotificationTrigger`。它的 [`dateComponents`](datecomponents.md) 只有写了的那几个分量。

### 异常

**`TypeError`**

| 写法 | 报错信息 |
| --- | --- |
| 不认识的分量，`{ hours: 8 }` | `dateComponents has no component "hours"; expected one of: era / year / month / day / hour / minute / second / nanosecond / weekday / weekdayOrdinal / quarter / weekOfMonth / weekOfYear / yearForWeekOfYear / dayOfYear` |
| 不是普通对象，`'08:30'`、`new Date()` | `dateComponents must be a plain object such as { hour: 8, minute: 30 }, got "08:30"` |
| 分量转不成有限的数 | `dateComponents.hour must be a finite number, got "eight"` |

## 示例

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
const firstMonday = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { weekday: 2, weekdayOrdinal: 1, hour: 9 });
console.log(everyMorning.repeats, firstMonday.repeats);
```

**结果**：输出 `true false`。`everyMorning` 每天 8 点 30 分送达；`firstMonday` 在最近的一个「这个月第一个星期一的 9 点」送达一次（**未在模拟器验证**）。

## 对应的 iOS API

`+[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:repeats:]`。`NSDateComponents` 写成普通对象，只写要的分量；`repeats:` 换成了可以不带的 options。

## 参见

- [`dateComponents`](datecomponents.md)：读回写进去的分量
- [发本地通知](../../guides/local-notifications.md#在某一个时刻)：从一个 `Date` 算出分量
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
