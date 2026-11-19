---
type: reference
native: UNNotificationRequest
status: partial
---

# `UNNotificationRequest`

**`UNNotificationRequest`** represents a notification to be sent: an identifier, the content, and when to deliver it. Pass it to [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md), and the system delivers it according to its trigger.

The **identifier** is the notification's name, chosen by the app. Cancellation looks it up by identifier. If you submit another request with the same identifier, the system replaces the old one with the new one; there are never two.

A request is a read-only value: its fields can't be changed and no fields can be added; writing throws `TypeError`. A request read back from [`getPendingNotificationRequests()`](un-user-notification-center/getpendingnotificationrequests.md) isn't the same object as the one you submitted, although its content is the same. Compare two requests by `identifier`, not with `===`. It's a plain JS value and doesn't inherit from `NSObject`.

You need to install `@nacrejs/user-notifications` first. See [`UNUserNotificationCenter`](un-user-notification-center.md#installation) for how, or see [Core and capability packages](capabilities.md).

**Inheritance**: `UNNotificationRequest`

## Constructor

You can't create one with `new`. `new UNNotificationRequest()` throws `TypeError`:

```
Illegal constructor: UNNotificationRequest cannot be constructed with new; use UNNotificationRequest.requestWithIdentifier()
```

## Static methods

[`UNNotificationRequest.requestWithIdentifier()`](un-notification-request/requestwithidentifier.md)

Creates a request from an identifier, content, and a trigger.

## Instance properties

| Property | Description |
| --- | --- |
| [`identifier`](un-notification-request/identifier.md) <small>read-only</small> | The identifier |
| [`content`](un-notification-request/content.md) <small>read-only</small> | A copy of the content as of when the request was created |
| [`trigger`](un-notification-request/trigger.md) <small>read-only</small> | The trigger. `null` means deliver immediately |

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Time to drink water';
const request = UNNotificationRequest.requestWithIdentifier('water', {
  content,
  trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600),
});
await UNUserNotificationCenter.currentNotificationCenter().addNotificationRequest(request);
```

**Effect** (**not verified in the simulator**): One hour later, a notification titled "Time to drink water" is delivered. If the user hasn't allowed notifications, the `await` line throws an error whose `name` is `NotAllowedError`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UNNotificationRequest requestWithIdentifier:@"water" content:content trigger:trigger]` | `UNNotificationRequest.requestWithIdentifier('water', { content, trigger })` |

## See also

- [`UNMutableNotificationContent`](un-mutable-notification-content.md): writing the content
- [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md), [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md): the two kinds of trigger
- [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md): handing it to the system
