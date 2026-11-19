---
type: reference
web: Request.signal
---

# `Request`: `signal` property

The **`signal`** property is the [`AbortSignal`](../abort-signal.md) used to cancel this request.

## Value

An [`AbortSignal`](../abort-signal.md).

- Read-only; assigning to it throws `TypeError`.
- When a `signal` was given at construction, it's that very object.
- When none was given, it's an `AbortSignal` that's never aborted, and every read returns the same object.
- After this `Request` is passed to `fetch()`, aborting `signal` cancels the request.

## Examples

```js
const controller = new AbortController();
const req = new Request('https://httpbin.org/get', { signal: controller.signal });
console.log(req.signal === controller.signal);
```

**Result**: Prints `true`.

## Differences from the web

On the web, `req.signal` is a separately created object that follows the signal given at construction, so `req.signal === controller.signal` is `false`. In Nacre it's the very signal given at construction, so it's `true`.

## See also

- [`AbortController`](../abort-controller.md)
