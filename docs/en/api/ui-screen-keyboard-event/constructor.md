---
type: reference
native: UIScreenKeyboardEvent()
---

# `UIScreenKeyboardEvent()` constructor

The **`UIScreenKeyboardEvent()`** constructor creates a `UIScreenKeyboardEvent`.

## Syntax

```
new UIScreenKeyboardEvent(type)
new UIScreenKeyboardEvent(type, { frame, previousFrame, duration, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.frame`**

Optional. Corresponds to the [`frame`](frame.md) property. A `CGRect`, or a plain object with `x`, `y`, `width`, `height` (converted to a `CGRect` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.previousFrame`**

Optional. Corresponds to the [`previousFrame`](previousframe.md) property. A `CGRect`, or a plain object with `x`, `y`, `width`, `height` (converted to a `CGRect` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.duration`**

Optional. Corresponds to the [`duration`](duration.md) property. Converted with `Number()`; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIScreenKeyboardEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIScreenKeyboardEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIScreenKeyboardEvent('keyboardshow', {
  frame: new CGRect(0, 500, 390, 344),
  previousFrame: new CGRect(0, 844, 390, 344),
  duration: 0.25,
});
console.log(event.frame.height, event.duration);
```

**Result**: the console prints `344 0.25`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIScreenKeyboardEvent`](../ui-screen-keyboard-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
