---
type: reference
native: UNNotificationTrigger.repeats
---

# `UNNotificationTrigger`：`repeats` 属性

**`repeats`** 属性表示送达之后是不是重新计时、再次送达。三种触发器都有它。

## 值

布尔。

- `true`：送达之后重新计时，再次送达，直到这条请求被撤销。
- `false`：只送达一次。
- 只读。给它赋值抛 `TypeError`：`repeats is read-only`。
- 建触发器时由 `options.repeats` 决定，不带是 `false`。远程推送的触发器上的值来自系统。

## 示例

```js
const once = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
console.log(once.repeats, hourly.repeats);
```

**结果**：输出 `false true`。

## 对应的 iOS API

`UNNotificationTrigger.repeats`。

## 参见

- [`triggerWithTimeInterval()`](../un-time-interval-notification-trigger/triggerwithtimeinterval.md)、[`triggerWithDateMatchingComponents()`](../un-calendar-notification-trigger/triggerwithdatematchingcomponents.md)：建触发器时设
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
