---
type: reference
native: "-[UNUserNotificationCenter removeDeliveredNotificationsWithIdentifiers:]"
---

# `UNUserNotificationCenter`：`removeDeliveredNotificationsWithIdentifiers()` 方法

**`removeDeliveredNotificationsWithIdentifiers()`** 方法按标识把已经送达的通知从通知中心里拿掉。

## 语法

```
removeDeliveredNotificationsWithIdentifiers(identifiers)
```

### 参数

**`identifiers`**

字符串的数组，必填。里面的值按字符串转。没有这个标识的通知不报错。

### 返回值

无（`undefined`）。

系统在后台执行，方法立刻返回。紧接着调 [`getDeliveredNotifications()`](getdeliverednotifications.md) 可能还看得到被拿掉的那几条。

### 异常

**`TypeError`**

不是数组：`removeDeliveredNotificationsWithIdentifiers: identifiers must be an array of strings, got "order-1"`。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removeDeliveredNotificationsWithIdentifiers(['order-A1024']);
```

**效果**（**未在模拟器验证**）：通知中心里标识是 `order-A1024` 的那条消失。

## 对应的 iOS API

`-[UNUserNotificationCenter removeDeliveredNotificationsWithIdentifiers:]`。

## 参见

- [`removeAllDeliveredNotifications()`](removealldeliverednotifications.md)：拿掉全部
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
