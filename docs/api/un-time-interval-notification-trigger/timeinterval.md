---
type: reference
native: UNTimeIntervalNotificationTrigger.timeInterval
---

# `UNTimeIntervalNotificationTrigger`：`timeInterval` 属性

**`timeInterval`** 属性是这个触发器的间隔：交给系统之后过多少秒送达。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`：`timeInterval is read-only`。
- 是建触发器时写进去的值，之后不变。

## 示例

```js
const trigger = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(90);
console.log(trigger.timeInterval + ' 秒');
```

**结果**：输出 `90 秒`。

## 对应的 iOS API

`UNTimeIntervalNotificationTrigger.timeInterval`。

## 参见

- [`triggerWithTimeInterval()`](triggerwithtimeinterval.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
