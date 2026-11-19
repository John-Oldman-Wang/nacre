---
type: reference
native: UNNotificationContent.sound
---

# `UNNotificationContent`：`sound` 属性

**`sound`** 属性是通知送达时播放的声音。这是从请求或通知里读出来的值。

## 值

[`UNNotificationSound`](../un-notification-sound.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`：`sound is read-only`。
- 没有设过时是 `null`：不响。
- 一般是 `UNNotificationSound.defaultSound` 或 `null`。
- 从远程推送的通知里读出来的可能是一个不等于 `UNNotificationSound.defaultSound` 的 `UNNotificationSound`：它表示服务器指定了别的声音文件，读不出文件名。带着它的内容不能再用来建请求，`requestWithIdentifier()` 抛 `TypeError`（**未在模拟器验证**）。
- 内容是建请求那一刻的副本，之后不会变，没有变化通知。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.sound));
```

**结果**：输出 `null`。这一项没有设过，读出的是默认值。

## 对应的 iOS API

`UNNotificationContent.sound`。

## 参见

- [`UNMutableNotificationContent`](../un-mutable-notification-content/sound.md)：写这一项
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
