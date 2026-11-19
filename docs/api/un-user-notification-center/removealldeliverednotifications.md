---
type: reference
native: "-[UNUserNotificationCenter removeAllDeliveredNotifications]"
---

# `UNUserNotificationCenter`：`removeAllDeliveredNotifications()` 方法

**`removeAllDeliveredNotifications()`** 方法把这个 App 已经送达的通知全部从通知中心里拿掉。

## 语法

```
removeAllDeliveredNotifications()
```

### 参数

无。

### 返回值

无（`undefined`）。系统在后台执行，方法立刻返回。

### 异常

无。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removeAllDeliveredNotifications();
await center.setBadgeCount(0);
```

**效果**（**未在模拟器验证**）：通知中心里这个 App 的通知全部消失，图标右上角的数字去掉。常见的做法是在用户看过消息之后做这两件事。

## 对应的 iOS API

`-[UNUserNotificationCenter removeAllDeliveredNotifications]`。

## 参见

- [`setBadgeCount()`](setbadgecount.md)：去掉图标上的数字
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
