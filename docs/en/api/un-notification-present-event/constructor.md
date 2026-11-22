---
type: reference
native: UNNotificationPresentEvent()
---

# `UNNotificationPresentEvent()` constructor

The **`UNNotificationPresentEvent()`** constructor creates a `UNNotificationPresentEvent`.

## Syntax

```
new UNNotificationPresentEvent(type)
new UNNotificationPresentEvent(type, { notification, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.notification`**

Optional. Corresponds to the [`notification`](notification.md) property. Must be a `UNNotification` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UNNotificationPresentEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UNNotificationPresentEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UNNotificationPresentEvent('notification');
console.log(event.type, event.notification);
```

**Result**: the console prints `notification null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UNNotificationPresentEvent`](../un-notification-present-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
