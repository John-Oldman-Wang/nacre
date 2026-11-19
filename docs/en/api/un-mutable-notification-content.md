---
type: reference
native: UNMutableNotificationContent
status: partial
---

# `UNMutableNotificationContent`

**`UNMutableNotificationContent`** represents the content of a notification you write yourself: title, subtitle, body, badge, sound, group identifier, and data that travels with the notification.

Once the content is written, hand it to [`UNNotificationRequest.requestWithIdentifier()`](un-notification-request/requestwithidentifier.md) to create a request. The content is copied when the request is created; changing this object afterward does not change requests already created, and the same content object can be tweaked and used to create the next request.

It is a subclass of [`UNNotificationContent`](un-notification-content.md) with the same fields; the difference is that the fields here are writable. It is a plain JS value and does not inherit from `NSObject`; it cannot be subclassed, and other fields cannot be added to it.

Install `@nacrejs/user-notifications` first; for how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or [Core and capability packages](capabilities.md).

**Inheritance**: [`UNNotificationContent`](un-notification-content.md) → `UNMutableNotificationContent`

## Constructor

[`UNMutableNotificationContent()`](un-mutable-notification-content/constructor.md)

Creates empty content: the string fields are all empty strings, with no badge and no sound.

## Instance properties

All are readable and writable. Written values are converted according to each property's rules, and invalid ones throw `TypeError`.

| Property | Description |
| --- | --- |
| [`title`](un-mutable-notification-content/title.md) | The title, a bold line |
| [`subtitle`](un-mutable-notification-content/subtitle.md) | The subtitle, a line below the title |
| [`body`](un-mutable-notification-content/body.md) | The body |
| [`badge`](un-mutable-notification-content/badge.md) | What to set the number on the icon to on delivery |
| [`sound`](un-mutable-notification-content/sound.md) | The sound played on delivery |
| [`threadIdentifier`](un-mutable-notification-content/threadidentifier.md) | The group identifier |
| [`userInfo`](un-mutable-notification-content/userinfo.md) | Data that travels with the notification, not visible to the user |

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Your order has shipped';
content.body = 'Expected to arrive tomorrow';
content.sound = UNNotificationSound.defaultSound;
content.userInfo = { orderId: 'A1024' };
const request = UNNotificationRequest.requestWithIdentifier('order-A1024', { content });
console.log(request.content.title);
```

**Result**: Prints `Your order has shipped`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UNMutableNotificationContent alloc] init]` | `new UNMutableNotificationContent()` |
| `content.badge = @3` / `content.badge = nil` | `content.badge = 3` / `content.badge = null` |
| `content.sound = UNNotificationSound.defaultSound` | `content.sound = UNNotificationSound.defaultSound` |
| `content.userInfo = @{ @"orderId": @"A1024" }` | `content.userInfo = { orderId: 'A1024' }` |

## See also

- [`UNNotificationRequest`](un-notification-request.md): creating a request from content
- [`UNNotificationContent`](un-notification-content.md): the read-only content read from requests and notifications
- [Sending local notifications](../guides/local-notifications.md)
