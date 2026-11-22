---
type: reference
native: CLLocationErrorEvent()
---

# `CLLocationErrorEvent()` constructor

The **`CLLocationErrorEvent()`** constructor creates a `CLLocationErrorEvent`.

## Syntax

```
new CLLocationErrorEvent(type)
new CLLocationErrorEvent(type, { error, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.error`**

Optional. Corresponds to the [`error`](error.md) property. Any value, kept as is. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CLLocationErrorEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CLLocationErrorEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CLLocationErrorEvent('locationerror');
console.log(event.type, event.error);
```

**Result**: the console prints `locationerror null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CLLocationErrorEvent`](../cl-location-error-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
