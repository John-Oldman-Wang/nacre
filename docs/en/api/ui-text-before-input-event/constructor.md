---
type: reference
native: UITextBeforeInputEvent()
---

# `UITextBeforeInputEvent()` constructor

The **`UITextBeforeInputEvent()`** constructor creates a `UITextBeforeInputEvent`.

## Syntax

```
new UITextBeforeInputEvent(type)
new UITextBeforeInputEvent(type, { range, replacementString, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.range`**

Optional. Corresponds to the [`range`](range.md) property. A `NSRange`, or a plain object with `location`, `length` (converted to a `NSRange` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.replacementString`**

Optional. Corresponds to the [`replacementString`](replacementstring.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UITextBeforeInputEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UITextBeforeInputEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UITextBeforeInputEvent('beforeinput', { range: new NSRange(0, 0), replacementString: 'a', cancelable: true });
console.log(event.range.length, event.replacementString, event.cancelable);
```

**Result**: the console prints `0 a true`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UITextBeforeInputEvent`](../ui-text-before-input-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
