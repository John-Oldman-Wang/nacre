---
type: reference
native: window unhandledrejection event
---

# `Application`: `unhandledrejection` event

The **`unhandledrejection`** event fires when a Promise is rejected and still has no handler attached by the time it's reported. The runtime dispatches it itself.

## Syntax

```
application.addEventListener('unhandledrejection', (event) => { })
```

## Event object

[`PromiseRejectionEvent`](../promise-rejection-event.md):

| Field | Type | Meaning |
| --- | --- | --- |
| `reason` | `unknown` | The rejection reason |
| `promise` | `Promise` | The Promise that was rejected |

`target` is `application`. `cancelable` is `true`: calling `preventDefault()` stops the runtime from printing the default error log.

## When it fires

- When a `Promise` is rejected with no handler attached. Exceptions thrown in `async` functions fall into this category.
- It doesn't fire at the moment of rejection. The runtime queues the report at the end of the task queue, so attaching a handler with `setTimeout(fn, 0)` after the rejection is still in time and the rejection isn't reported. See [Timers](../timers.md).
- Attaching a handler after the report doesn't produce a correction: there's no `rejectionhandled` event.
- When no listener calls `preventDefault()`, the runtime prints an error-level log starting with `Uncaught (in promise)`, followed by the rejection reason.

## Examples

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('Unhandled rejection', String(e.reason));
  e.preventDefault();
});

Promise.reject(new Error('Nobody handles this rejection'));
```

**Result**

- The console prints `Unhandled rejection Error: Nobody handles this rejection`.
- Because `preventDefault()` was called, the runtime doesn't print the default log.

## Corresponding iOS API

There's no corresponding system API. Corresponds to the browser's `unhandledrejection` event on `window`.

## See also

- [Handling errors in one place](../../guides/handle-errors.md)
- [`error`](error-event.md)
