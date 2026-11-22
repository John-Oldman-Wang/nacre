---
type: reference
native: UIPinchGestureRecognizerEvent()
---

# `UIPinchGestureRecognizerEvent()` constructor

The **`UIPinchGestureRecognizerEvent()`** constructor creates a `UIPinchGestureRecognizerEvent`.

## Syntax

```
new UIPinchGestureRecognizerEvent(type)
new UIPinchGestureRecognizerEvent(type, { location, numberOfTouches, scale, velocity, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.location`**

Optional. Corresponds to the [`location`](../ui-gesture-recognizer-event/location.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.numberOfTouches`**

Optional. Corresponds to the [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.scale`**

Optional. Corresponds to the [`scale`](scale.md) property. Converted with `Number()`; a value that is not a finite number throws `TypeError`. When omitted, it is `1`.

**`options.velocity`**

Optional. Corresponds to the [`velocity`](velocity.md) property. Converted with `Number()`; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIPinchGestureRecognizerEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIPinchGestureRecognizerEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIPinchGestureRecognizerEvent('changed', { scale: 2, velocity: 0.5 });
console.log(event.scale, event.velocity, event.numberOfTouches);
```

**Result**: the console prints `2 0.5 0`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
