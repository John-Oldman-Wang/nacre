---
type: reference
native: PromiseRejectionEvent.promise
---

# `PromiseRejectionEvent`: `promise` property

The **`promise`** property is the Promise that was rejected.

## Value

A `Promise`, or `undefined`.

- Read-only. Assigning to it throws `TypeError`.
- Always has a value in events fired by the runtime; `undefined` when you construct the event yourself without passing it.

## Examples

```js
const rejected = Promise.reject(new Error('Nobody caught this'));
application.addEventListener('unhandledrejection', (e) => {
  console.log(e.promise === rejected);
  e.preventDefault();
});
```

**Result**: Prints `true`. **Not verified in the simulator.**

## See also

- [`reason`](reason.md)
