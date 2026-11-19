---
type: reference
native: "+[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:repeats:]"
---

# `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval()` 静态方法

**`UNTimeIntervalNotificationTrigger.triggerWithTimeInterval()`** 静态方法建一个「过多少秒之后送达」的触发器。

## 语法

```
UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(timeInterval[, { repeats }])
```

### 参数

**`timeInterval`**

间隔，单位是秒，必须大于 0。可以是小数。看起来像数的字符串按数转。

**`options.repeats`**

可选，布尔。`true`：送达之后重新计时，再次送达。不带是 `false`。按真假值转换。重复时间隔至少 60 秒。

### 返回值

新的 `UNTimeIntervalNotificationTrigger`，[`timeInterval`](timeinterval.md) 和 [`repeats`](../un-notification-trigger/repeats.md) 是写进去的值。

### 异常

**`TypeError`**

| 写法 | 报错信息 |
| --- | --- |
| 不大于 0，`0` | `triggerWithTimeInterval: timeInterval must be greater than 0, got 0` |
| 重复而且不到 60 秒 | `triggerWithTimeInterval: timeInterval must be at least 60 seconds when repeats is true, got 59` |
| 转不成有限的数，`'soon'` | `timeInterval must be a finite number, got "soon"` |

## 示例

```js
const soon = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
console.log(soon.timeInterval, hourly.repeats);
```

**结果**：输出 `5 true`。用 `soon` 建的请求 5 秒后送达一次；用 `hourly` 建的一小时后送达，之后每小时一次（**未在模拟器验证**）。

## 对应的 iOS API

`+[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:repeats:]`。`repeats:` 换成了可以不带的 options。

## 参见

- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：把触发器放进请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
