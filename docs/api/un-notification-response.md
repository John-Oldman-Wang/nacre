---
type: reference
native: UNNotificationResponse
status: partial
---

# `UNNotificationResponse`

**`UNNotificationResponse`** 表示用户对一条通知做的动作，比如点了它。它只从 [`notificationclick`](un-user-notification-center/notificationclick-event.md) 事件的 `response` 来。

它是只读的值：字段不能改，写了抛 `TypeError`。它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotificationResponse`

## 构造函数

不能用 `new` 创建。`new UNNotificationResponse()` 抛 `TypeError`：

```
Illegal constructor: UNNotificationResponse comes from the notificationclick event
```

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`notification`](un-notification-response/notification.md) <small>只读</small> | 是哪一条通知 |
| [`actionIdentifier`](un-notification-response/actionidentifier.md) <small>只读</small> | 用户做了什么 |

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  const response = event.response;
  if (response.actionIdentifier === 'default') {
    console.log('点了', response.notification.request.identifier);
  }
});
```

**效果**（**未在模拟器验证**）：用户点一条通知，输出它的标识。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[response.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]` | `response.actionIdentifier === 'default'` |
| `[response.actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]` | `response.actionIdentifier === 'dismiss'` |

## 参见

- [`notificationclick`](un-user-notification-center/notificationclick-event.md)：动作从这个事件来
