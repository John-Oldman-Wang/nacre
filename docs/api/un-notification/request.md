---
type: reference
native: UNNotification.request
---

# `UNNotification`：`request` 属性

**`request`** 属性是这条通知来自的那个请求：标识、内容、触发方式都在它上面。

## 值

[`UNNotificationRequest`](../un-notification-request.md)。

- 只读。给它赋值抛 `TypeError`：`request is read-only`。
- 远程推送的通知也有，它的 `trigger` 是 [`UNPushNotificationTrigger`](../un-push-notification-trigger.md)，`content.userInfo` 是推送的负载。
- 不是当初交给系统的那个对象，内容相同。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (event) => {
  const request = event.notification.request;
  console.log(request.identifier, request.content.title);
});
```

**效果**（**未在模拟器验证**）：App 在前台时到了一条通知，输出它的标识和标题。

## 对应的 iOS API

`UNNotification.request`。

## 参见

- [`UNNotificationRequest`](../un-notification-request.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
