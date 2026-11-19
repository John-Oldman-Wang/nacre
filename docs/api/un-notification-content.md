---
type: reference
native: UNNotificationContent
status: partial
---

# `UNNotificationContent`

**`UNNotificationContent`** 表示一条通知只读的内容：从请求的 [`content`](un-notification-request/content.md) 读出来的，包括已经送达的通知和远程推送的通知里的。

字段和 [`UNMutableNotificationContent`](un-mutable-notification-content.md) 相同，都不可写：给字段赋值抛 `TypeError`，比如 `title is read-only`。要自己写内容，用 `UNMutableNotificationContent`。

读出来的内容可以再交给 [`requestWithIdentifier()`](un-notification-request/requestwithidentifier.md) 建新的请求，除非它带着一个不是默认的声音，见 [`sound`](un-notification-content/sound.md)。

它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotificationContent`。子类是 [`UNMutableNotificationContent`](un-mutable-notification-content.md)。

## 构造函数

不能用 `new` 创建。`new UNNotificationContent()` 抛 `TypeError`：

```
Illegal constructor: UNNotificationContent is read from a request or a notification; write content with new UNMutableNotificationContent()
```

## 实例属性

全部只读。

| 属性 | 说明 |
| --- | --- |
| [`title`](un-notification-content/title.md) <small>只读</small> | 标题 |
| [`subtitle`](un-notification-content/subtitle.md) <small>只读</small> | 副标题 |
| [`body`](un-notification-content/body.md) <small>只读</small> | 正文 |
| [`badge`](un-notification-content/badge.md) <small>只读</small> | 送达时把图标上的数字改成几 |
| [`sound`](un-notification-content/sound.md) <small>只读</small> | 送达时播放的声音 |
| [`threadIdentifier`](un-notification-content/threadidentifier.md) <small>只读</small> | 分组的标识 |
| [`userInfo`](un-notification-content/userinfo.md) <small>只读</small> | 跟着通知走的数据。远程推送的通知，这里是推送的整个负载 |

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const delivered = await center.getDeliveredNotifications();
for (const notification of delivered) {
  const content = notification.request.content;
  console.log(content.title, content.body);
}
```

**效果**：通知中心里这个 App 的每条通知输出一行标题和正文。**未在模拟器验证。**

## 对应的 iOS API

`UNNotificationContent`。各字段和 ObjC 的属性同名。

## 参见

- [`UNMutableNotificationContent`](un-mutable-notification-content.md)：自己写内容
- [`UNNotificationRequest`](un-notification-request.md)：内容从请求上读
