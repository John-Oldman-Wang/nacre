---
type: reference
native: CLLocationUpdateEvent()
---

# `CLLocationUpdateEvent()` constructor

The **`CLLocationUpdateEvent()`** constructor creates a `CLLocationUpdateEvent`.

## Syntax

```
new CLLocationUpdateEvent(type)
new CLLocationUpdateEvent(type, { locations, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.locations`**

Optional. Corresponds to the [`locations`](locations.md) property. Must be iterable (an array, a `Set`, …); it is copied into a new array. Anything else throws `TypeError`. When omitted, it is an empty array.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CLLocationUpdateEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CLLocationUpdateEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CLLocationUpdateEvent('locationupdate');
console.log(event.locations.length);
```

**Result**: the console prints `0`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CLLocationUpdateEvent`](../cl-location-update-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
