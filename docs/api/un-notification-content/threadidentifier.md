---
type: reference
native: UNNotificationContent.threadIdentifier
---

# `UNNotificationContent`：`threadIdentifier` 属性

**`threadIdentifier`** 属性是分组的标识。通知中心把这个值相同的通知叠成一组。这是从请求或通知里读出来的值。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`：`threadIdentifier is read-only`。
- 没有设过时是 `''`：不指定，按 App 分组。
- 内容是建请求那一刻的副本，之后不会变，没有变化通知。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
const request = UNNotificationRequest.requestWithIdentifier('order', { content });
console.log(JSON.stringify(request.content.threadIdentifier));
```

**结果**：输出 `""`。这一项没有设过，读出的是默认值。

## 对应的 iOS API

`UNNotificationContent.threadIdentifier`。

## 参见

- [`UNMutableNotificationContent`](../un-mutable-notification-content/threadidentifier.md)：写这一项
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
