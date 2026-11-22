---
type: reference
native: UNNotificationResponseEvent.response
---

# `UNNotificationResponseEvent`：`response` 属性

**`response`** 属性是用户对这条通知的动作。

## 值

[`UNNotificationResponse`](../un-notification-response.md)。`response.notification` 是被点的那一条，`response.notification.request.content.userInfo` 是当初放进内容里的数据。

- 只读。给它赋值抛 `TypeError`。
- 用 `userInfo` 决定打开哪个页面。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (e) => {
  const info = e.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('打开订单', info.orderId);
  }
});
```

**效果**：用户点了一条 `userInfo` 里 `screen` 是 `'order'` 的通知，输出 `打开订单` 和订单号。**未在模拟器验证。**

## 对应的 iOS API

`userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:` 的参数 `response`。

## 参见

- [`UNNotificationResponseEvent`](../un-notification-response-event.md)
