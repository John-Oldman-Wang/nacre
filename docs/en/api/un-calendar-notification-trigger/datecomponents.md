---
type: reference
native: UNCalendarNotificationTrigger.dateComponents
---

# `UNCalendarNotificationTrigger`: `dateComponents` property

The **`dateComponents`** property is the date components this trigger matches.

## Value

A plain object with only the keys that were written. For the component names, see [`triggerWithDateMatchingComponents()`](triggerwithdatematchingcomponents.md#parameters).

- Read-only. Assigning to it throws `TypeError`: `dateComponents is read-only`.
- The object is frozen; changing its keys throws `TypeError`.
- A component that wasn't written has no key and reads as `undefined`.
- The order of the keys is fixed, regardless of the order they were written in.

## Examples

```js
const trigger = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { minute: 30, hour: 8, day: null });
console.log(JSON.stringify(trigger.dateComponents), trigger.dateComponents.day);
```

**Result**: Prints `{"hour":8,"minute":30} undefined`.

## Corresponding iOS API

`UNCalendarNotificationTrigger.dateComponents`. In ObjC, a component that wasn't set is `NSDateComponentUndefined`; here, the key is absent: `c.day == NSDateComponentUndefined` is written as `trigger.dateComponents.day === undefined`.

## See also

- [`triggerWithDateMatchingComponents()`](triggerwithdatematchingcomponents.md)
- This class belongs to the `@nacrejs/user-notifications` package; see [Installation](../un-user-notification-center.md#installation)
