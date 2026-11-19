---
type: reference
native: UNNotificationRequest.identifier
---

# `UNNotificationRequest`：`identifier` 属性

**`identifier`** 属性是这条通知的标识，由 App 在建请求时起。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`：`identifier is read-only`。
- 撤销通知、从通知中心里拿掉通知时按它找。
- 比较两个请求是不是同一条，用它，不要用 `===`：从系统读回来的请求是新的对象。

## 示例

```js
const content = new UNMutableNotificationContent();
const request = UNNotificationRequest.requestWithIdentifier('order-1024', { content });
console.log(request.identifier);
```

**结果**：输出 `order-1024`。传进去的不是字符串时按字符串转，比如数 `1024` 得到 `'1024'`。

## 对应的 iOS API

`UNNotificationRequest.identifier`。

## 参见

- [`removePendingNotificationRequestsWithIdentifiers()`](../un-user-notification-center/removependingnotificationrequestswithidentifiers.md)：按标识撤销
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
