---
type: reference
native: UNNotificationRequest
status: partial
---

# `UNNotificationRequest`

**`UNNotificationRequest`** 表示一条要发的通知：标识、内容、什么时候送达。把它交给 [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md)，系统就按触发方式送达。

**标识**是这条通知的名字，由 App 自己起。撤销时按它找；再交一条标识相同的请求，系统用新的替换旧的，不会出现两条。

请求是只读的值：字段不能改，也不能加字段，写了抛 `TypeError`。从 [`getPendingNotificationRequests()`](un-user-notification-center/getpendingnotificationrequests.md) 读回来的请求和当初交出去的那个不是同一个对象，内容相同。比较两个请求用 `identifier`，不要用 `===`。它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotificationRequest`

## 构造函数

不能用 `new` 创建。`new UNNotificationRequest()` 抛 `TypeError`：

```
Illegal constructor: UNNotificationRequest cannot be constructed with new; use UNNotificationRequest.requestWithIdentifier()
```

## 静态方法

[`UNNotificationRequest.requestWithIdentifier()`](un-notification-request/requestwithidentifier.md)

用标识、内容和触发方式建一个请求。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`identifier`](un-notification-request/identifier.md) <small>只读</small> | 标识 |
| [`content`](un-notification-request/content.md) <small>只读</small> | 内容在建请求那一刻的副本 |
| [`trigger`](un-notification-request/trigger.md) <small>只读</small> | 触发方式。`null` 是立刻送达 |

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '该喝水了';
const request = UNNotificationRequest.requestWithIdentifier('water', {
  content,
  trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600),
});
await UNUserNotificationCenter.currentNotificationCenter().addNotificationRequest(request);
```

**效果**（**未在模拟器验证**）：一小时后送达一条标题是「该喝水了」的通知。用户没有允许通知时，`await` 那一行抛出 `name` 是 `NotAllowedError` 的错误。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UNNotificationRequest requestWithIdentifier:@"water" content:content trigger:trigger]` | `UNNotificationRequest.requestWithIdentifier('water', { content, trigger })` |

## 参见

- [`UNMutableNotificationContent`](un-mutable-notification-content.md)：写内容
- [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md)、[`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md)：两种触发方式
- [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md)：交给系统
