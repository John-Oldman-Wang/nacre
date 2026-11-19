---
type: reference
native: UNNotificationTrigger.repeats
---

# `UNNotificationTrigger`: `repeats` property

The **`repeats`** property tells whether the trigger restarts the timer and delivers again after delivery. All three kinds of trigger have it.

## Value

A boolean.

- `true`: after delivery, the timer restarts and it is delivered again, until the request is withdrawn.
- `false`: delivered only once.
- Read-only; assigning to it throws `TypeError`: `repeats is read-only`.
- Decided by `options.repeats` when the trigger is created; `false` when not given. On a remote push trigger, the value comes from the system.

## Examples

```js
const once = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
console.log(once.repeats, hourly.repeats);
```

**Result**: Prints `false true`.

## Corresponding iOS API

`UNNotificationTrigger.repeats`.

## See also

- [`triggerWithTimeInterval()`](../un-time-interval-notification-trigger/triggerwithtimeinterval.md), [`triggerWithDateMatchingComponents()`](../un-calendar-notification-trigger/triggerwithdatematchingcomponents.md): set when creating a trigger
- This class belongs to the `@nacrejs/user-notifications` package; for how to install it, see [Install first](../un-user-notification-center.md#installation)
