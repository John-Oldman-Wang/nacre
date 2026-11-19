---
type: reference
native: UNCalendarNotificationTrigger
status: partial
---

# `UNCalendarNotificationTrigger`

**`UNCalendarNotificationTrigger`** 表示「到了和这些日期分量对得上的时刻送达」的触发方式。日期分量只写要匹配的那几个：`{ hour: 8, minute: 30 }` 匹配每一天的 8:30。设成重复时每次对得上都送达，不重复时只送达最近的那一次。

用的是用户手机上现在的日历和时区。用户改了手机的时间或时区之后，它跟着新的时钟走。

它是只读的值，普通的 JS 对象，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：[`UNNotificationTrigger`](un-notification-trigger.md) → `UNCalendarNotificationTrigger`

## 构造函数

不能用 `new` 创建，`new` 抛 `TypeError`：

```
Illegal constructor: UNCalendarNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

## 静态方法

[`UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()`](un-calendar-notification-trigger/triggerwithdatematchingcomponents.md)

按日期分量建一个触发器。

## 实例属性

还继承 [`UNNotificationTrigger`](un-notification-trigger.md) 的 [`repeats`](un-notification-trigger/repeats.md)。

| 属性 | 说明 |
| --- | --- |
| [`dateComponents`](un-calendar-notification-trigger/datecomponents.md) <small>只读</small> | 要匹配的分量，只有写了的那几个 |

## 示例

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
console.log(JSON.stringify(everyMorning.dateComponents));
```

**结果**：输出 `{"hour":8,"minute":30}`。用它建的请求每天 8 点 30 分送达（**未在模拟器验证**）。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSDateComponents *c = [NSDateComponents new]; c.hour = 8; c.minute = 30;` | `{ hour: 8, minute: 30 }` |
| `[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:c repeats:YES]` | `UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({ hour: 8, minute: 30 }, { repeats: true })` |
| `c.day == NSDateComponentUndefined` | `trigger.dateComponents.day === undefined` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 日期分量指定日历或时区 | `NSDateComponents.calendar`、`timeZone` |
| 问一个触发器下一次是什么时候 | `nextTriggerDate` |

## 参见

- [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md)：过多少秒之后送达
- [发本地通知](../guides/local-notifications.md#每天固定的时间)
