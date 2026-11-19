---
type: reference
native: UNNotificationContent.badge
---

# `UNNotificationContent`：`badge` 属性

**`badge`** 属性是通知送达时把 App 图标右上角的数字（角标）改成几。这是从请求或通知里读出来的值。

## 值

整数（个数），或者 `null`。

- 只读。给它赋值抛 `TypeError`：`badge is read-only`。
- 没有设过时是 `null`。
- `0`：送达时去掉图标上的数字。
- `null`：送达时不改图标上的数字。
- 内容是建请求那一刻的副本，之后不会变，没有变化通知。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.badge));
```

**结果**：输出 `null`。这一项没有设过，读出的是默认值。

## 对应的 iOS API

`UNNotificationContent.badge`。

## 参见

- [`UNMutableNotificationContent`](../un-mutable-notification-content/badge.md)：写这一项
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
