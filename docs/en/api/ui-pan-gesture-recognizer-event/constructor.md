---
type: reference
native: UIPanGestureRecognizerEvent()
---

# `UIPanGestureRecognizerEvent()` constructor

The **`UIPanGestureRecognizerEvent()`** constructor creates a `UIPanGestureRecognizerEvent`.

## Syntax

```
new UIPanGestureRecognizerEvent(type)
new UIPanGestureRecognizerEvent(type, { location, numberOfTouches, translation, velocity, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.location`**

Optional. Corresponds to the [`location`](../ui-gesture-recognizer-event/location.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.numberOfTouches`**

Optional. Corresponds to the [`numberOfTouches`](../ui-gesture-recognizer-event/numberoftouches.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.translation`**

Optional. Corresponds to the [`translation`](translation.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.velocity`**

Optional. Corresponds to the [`velocity`](velocity.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIPanGestureRecognizerEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIPanGestureRecognizerEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIPanGestureRecognizerEvent('changed', { translation: new CGPoint(30, 0), velocity: new CGPoint(200, 0) });
console.log(event instanceof UIGestureRecognizerEvent, event.translation.x, event.location);
```

**Result**: the console prints `true 30 null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
