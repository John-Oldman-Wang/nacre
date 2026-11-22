---
type: reference
native: UNNotificationPresentEvent.notification
---

# `UNNotificationPresentEvent`：`notification` 属性

**`notification`** 属性是刚到的那一条通知。

## 值

[`UNNotification`](../un-notification.md)。内容在 `notification.request.content` 里。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (e) => {
  console.log('新消息', e.notification.request.content.body);
});
```

**效果**：App 在前台时到了一条通知，输出 `新消息` 和通知的正文。**未在模拟器验证。**

## 对应的 iOS API

`userNotificationCenter:willPresentNotification:withCompletionHandler:` 的参数 `notification`。

## 参见

- [`UNNotificationPresentEvent`](../un-notification-present-event.md)
