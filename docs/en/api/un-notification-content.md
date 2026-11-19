---
type: reference
native: UNNotificationContent
status: partial
---

# `UNNotificationContent`

**`UNNotificationContent`** represents the read-only content of a notification, read from a request's [`content`](un-notification-request/content.md), including those of delivered notifications and remote push notifications.

Its fields are the same as [`UNMutableNotificationContent`](un-mutable-notification-content.md), and none are writable: assigning to a field throws `TypeError`, such as `title is read-only`. To write content yourself, use `UNMutableNotificationContent`.

Content you read can be handed to [`requestWithIdentifier()`](un-notification-request/requestwithidentifier.md) again to create a new request, unless it carries a sound that isn't the default; see [`sound`](un-notification-content/sound.md).

It is a plain JS value and doesn't inherit from `NSObject`.

You need to install `@nacrejs/user-notifications` first. For how, see [`UNUserNotificationCenter`](un-user-notification-center.md#installation), or [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotificationContent`. Its subclass is [`UNMutableNotificationContent`](un-mutable-notification-content.md).

## Constructor

Can't be created with `new`. `new UNNotificationContent()` throws `TypeError`:

```
Illegal constructor: UNNotificationContent is read from a request or a notification; write content with new UNMutableNotificationContent()
```

## Instance properties

All read-only.

| Property | Description |
| --- | --- |
| [`title`](un-notification-content/title.md) <small>read-only</small> | The title |
| [`subtitle`](un-notification-content/subtitle.md) <small>read-only</small> | The subtitle |
| [`body`](un-notification-content/body.md) <small>read-only</small> | The body |
| [`badge`](un-notification-content/badge.md) <small>read-only</small> | What to change the number on the icon to on delivery |
| [`sound`](un-notification-content/sound.md) <small>read-only</small> | The sound played on delivery |
| [`threadIdentifier`](un-notification-content/threadidentifier.md) <small>read-only</small> | The thread identifier for grouping |
| [`userInfo`](un-notification-content/userinfo.md) <small>read-only</small> | Data that travels with the notification. For remote push notifications, this is the whole push payload |

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const delivered = await center.getDeliveredNotifications();
for (const notification of delivered) {
  const content = notification.request.content;
  console.log(content.title, content.body);
}
```

**Effect**: Prints one line with the title and body for each of this app's notifications in Notification Center. **Not verified in the simulator.**

## Corresponding iOS API

`UNNotificationContent`. Each field has the same name as the ObjC property.

## See also

- [`UNMutableNotificationContent`](un-mutable-notification-content.md): write content yourself
- [`UNNotificationRequest`](un-notification-request.md): content is read from the request
