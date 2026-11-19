---
type: reference
native: "-[UNMutableNotificationContent init]"
---

# `UNMutableNotificationContent()` constructor

The **`UNMutableNotificationContent()`** constructor creates empty notification content, for writing fields such as the title and body.

## Syntax

```
new UNMutableNotificationContent()
```

### Parameters

None.

### Return value

A new `UNMutableNotificationContent`. The default value of each field:

| Property | Default |
| --- | --- |
| [`title`](title.md), [`subtitle`](subtitle.md), [`body`](body.md), [`threadIdentifier`](threadidentifier.md) | `''` |
| [`badge`](badge.md) | `null` |
| [`sound`](sound.md) | `null` |
| [`userInfo`](userinfo.md) | `{}` |

Other fields cannot be added to the created object: adding a field to it in strict mode throws `TypeError`.

### Exceptions

**`TypeError`**

Subclassing it and then constructing (`new MyContent()` after `class MyContent extends UNMutableNotificationContent {}`):

```
Illegal constructor: MyContent extends UNMutableNotificationContent, but subclassing native classes is not supported yet
```

## Examples

```js
const content = new UNMutableNotificationContent();
content.title = 'Time to drink some water';
console.log(content.title, content.badge);
```

**Result**: Prints `Time to drink some water null`.

## Corresponding iOS API

`-[UNMutableNotificationContent init]`.

## See also

- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md): creating a request from content
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
