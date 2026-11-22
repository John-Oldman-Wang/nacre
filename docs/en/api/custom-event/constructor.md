---
type: reference
web: CustomEvent()
---

# `CustomEvent()` constructor

The **`CustomEvent()`** constructor creates a `CustomEvent`.

## Syntax

```
new CustomEvent(type)
new CustomEvent(type, { detail, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.detail`**

Optional. Corresponds to the [`detail`](detail.md) property. Any value, kept as is. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CustomEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CustomEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CustomEvent('progress', { detail: { done: 3, total: 10 } });
console.log(event.type, event.detail.done, event.cancelable);
```

**Result**: the console prints `progress 3 false`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `new CustomEvent()` in the browser.

## See also

- [`CustomEvent`](../custom-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
