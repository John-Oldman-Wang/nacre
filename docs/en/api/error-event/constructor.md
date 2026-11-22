---
type: reference
native: ErrorEvent()
---

# `ErrorEvent()` constructor

The **`ErrorEvent()`** constructor creates an error event object.

## Syntax

```
new ErrorEvent(type)
new ErrorEvent(type, { message, error, filename, lineno, colno, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.message`**, **`options.error`**, **`options.filename`**, **`options.lineno`**, **`options.colno`**

Optional. Each corresponds to the property of the same name. When omitted, `message` and `filename` are empty strings, `lineno` and `colno` are `0`, and `error` is `undefined`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `ErrorEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'ErrorEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const err = new Error('Test');
const event = new ErrorEvent('error', { message: err.message, error: err });
console.log(event.message, event.error === err);
```

**Result**: the console prints `Test true`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to `new ErrorEvent()` in the browser.

## See also

- [`ErrorEvent`](../error-event.md)
