---
type: reference
native: UNNotificationContent.body
---

# `UNNotificationContent`：`body` 属性

**`body`** 属性是通知的正文。这是从请求或通知里读出来的值。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`：`body is read-only`。
- 没有设过时是 `''`。
- 内容是建请求那一刻的副本，之后不会变，没有变化通知。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.body));
```

**结果**：输出 `""`。这一项没有设过，读出的是默认值。

## 对应的 iOS API

`UNNotificationContent.body`。

## 参见

- [`UNMutableNotificationContent`](../un-mutable-notification-content/body.md)：写这一项
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
