---
type: reference
native: UNNotificationResponseEvent
---

# `UNNotificationResponseEvent`

**`UNNotificationResponseEvent`** 表示用户点了一条通知。

[`UNUserNotificationCenter`](un-user-notification-center.md) 的 [`notificationclick`](un-user-notification-center/notificationclick-event.md) 事件是它，[`response`](un-notification-response-event/response.md) 是用户的动作。

它属于 `@nacrejs/user-notifications` 这个包，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)。

**继承关系**：[`Event`](event.md) → `UNNotificationResponseEvent`

## 构造函数

[`UNNotificationResponseEvent()`](un-notification-response-event/constructor.md)

创建一个 `UNNotificationResponseEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`response`](un-notification-response-event/response.md) <small>只读</small> | 用户的动作 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UNUserNotificationCenter`](un-user-notification-center.md) | [`notificationclick`](un-user-notification-center/notificationclick-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (e) => {
  console.log(e instanceof UNNotificationResponseEvent, e.response.actionIdentifier);
});
```

**效果**：用户点了一条通知，输出 `true` 和动作的标识。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:` | `notificationclick` 事件 |
| 参数 `response` | `event.response` |

## 参见

- [`UNUserNotificationCenter`](un-user-notification-center.md)：派发这个事件的对象
- [`UNNotificationResponse`](un-notification-response.md)
