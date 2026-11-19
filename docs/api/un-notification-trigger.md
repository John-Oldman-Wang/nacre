---
type: reference
native: UNNotificationTrigger
status: partial
---

# `UNNotificationTrigger`

**`UNNotificationTrigger`** 表示一条通知什么时候送达。它是三种触发方式共同的父类，自己不能直接创建。

| 子类 | 表示什么 | 怎么得到 |
| --- | --- | --- |
| [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md) | 过多少秒之后送达 | `triggerWithTimeInterval()` |
| [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) | 到了和日期分量对得上的时刻送达 | `triggerWithDateMatchingComponents()` |
| [`UNPushNotificationTrigger`](un-push-notification-trigger.md) | 远程推送送来的 | 只从系统给的通知里读到 |

读回来的触发器是这个包不认识的种类（别的原生代码约定的按位置触发）时，得到的就是一个 `UNNotificationTrigger`，只有 `repeats`。用 `instanceof` 分辨是哪一种。

触发器是只读的值：字段不能改，写了抛 `TypeError`。它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotificationTrigger`。子类见上表。

## 构造函数

不能用 `new` 创建。`new UNNotificationTrigger()` 抛 `TypeError`：

```
Illegal constructor: UNNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`repeats`](un-notification-trigger/repeats.md) <small>只读</small> | 送达之后是不是重新计时、再次送达 |

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const requests = await center.getPendingNotificationRequests();
for (const request of requests) {
  const trigger = request.trigger;
  if (trigger instanceof UNTimeIntervalNotificationTrigger) {
    console.log(request.identifier, trigger.timeInterval + ' 秒', trigger.repeats);
  } else if (trigger instanceof UNCalendarNotificationTrigger) {
    console.log(request.identifier, JSON.stringify(trigger.dateComponents), trigger.repeats);
  }
}
```

**效果**（**未在模拟器验证**）：每条还没到的通知输出一行：标识、触发方式、是否重复。

## 对应的 iOS API

`UNNotificationTrigger`。`[trigger isKindOfClass:UNTimeIntervalNotificationTrigger.class]` 写成 `trigger instanceof UNTimeIntervalNotificationTrigger`。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 到了某个地方时送达 | `UNLocationNotificationTrigger` |

## 参见

- [`UNNotificationRequest`](un-notification-request.md)：触发器放在请求里
