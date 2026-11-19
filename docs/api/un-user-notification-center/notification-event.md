---
type: reference
native: "-[UNUserNotificationCenterDelegate userNotificationCenter:willPresentNotification:withCompletionHandler:]"
---

# `UNUserNotificationCenter`：`notification` 事件

**`notification`** 事件在 App 处于前台时到了一条通知时派发。App 不在前台时到的通知没有这个事件。

## 语法

```
center.addEventListener('notification', (event) => { })
```

## 事件对象

`UNNotificationPresentEvent`，一个 `Event`，多一个字段：

**`notification`**

刚到的那一条，一个 [`UNNotification`](../un-notification.md)。

不可取消。回调在事件发生之后的下一轮执行。

## 什么时候派发

- App 在前台，一条通知送达的时候。本地通知和远程推送的通知都派发。
- 这条通知在屏幕上怎么展示，在派发之前就按 [`foregroundPresentationOptions`](foregroundpresentationoptions.md) 定了，监听器改不了这一条。默认值 `[]` 时不展示，只有这个事件。
- 没有监听器时到的通知不留：之后加上监听器也不补发。和 [`notificationclick`](notificationclick-event.md) 不同。
- 什么时候派发**未在模拟器验证**。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (event) => {
  console.log('新消息', event.notification.request.content.body);
});
```

**效果**（**未在模拟器验证**）：App 开着时到了一条通知，控制台输出「新消息」和它的正文。

## 对应的 iOS API

委托方法 `userNotificationCenter:willPresentNotification:withCompletionHandler:`。JS 里不设委托，监听这个事件；那个方法里要调的 `completionHandler` 换成了预先设好的 [`foregroundPresentationOptions`](foregroundpresentationoptions.md)。

## 参见

- [`foregroundPresentationOptions`](foregroundpresentationoptions.md)：前台时到的通知怎么展示
- [`notificationclick`](notificationclick-event.md)：用户点了通知
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
