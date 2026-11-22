---
type: reference
web: AbortController.abort()
---

# `AbortController`: `abort()` method

The **`abort()`** method aborts the [`signal`](signal.md), and every request that was given this `signal` is canceled.

## Syntax

```
abort()
abort(reason)
```

### Parameters

**`reason`**

The reason for cancellation, any value; optional. It becomes [`signal.reason`](../abort-signal/reason.md). When omitted, `signal.reason` is a [`DOMException`](../dom-exception.md) whose `name` is `'AbortError'`, whose `code` is 20, and whose `message` is `The operation was aborted`.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- When called, `signal` fires the [`abort`](../abort-signal/abort-event.md) event once.
- Calling it again has no effect: the `abort` event does not fire again, and `reason` does not change.
- Cancellation cannot be undone.
- When a request is canceled while in progress, `fetch()` and `read()` throw not `reason` but a new `AbortError`.

## Examples

```js
const controller = new AbortController();
controller.abort('The user left the page');
controller.abort('Second time');
console.log(controller.signal.aborted, controller.signal.reason);
```

**Result**: Prints `true The user left the page`. The second call has no effect.

## Differences from the web

- When a request is canceled while in progress, `fetch()` throws a new `AbortError`, not `reason`.

## See also

- [`AbortSignal`](../abort-signal.md)
