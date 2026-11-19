---
type: reference
native: UNTimeIntervalNotificationTrigger.timeInterval
---

# `UNTimeIntervalNotificationTrigger`: `timeInterval` property

The **`timeInterval`** property is this trigger's interval: how many seconds after being handed to the system the notification is delivered.

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`: `timeInterval is read-only`.
- It's the value written when the trigger was created, and it doesn't change afterward.

## Examples

```js
const trigger = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(90);
console.log(trigger.timeInterval + ' seconds');
```

**Result**: Prints `90 seconds`.

## Corresponding iOS API

`UNTimeIntervalNotificationTrigger.timeInterval`.

## See also

- [`triggerWithTimeInterval()`](triggerwithtimeinterval.md)
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
