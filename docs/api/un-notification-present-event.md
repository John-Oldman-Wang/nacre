---
type: reference
native: UNNotificationPresentEvent
---

# `UNNotificationPresentEvent`

**`UNNotificationPresentEvent`** 表示 App 在前台时，一条通知送达了。

[`UNUserNotificationCenter`](un-user-notification-center.md) 的 [`notification`](un-user-notification-center/notification-event.md) 事件是它，[`notification`](un-notification-present-event/notification.md) 是刚到的那一条。

它属于 `@nacrejs/user-notifications` 这个包，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)。

**继承关系**：[`Event`](event.md) → `UNNotificationPresentEvent`

## 构造函数

[`UNNotificationPresentEvent()`](un-notification-present-event/constructor.md)

创建一个 `UNNotificationPresentEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`notification`](un-notification-present-event/notification.md) <small>只读</small> | 刚到的那一条 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UNUserNotificationCenter`](un-user-notification-center.md) | [`notification`](un-user-notification-center/notification-event.md) |

不能取消：`cancelable` 是 `false`。这条通知在屏幕上怎么展示，派发之前就按 [`foregroundPresentationOptions`](un-user-notification-center/foregroundpresentationoptions.md) 定了。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notification', (e) => {
  console.log(e instanceof UNNotificationPresentEvent, e.notification.request.identifier);
});
```

**效果**：App 在前台时到了一条通知，输出 `true` 和通知的标识。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `userNotificationCenter:willPresentNotification:withCompletionHandler:` | `notification` 事件 |
| 参数 `notification` | `event.notification` |
| `completionHandler(options)` | 预先设好的 [`foregroundPresentationOptions`](un-user-notification-center/foregroundpresentationoptions.md) |

## 参见

- [`UNUserNotificationCenter`](un-user-notification-center.md)：派发这个事件的对象
- [`UNNotification`](un-notification.md)
