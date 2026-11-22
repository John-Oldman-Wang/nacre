---
type: reference
native: PromiseRejectionEvent()
---

# `PromiseRejectionEvent()` constructor

The **`PromiseRejectionEvent()`** constructor creates a rejection event object.

## Syntax

```
new PromiseRejectionEvent(type)
new PromiseRejectionEvent(type, { reason, promise, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.reason`**

The rejection reason, any value, optional. When not passed, it is `undefined`.

**`options.promise`**

The rejected Promise, optional. When not passed, [`promise`](promise.md) is `undefined`.

**`options.cancelable`**

A boolean, optional, defaults to `false`.

### Return value

A new `PromiseRejectionEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'PromiseRejectionEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new PromiseRejectionEvent('unhandledrejection', { reason: 'Timed out' });
console.log(event.reason, event.promise);
```

**Result**: The console prints `Timed out undefined`.

## Corresponding iOS API

There is no corresponding system API. It corresponds to the browser's `new PromiseRejectionEvent()`.

## See also

- [`PromiseRejectionEvent`](../promise-rejection-event.md)
