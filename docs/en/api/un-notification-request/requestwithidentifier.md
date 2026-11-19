---
type: reference
native: "+[UNNotificationRequest requestWithIdentifier:content:trigger:]"
---

# `UNNotificationRequest.requestWithIdentifier()` static method

The **`UNNotificationRequest.requestWithIdentifier()`** static method creates a request from an identifier, content, and a trigger.

## Syntax

```
UNNotificationRequest.requestWithIdentifier(identifier, { content[, trigger] })
```

### Parameters

**`identifier`**

The notification's identifier, converted to a string. You cancel by it later; submitting another request with the same identifier replaces the earlier one.

**`options.content`**

Required. A [`UNMutableNotificationContent`](../un-mutable-notification-content.md), or a [`UNNotificationContent`](../un-notification-content.md) read from another request. The content is copied here.

**`options.trigger`**

Optional. A [`UNTimeIntervalNotificationTrigger`](../un-time-interval-notification-trigger.md) or a [`UNCalendarNotificationTrigger`](../un-calendar-notification-trigger.md). If it's omitted or `null`, the notification is delivered immediately.

### Return value

A new `UNNotificationRequest`. Its [`content`](content.md) is a read-only copy of the content at this moment: changing the original content afterward doesn't change the one in the request.

### Exceptions

**`TypeError`**

| Input | Error message |
| --- | --- |
| No `content` | `requestWithIdentifier needs { content }` |
| `content` is a plain object | `requestWithIdentifier: content must be a UNNotificationContent, got an object` |
| `content` carries a non-default sound read from a remote push notification | `requestWithIdentifier: this content carries a sound that came from a delivered notification and cannot be scheduled again` |
| `trigger` isn't a trigger, e.g. `5` | `requestWithIdentifier: trigger must be a UNTimeIntervalNotificationTrigger, a UNCalendarNotificationTrigger or null, got 5` |
| `trigger` is a kind that can't be scheduled, such as `UNPushNotificationTrigger` | `requestWithIdentifier: trigger must be a UNTimeIntervalNotificationTrigger, a UNCalendarNotificationTrigger or null, got a trigger that cannot be scheduled` |

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'First';
const first = UNNotificationRequest.requestWithIdentifier('a', { content });
content.title = 'Second';
const second = UNNotificationRequest.requestWithIdentifier('b', {
  content,
  trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(60),
});
console.log(first.content.title, second.content.title, first.trigger);
```

**Result**: Prints `First Second null`. You can modify the same content object and create the next request; the earlier request isn't affected.

## Corresponding iOS API

`+[UNNotificationRequest requestWithIdentifier:content:trigger:]`. The `content:` and `trigger:` parts become keys of the options object.

## See also

- [`addNotificationRequest()`](../un-user-notification-center/addnotificationrequest.md): hand the request to the system
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
