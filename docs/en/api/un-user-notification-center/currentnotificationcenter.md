---
type: reference
native: +[UNUserNotificationCenter currentNotificationCenter]
---

# `UNUserNotificationCenter.currentNotificationCenter()` static method

The **`UNUserNotificationCenter.currentNotificationCenter()`** static method returns this app's notification center.

## Syntax

```
UNUserNotificationCenter.currentNotificationCenter()
```

### Parameters

None.

### Return value

A `UNUserNotificationCenter`. Every call returns the same object.

The runtime keeps it alive permanently, so listeners attached to it are never lost and you do not need to store it yourself.

### Exceptions

None.

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
console.log(center === UNUserNotificationCenter.currentNotificationCenter());
```

**Result**: logs `true`.

## Corresponding iOS API

`+[UNUserNotificationCenter currentNotificationCenter]`. In the header it is a class method, not a class property, so it takes parentheses.

## See also

- [`UNUserNotificationCenter`](../un-user-notification-center.md)
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
