---
type: reference
native: EventTarget()
---

# `EventTarget()` constructor

The **`EventTarget()`** constructor creates a standalone event target. Two parts of the app's code that don't reference each other can use it to notify each other.

## Syntax

```
new EventTarget()
```

### Parameters

None.

### Return value

A new `EventTarget` with no listeners.

### Exceptions

None.

## Examples

```js
const bus = new EventTarget();
bus.addEventListener('saved', () => console.log('Saved'));
bus.dispatchEvent(new Event('saved'));
```

**Result**: the console prints `Saved`. **Not verified in the simulator**; the same pattern on `application` has been verified.

## Corresponding iOS API

There's no corresponding system API. Corresponds to the browser's `new EventTarget()`.

## See also

- [`dispatchEvent()`](dispatchevent.md)
