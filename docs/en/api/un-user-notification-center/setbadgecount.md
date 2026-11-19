---
type: reference
native: "-[UNUserNotificationCenter setBadgeCount:withCompletionHandler:]"
---

# `UNUserNotificationCenter`: `setBadgeCount()` method

The **`setBadgeCount()`** method changes the number at the top right of the app icon (the badge) to the given number.

## Syntax

```
setBadgeCount(count)
```

### Parameters

**`count`**

An integer no less than 0 (a count). Fractions are truncated toward zero, and strings that look like numbers are converted to numbers. `0` removes the number.

### Return value

A `Promise` that fulfills with `undefined` once the change is made.

How the system responds when the user has not allowed badges is **not verified in the simulator**.

### Exceptions

**`TypeError`**

Thrown synchronously:

| Written | Error message |
| --- | --- |
| A negative number, `-1` | `setBadgeCount: count must not be negative, got -1` |
| Not convertible to a finite number, `'many'` | `setBadgeCount: count must be a finite number, got "many"` |

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
await center.setBadgeCount(3);
```

**Effect** (**not verified in the simulator**): the top right of the app icon shows 3.

## Corresponding iOS API

`-[UNUserNotificationCenter setBadgeCount:withCompletionHandler:]`. The completion handler is replaced by a promise.

## See also

- [`badge`](../un-mutable-notification-content/badge.md): changing the badge when a notification is delivered
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
