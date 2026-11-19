---
type: reference
---

# `queueMicrotask()` global function

The **`queueMicrotask()`** global function schedules a callback to run right after the current piece of code ends, before any timer and before the interface refreshes. Its timing is the same as `Promise.resolve().then(callback)`.

## Syntax

```
queueMicrotask(callback)
```

### Parameters

**`callback`**

The function to run, called with no arguments.

### Return value

None (`undefined`). A scheduled callback can't be canceled.

### Exceptions

**`TypeError`**

`callback` isn't a function: `queueMicrotask: the argument must be a function`.

## Description

- Exceptions thrown in `callback` are reported by the `unhandledrejection` event on [`application`](../application.md), not the `error` event.
- If `callback` keeps calling `queueMicrotask()` again, those callbacks run one after another with no chance for the interface to refresh in between. When you need to yield, use [`setTimeout(fn, 0)`](settimeout.md).

## Examples

```js
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('sync');
```

**Result**: Prints `sync`, `Promise`, `queueMicrotask`, `setTimeout`, in that order.

## Differences from the web

Exceptions thrown in the callback: browsers report them through the `error` event; here they are reported through the `unhandledrejection` event. Otherwise the same as the web.

## See also

- [The order callbacks run in](../timers.md#the-order-callbacks-run-in)
