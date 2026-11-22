---
type: reference
native: UIGestureRecognizerEvent()
---

# `UIGestureRecognizerEvent()` constructor

The **`UIGestureRecognizerEvent()`** constructor creates a `UIGestureRecognizerEvent`.

## Syntax

```
new UIGestureRecognizerEvent(type)
new UIGestureRecognizerEvent(type, { location, numberOfTouches, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.location`**

Optional. Corresponds to the [`location`](location.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.numberOfTouches`**

Optional. Corresponds to the [`numberOfTouches`](numberoftouches.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIGestureRecognizerEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIGestureRecognizerEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIGestureRecognizerEvent('ended', { location: new CGPoint(5, 5), numberOfTouches: 1 });
console.log(event.location?.x, event.numberOfTouches);
```

**Result**: the console prints `5 1`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
