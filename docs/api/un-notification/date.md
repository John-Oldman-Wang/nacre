---
type: reference
native: UNNotification.date
---

# `UNNotification`：`date` 属性

**`date`** 属性是这条通知送达的时间。

## 值

`Date`。

- 只读。给它赋值抛 `TypeError`：`date is read-only`。
- 每次读得到一个新的 `Date` 对象。改读出来的 `Date` 不影响这条通知。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const delivered = await center.getDeliveredNotifications();
for (const notification of delivered) {
  console.log(notification.request.identifier, notification.date.toLocaleString());
}
```

**效果**（**未在模拟器验证**）：通知中心里的每条通知输出一行标识和送达时间。

## 对应的 iOS API

`UNNotification.date`。ObjC 里是 `NSDate`，这里是 `Date`。

## 参见

- [`UNNotification`](../un-notification.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
