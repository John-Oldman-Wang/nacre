---
type: reference
native: UNNotificationResponse.notification
---

# `UNNotificationResponse`：`notification` 属性

**`notification`** 属性是用户做动作的那一条通知。

## 值

[`UNNotification`](../un-notification.md)。

- 只读。给它赋值抛 `TypeError`：`notification is read-only`。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  console.log(JSON.stringify(info));
});
```

**效果**（**未在模拟器验证**）：用户点一条通知，输出当初放进它内容里的数据。

## 对应的 iOS API

`UNNotificationResponse.notification`。

## 参见

- [`notificationclick`](../un-user-notification-center/notificationclick-event.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
