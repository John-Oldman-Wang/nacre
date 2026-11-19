---
type: reference
native: ErrorEvent()
---

# `ErrorEvent()` constructor

The **`ErrorEvent()`** constructor creates an error event object.

## Syntax

```
new ErrorEvent(type)
new ErrorEvent(type, { message, error, filename, lineno, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.message`**, **`options.error`**, **`options.filename`**, **`options.lineno`**

Optional. Each corresponds to the property of the same name. The values when omitted are **not verified in the simulator**.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `ErrorEvent`.

### Exceptions

Throws `TypeError` when no event name is passed, same as [`Event()`](../event/constructor.md). **Not verified in the simulator.**

## Examples

```js
const err = new Error('Test');
const event = new ErrorEvent('error', { message: err.message, error: err });
console.log(event.message, event.error === err);
```

**Result**: the console prints `Test true`. **Not verified in the simulator.**

## Corresponding iOS API

There is no corresponding system API. It corresponds to `new ErrorEvent()` in the browser.

## See also

- [`ErrorEvent`](../error-event.md)
