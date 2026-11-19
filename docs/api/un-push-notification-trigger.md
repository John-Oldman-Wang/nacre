---
type: reference
native: UNPushNotificationTrigger
status: partial
---

# `UNPushNotificationTrigger`

**`UNPushNotificationTrigger`** 表示这条通知是远程推送送来的：由服务器经苹果的推送服务送到手机上。它只会从系统给的通知里读到：已经送达的通知、两个事件里的通知，它们的 `request.trigger` 是这个类。

它没有自己的成员，只有继承来的 [`repeats`](un-notification-trigger/repeats.md)。用它的地方是 `instanceof`：分辨一条通知是本地的还是远程推送的。

它是只读的值，普通的 JS 对象，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：[`UNNotificationTrigger`](un-notification-trigger.md) → `UNPushNotificationTrigger`

## 构造函数

不能用 `new` 创建，`new` 抛 `TypeError`：

```
Illegal constructor: UNPushNotificationTrigger cannot be constructed with new; use UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()
```

它也不能放进请求里：`requestWithIdentifier()` 只收另外两种触发器。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('推送的负载', JSON.stringify(request.content.userInfo));
  }
});
```

**效果**（**未在模拟器验证**）：用户点了一条远程推送的通知时输出它的负载，也就是服务器发出的那个 JSON 对象。

## 对应的 iOS API

`UNPushNotificationTrigger`。`[trigger isKindOfClass:UNPushNotificationTrigger.class]` 写成 `trigger instanceof UNPushNotificationTrigger`。

## 参见

- [发本地通知](../guides/local-notifications.md#收到远程推送的通知)
