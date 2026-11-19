---
type: reference
native: "-[UNUserNotificationCenter getDeliveredNotificationsWithCompletionHandler:]"
---

# `UNUserNotificationCenter`：`getDeliveredNotifications()` 方法

**`getDeliveredNotifications()`** 方法读已经送达、还留在通知中心里的通知。

## 语法

```
getDeliveredNotifications()
```

### 参数

无。

### 返回值

`Promise`，兑现成 [`UNNotification`](../un-notification.md) 的数组。用户划掉的、点过的不在里面（**未在模拟器验证**）。

### 异常

无。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const delivered = await center.getDeliveredNotifications();
console.log('通知中心里还有 ' + delivered.length + ' 条');
```

**效果**（**未在模拟器验证**）：输出通知中心里这个 App 的通知条数。

## 对应的 iOS API

`-[UNUserNotificationCenter getDeliveredNotificationsWithCompletionHandler:]`。完成回调换成了 Promise。

## 参见

- [`removeDeliveredNotificationsWithIdentifiers()`](removedeliverednotificationswithidentifiers.md)：从通知中心里拿掉
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
