---
type: reference
web: CloseEvent()
---

# `CloseEvent()` constructor

The **`CloseEvent()`** constructor creates a `CloseEvent`.

## Syntax

```
new CloseEvent(type)
new CloseEvent(type, { code, reason, wasClean, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.code`**

Optional. Corresponds to the [`code`](code.md) property. Converted with `Number()` and truncated toward zero; a value that is not a finite number throws `TypeError`. When omitted, it is `0`.

**`options.reason`**

Optional. Corresponds to the [`reason`](reason.md) property. Converted with `String()`; `null` gives an empty string. When omitted, it is an empty string.

**`options.wasClean`**

Optional. Corresponds to the [`wasClean`](wasclean.md) property. Converted to its JS truthiness with `Boolean()`. When omitted, it is `false`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CloseEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CloseEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CloseEvent('close', { code: 1000, reason: 'bye', wasClean: true });
console.log(event.code, event.reason, event.wasClean);
```

**Result**: the console prints `1000 bye true`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `new CloseEvent()` in the browser.

## See also

- [`CloseEvent`](../close-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
