---
type: reference
native: UNTimeIntervalNotificationTrigger
status: partial
---

# `UNTimeIntervalNotificationTrigger`

**`UNTimeIntervalNotificationTrigger`** 表示「过多少秒之后送达」的触发方式。可以设成重复：送达之后重新计时，再次送达。

用户改了手机的时间或时区之后，它仍然是「从交给系统起这么久」。要跟着时钟走，用 [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md)。

它是只读的值，普通的 JS 对象，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：[`UNNotificationTrigger`](un-notification-trigger.md) → `UNTimeIntervalNotificationTrigger`

## 构造函数

不能用 `new` 创建，`new` 抛 `TypeError`：

```
Illegal constructor: UNTimeIntervalNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

## 静态方法

[`UNTimeIntervalNotificationTrigger.triggerWithTimeInterval()`](un-time-interval-notification-trigger/triggerwithtimeinterval.md)

建一个过多少秒之后送达的触发器。

## 实例属性

还继承 [`UNNotificationTrigger`](un-notification-trigger.md) 的 [`repeats`](un-notification-trigger/repeats.md)。

| 属性 | 说明 |
| --- | --- |
| [`timeInterval`](un-time-interval-notification-trigger/timeinterval.md) <small>只读</small> | 间隔，单位是秒 |

## 示例

```js
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
console.log(hourly.timeInterval, hourly.repeats);
```

**结果**：输出 `3600 true`。用它建的请求一小时后送达，之后每小时一次，直到被撤销（**未在模拟器验证**）。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:5 repeats:NO]` | `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5)` |
| `[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:3600 repeats:YES]` | `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true })` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 问一个触发器下一次是什么时候 | `nextTriggerDate` |

## 参见

- [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md)：按日期和时间送达
- [发本地通知](../guides/local-notifications.md#每隔一段时间重复)
