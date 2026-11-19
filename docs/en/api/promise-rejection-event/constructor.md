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

The rejection reason, any value, optional.

**`options.promise`**

The rejected Promise, optional. When not passed, [`promise`](promise.md) is `undefined`.

**`options.cancelable`**

A boolean, optional, defaults to `false`.

### Return value

A new `PromiseRejectionEvent`.

### Exceptions

Throws `TypeError` when no event name is passed, the same as [`Event()`](../event/constructor.md). **Not verified in the simulator.**

## Examples

```js
const event = new PromiseRejectionEvent('unhandledrejection', { reason: 'Timed out' });
console.log(event.reason, event.promise);
```

**Result**: The console prints `Timed out undefined`. **Not verified in the simulator.**

## Corresponding iOS API

There is no corresponding system API. It corresponds to the browser's `new PromiseRejectionEvent()`.

## See also

- [`PromiseRejectionEvent`](../promise-rejection-event.md)
