---
type: reference
native: PromiseRejectionEvent
status: partial
---

# `PromiseRejectionEvent`

**`PromiseRejectionEvent`** represents a Promise rejection that wasn't handled. It is the event object of the [`unhandledrejection`](application/unhandledrejection-event.md) event on [`application`](application.md), carrying the rejection reason and the rejected Promise.

**Inheritance**: [`Event`](event.md) → `PromiseRejectionEvent`

## Constructor

[`PromiseRejectionEvent()`](promise-rejection-event/constructor.md)

Creates a rejection event object. The runtime creates it itself when firing `unhandledrejection`; app code generally doesn't need it.

## Instance properties

Also inherits properties from [`Event`](event.md). For the `unhandledrejection` event fired by the runtime, `cancelable` is `true`.

| Property | Description |
| --- | --- |
| [`reason`](promise-rejection-event/reason.md) <small>read-only</small> | The rejection reason |
| [`promise`](promise-rejection-event/promise.md) <small>read-only</small> | The Promise that was rejected |

## Examples

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log(e instanceof PromiseRejectionEvent, String(e.reason));
  e.preventDefault();
});
Promise.reject(new Error('Nobody caught this'));
```

**Result**: Prints `true Error: Nobody caught this`.

## Comparison with the browser

| Browser | Nacre |
| --- | --- |
| `rejectionhandled` event | None |

## See also

- [`unhandledrejection`](application/unhandledrejection-event.md)
- [Handling errors in one place](../guides/handle-errors.md)
