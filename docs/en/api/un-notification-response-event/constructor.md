---
type: reference
native: UNNotificationResponseEvent()
---

# `UNNotificationResponseEvent()` constructor

The **`UNNotificationResponseEvent()`** constructor creates a `UNNotificationResponseEvent`.

## Syntax

```
new UNNotificationResponseEvent(type)
new UNNotificationResponseEvent(type, { response, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.response`**

Optional. Corresponds to the [`response`](response.md) property. Must be a `UNNotificationResponse` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UNNotificationResponseEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UNNotificationResponseEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UNNotificationResponseEvent('notificationclick');
console.log(event.type, event.response);
```

**Result**: the console prints `notificationclick null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UNNotificationResponseEvent`](../un-notification-response-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
