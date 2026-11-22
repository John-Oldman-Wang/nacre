---
type: reference
native: "-[UNUserNotificationCenterDelegate userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:]"
---

# `UNUserNotificationCenter`：`notificationclick` 事件

**`notificationclick`** 事件在用户对一条通知做了动作时派发，最常见的是点了它。

## 语法

```
center.addEventListener('notificationclick', (event) => { })
```

## 事件对象

[`UNNotificationResponseEvent`](../un-notification-response-event.md)，一个 `Event`，多一个字段：

**[`response`](../un-notification-response-event/response.md)**

用户的动作，一个 [`UNNotificationResponse`](../un-notification-response.md)。`response.notification` 是被点的那一条，`response.notification.request.content.userInfo` 是当初放进内容里的数据，用它决定打开哪个页面。

不可取消。回调在事件发生之后的下一轮执行。

## 什么时候派发

用户点一条通知，系统把 App 带到前台（没在运行就启动它），然后派发这个事件。本地通知和远程推送的通知都派发。系统的行为**未在模拟器验证**。

**监听器什么时候加都收得到启动时的那一次点击。** 用户点通知把 App 启动起来时，系统交出这次点击的时刻，JS 可能还没执行到 `addEventListener` 那一行。运行时把没有人监听时到的点击留着，等这个事件第一次有监听器时补发。规则：

- 最多留 8 条，超出时丢掉最早的。
- 没有时间限制，留到有监听器为止。
- 补发之后就清掉。监听器全部移除之后到的点击同样留着，下一次有监听器时补发。

用户把通知划掉时，只有登记了分类、并且分类要求报告划掉的通知才派发这个事件，`actionIdentifier` 是 `'dismiss'`。这个包还不能登记分类，所以用它发的通知划掉时没有事件。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('打开订单', info.orderId);
  }
});
```

**效果**（**未在模拟器验证**）：用户点了一条 `userInfo` 是 `{ screen: 'order', orderId: 'A1024' }` 的通知，输出「打开订单 A1024」。App 是被这次点击启动的也一样。

## 对应的 iOS API

委托方法 `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`。JS 里不设委托，监听这个事件；参数 `response` 在事件对象上。

## 参见

- [`UNNotificationResponse`](../un-notification-response.md)：`response` 里有什么
- [`userInfo`](../un-mutable-notification-content/userinfo.md)：放进通知的数据
- [发本地通知](../../guides/local-notifications.md#带上数据点了之后拿回来)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
