---
type: reference
native: UNNotificationRequest.trigger
---

# `UNNotificationRequest`：`trigger` 属性

**`trigger`** 属性是这条通知什么时候送达。

## 值

[`UNNotificationTrigger`](../un-notification-trigger.md) 的某个子类，或者 `null`。

- `null`：立刻送达。
- [`UNTimeIntervalNotificationTrigger`](../un-time-interval-notification-trigger.md)：过多少秒之后送达。
- [`UNCalendarNotificationTrigger`](../un-calendar-notification-trigger.md)：到了和日期分量对得上的时刻送达。
- [`UNPushNotificationTrigger`](../un-push-notification-trigger.md)：远程推送送来的，只在系统给的通知里出现。
- 系统给的通知里的触发器是这个包不认识的种类时，是一个 `UNNotificationTrigger`，只有 `repeats`。
- 只读。给它赋值抛 `TypeError`：`trigger is read-only`。

用 `instanceof` 分辨是哪一种。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const requests = await center.getPendingNotificationRequests();
for (const request of requests) {
  const trigger = request.trigger;
  if (trigger instanceof UNTimeIntervalNotificationTrigger) {
    console.log(request.identifier, trigger.timeInterval + ' 秒');
  } else if (trigger instanceof UNCalendarNotificationTrigger) {
    console.log(request.identifier, JSON.stringify(trigger.dateComponents));
  }
}
```

**效果**（**未在模拟器验证**）：每条还没到的通知输出一行标识和触发方式。

## 对应的 iOS API

`UNNotificationRequest.trigger`。`isKindOfClass:` 写成 `instanceof`。

## 参见

- [`UNNotificationTrigger`](../un-notification-trigger.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
