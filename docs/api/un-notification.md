---
type: reference
native: UNNotification
status: partial
---

# `UNNotification`

**`UNNotification`** 表示一条已经送达的通知。它只能由系统给：从 [`getDeliveredNotifications()`](un-user-notification-center/getdeliverednotifications.md)、[`notification`](un-user-notification-center/notification-event.md) 事件和 [`notificationclick`](un-user-notification-center/notificationclick-event.md) 事件的 `response.notification` 来。

它是只读的值：字段不能改，写了抛 `TypeError`。它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotification`

## 构造函数

不能用 `new` 创建。`new UNNotification()` 抛 `TypeError`：

```
Illegal constructor: UNNotification comes from the system (delivered notifications and the notification events)
```

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`date`](un-notification/date.md) <small>只读</small> | 送达的时间 |
| [`request`](un-notification/request.md) <small>只读</small> | 它来自哪个请求 |

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (event) => {
  const notification = event.notification;
  console.log(notification.request.identifier, notification.date.toISOString());
});
```

**效果**（**未在模拟器验证**）：App 在前台时到了一条通知，输出它的标识和送达时间。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `notification.date`（`NSDate`） | `notification.date`（`Date`） |
| `notification.request` | `notification.request` |

## 参见

- [`UNNotificationRequest`](un-notification-request.md)：`request` 的类型
