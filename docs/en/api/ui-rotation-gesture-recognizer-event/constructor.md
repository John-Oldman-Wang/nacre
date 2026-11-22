---
type: reference
native: UIRotationGestureRecognizerEvent()
---

# `UIRotationGestureRecognizerEvent()` constructor

The **`UIRotationGestureRecognizerEvent()`** constructor creates a `UIRotationGestureRecognizerEvent`.

## Syntax

```
new UIRotationGestureRecognizerEvent(type)
new UIRotationGestureRecognizerEvent(type, { location, numberOfTouches, rotation, velocity, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.location`**

Optional. Corresponds to the [`location`](../ui-gesture-recognizer-event/location.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.numberOfTouches`**

Optional. Corresponds to the [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.rotation`**

Optional. Corresponds to the [`rotation`](rotation.md) property. Converted with `Number()`; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.velocity`**

Optional. Corresponds to the [`velocity`](velocity.md) property. Converted with `Number()`; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIRotationGestureRecognizerEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIRotationGestureRecognizerEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIRotationGestureRecognizerEvent('changed', { rotation: Math.PI / 2 });
console.log(event.rotation.toFixed(2), event.velocity);
```

**Result**: the console prints `1.57 0`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
