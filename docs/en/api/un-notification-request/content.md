---
type: reference
native: UNNotificationRequest.content
---

# `UNNotificationRequest`: `content` property

The **`content`** property is the content of the notification: a copy taken when the request was created.

## Value

A [`UNNotificationContent`](../un-notification-content.md) with read-only fields.

- Read-only. Assigning to it throws `TypeError`: `content is read-only`.
- Changing the original `UNMutableNotificationContent` after creating the request doesn't change this.
- It isn't the object that was passed in.

## Examples

```js
const draft = new UNMutableNotificationContent();
draft.title = 'Original title';
const request = UNNotificationRequest.requestWithIdentifier('x', { content: draft });
draft.title = 'Edited title';
console.log(request.content.title, request.content === draft);
```

**Result**: Prints `Original title false`.

## Corresponding iOS API

`UNNotificationRequest.content`. In ObjC this property is marked `copy`, so it's a copy there too.

## See also

- [`UNNotificationContent`](../un-notification-content.md)
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
