---
type: reference
web: AbortController
---

# `AbortController`

**`AbortController`** represents the side that issues a cancellation. Its [`signal`](abort-controller/signal.md) is handed to [`fetch()`](fetch.md) or [`Request`](request.md), and calling [`abort()`](abort-controller/abort.md) cancels those requests.

One `signal` can be handed to several requests, and a single `abort()` cancels them all. Requests that have already completed are unaffected. Cancellation cannot be undone; to send requests again, create a new `AbortController`.

**Inheritance**: `AbortController` does not inherit from any other class.

For how to cancel requests and set timeouts on them, see the guide [Fetching data from the network](../guides/fetch.md#canceling-a-request).

## Constructor

[`AbortController()`](abort-controller/constructor.md)

Creates a controller and its `signal`.

## Instance properties

| Property | Description |
| --- | --- |
| [`signal`](abort-controller/signal.md) <small>read-only</small> | The corresponding [`AbortSignal`](abort-signal.md) |

## Instance methods

| Method | Description |
| --- | --- |
| [`abort()`](abort-controller/abort.md) | Cancels |

## Examples

```js
const controller = new AbortController();
controller.signal.addEventListener('abort', () => {
  console.log('Aborted');
});
controller.abort();
```

**Result**: Prints `Aborted`.

## Differences from the web

The same as on the web.

## See also

- [`AbortSignal`](abort-signal.md): the cancellation state and reason
- [`fetch()`](fetch.md)
