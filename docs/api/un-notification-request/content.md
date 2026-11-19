---
type: reference
native: UNNotificationRequest.content
---

# `UNNotificationRequest`：`content` 属性

**`content`** 属性是这条通知的内容：建请求那一刻的副本。

## 值

[`UNNotificationContent`](../un-notification-content.md)，字段只读。

- 只读。给它赋值抛 `TypeError`：`content is read-only`。
- 建请求之后再改原来的 `UNMutableNotificationContent`，这里不变。
- 不是传进去的那个对象。

## 示例

```js
const draft = new UNMutableNotificationContent();
draft.title = '原来的标题';
const request = UNNotificationRequest.requestWithIdentifier('x', { content: draft });
draft.title = '改过的标题';
console.log(request.content.title, request.content === draft);
```

**结果**：输出 `原来的标题 false`。

## 对应的 iOS API

`UNNotificationRequest.content`。ObjC 里这个属性标的是 `copy`，同样是副本。

## 参见

- [`UNNotificationContent`](../un-notification-content.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
