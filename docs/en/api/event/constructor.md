---
type: reference
native: Event()
---

# `Event()` constructor

The **`Event()`** constructor creates an event object.

## Syntax

```
new Event(type)
new Event(type, { cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.cancelable`**

A boolean, optional, defaults to `false`. When `true`, a listener calling `preventDefault()` takes effect.

### Return value

A new `Event`. It hasn't been dispatched yet, so `target` is `null`.

### Exceptions

**`TypeError`**

No event name passed: `Failed to construct 'Event': 1 argument required, but only 0 present.`

## Examples

```js
const event = new Event('login');
console.log(event.type, event.cancelable, event.target);
```

**Result**: The console prints `login false null`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to the browser's `new Event()`.

## See also

- [`dispatchEvent()`](../event-target/dispatchevent.md)
