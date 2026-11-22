---
type: reference
native: UIControlTouchEvent()
---

# `UIControlTouchEvent()` constructor

The **`UIControlTouchEvent()`** constructor creates a `UIControlTouchEvent`.

## Syntax

```
new UIControlTouchEvent(type)
new UIControlTouchEvent(type, { location, tapCount, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.location`**

Optional. Corresponds to the [`location`](location.md) property. A `CGPoint`, or a plain object with `x`, `y` (converted to a `CGPoint` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.tapCount`**

Optional. Corresponds to the [`tapCount`](tapcount.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIControlTouchEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIControlTouchEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIControlTouchEvent('touchupinside', { location: new CGPoint(10, 20), tapCount: 1 });
console.log(event.location?.x, event.tapCount, event.cancelable);
```

**Result**: the console prints `10 1 false`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIControlTouchEvent`](../ui-control-touch-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
