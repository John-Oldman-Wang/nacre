---
type: reference
native: UNNotificationContent.userInfo
---

# `UNNotificationContent`：`userInfo` 属性

**`userInfo`** 属性是跟着通知走的数据，用户看不到。通知被点了之后从 [`notificationclick`](../un-user-notification-center/notificationclick-event.md) 事件里原样拿回来。这是从请求或通知里读出来的值。

## 值

对象。

- 只读。给它赋值抛 `TypeError`：`userInfo is read-only`。
- 没有设过时是 `{}`。
- 读出来的对象是冻结的，改它抛 `TypeError`。
- 远程推送的通知，这里是推送的整个负载，也就是服务器发出的那个 JSON 对象，里面可以有 `null`。
- 内容是建请求那一刻的副本，之后不会变，没有变化通知。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.userInfo));
```

**结果**：输出 `{}`。这一项没有设过，读出的是默认值。

## 对应的 iOS API

`UNNotificationContent.userInfo`。

## 参见

- [`UNMutableNotificationContent`](../un-mutable-notification-content/userinfo.md)：写这一项
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
