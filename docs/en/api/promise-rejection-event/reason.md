---
type: reference
native: PromiseRejectionEvent.reason
---

# `PromiseRejectionEvent`: `reason` property

The **`reason`** property is the rejection reason.

## Value

Its type is `unknown`. It is usually an `Error` object but can be any value, so check it before using it.

- Read-only. Assigning to it throws `TypeError`.

## Examples

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('Unhandled rejection', String(e.reason));
  e.preventDefault();
});
Promise.reject(new Error('A rejection nobody caught'));
```

**Result**: Prints `Unhandled rejection Error: A rejection nobody caught`.

## See also

- [`promise`](promise.md)
