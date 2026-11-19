---
type: reference
native: UNMutableNotificationContent
status: partial
---

# `UNMutableNotificationContent`

**`UNMutableNotificationContent`** 表示自己写的一条通知的内容：标题、副标题、正文、角标、声音、分组的标识、跟着通知走的数据。

写好内容，交给 [`UNNotificationRequest.requestWithIdentifier()`](un-notification-request/requestwithidentifier.md) 建请求。建请求时内容被复制一份，之后再改这个对象，已经建好的请求不变；同一个内容对象可以改一改、再建下一个请求。

它是 [`UNNotificationContent`](un-notification-content.md) 的子类，字段和它相同，区别是这里的字段可写。它是普通的 JS 值，不继承 `NSObject`；不能继承，也不能往上面加别的字段。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：[`UNNotificationContent`](un-notification-content.md) → `UNMutableNotificationContent`

## 构造函数

[`UNMutableNotificationContent()`](un-mutable-notification-content/constructor.md)

创建一份空的内容：字符串字段都是空串，没有角标和声音。

## 实例属性

全部可读可写，写入时按各自的规则转换，写错的抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`title`](un-mutable-notification-content/title.md) | 标题，粗体的一行 |
| [`subtitle`](un-mutable-notification-content/subtitle.md) | 副标题，标题下面的一行 |
| [`body`](un-mutable-notification-content/body.md) | 正文 |
| [`badge`](un-mutable-notification-content/badge.md) | 送达时把图标上的数字改成几 |
| [`sound`](un-mutable-notification-content/sound.md) | 送达时播放的声音 |
| [`threadIdentifier`](un-mutable-notification-content/threadidentifier.md) | 分组的标识 |
| [`userInfo`](un-mutable-notification-content/userinfo.md) | 跟着通知走的数据，用户看不到 |

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
content.body = '预计明天送达';
content.sound = UNNotificationSound.defaultSound;
content.userInfo = { orderId: 'A1024' };
const request = UNNotificationRequest.requestWithIdentifier('order-A1024', { content });
console.log(request.content.title);
```

**结果**：输出 `订单已发货`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UNMutableNotificationContent alloc] init]` | `new UNMutableNotificationContent()` |
| `content.badge = @3` / `content.badge = nil` | `content.badge = 3` / `content.badge = null` |
| `content.sound = UNNotificationSound.defaultSound` | `content.sound = UNNotificationSound.defaultSound` |
| `content.userInfo = @{ @"orderId": @"A1024" }` | `content.userInfo = { orderId: 'A1024' }` |

## 参见

- [`UNNotificationRequest`](un-notification-request.md)：用内容建请求
- [`UNNotificationContent`](un-notification-content.md)：从请求和通知里读出来的只读内容
- [发本地通知](../guides/local-notifications.md)
