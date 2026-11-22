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

Creates a rejection event object. The runtime creates one itself when it fires `unhandledrejection`; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits properties from [`Event`](event.md). The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`reason`](promise-rejection-event/reason.md) <small>read-only</small> | The rejection reason |
| [`promise`](promise-rejection-event/promise.md) <small>read-only</small> | The Promise that was rejected |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`application`](application.md) | [`unhandledrejection`](application/unhandledrejection-event.md) |

It can be canceled: `cancelable` is `true`, and calling `preventDefault()` stops the runtime from printing its default error log.

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
