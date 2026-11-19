---
type: reference
web: AbortSignal
---

# `AbortSignal`

**`AbortSignal`** represents an abort signal: whether it has been aborted and why. Pass it as the `signal` of [`fetch()`](fetch.md), and as soon as it is aborted, the request is canceled.

`AbortSignal` can't be created with `new`: `new AbortSignal()` throws `TypeError: AbortSignal cannot be constructed directly, use new AbortController()`. You get one from these three places:

| Source | What you get |
| --- | --- |
| [`controller.signal`](abort-controller/signal.md) | Controlled by `controller.abort()` |
| [`AbortSignal.timeout()`](abort-signal/timeout.md) | Aborts automatically after the given number of milliseconds |
| [`AbortSignal.abort()`](abort-signal/abort.md) | A signal already in the aborted state |

**Inheritance**: `EventTarget` → `AbortSignal`

## Static methods

[`AbortSignal.abort()`](abort-signal/abort.md)

Returns a signal that is already aborted.

[`AbortSignal.timeout()`](abort-signal/timeout.md)

Returns a signal that aborts automatically after the given time. Use it to set a timeout on a request.

## Instance properties

| Property | Description |
| --- | --- |
| [`aborted`](abort-signal/aborted.md) <small>read-only</small> | Whether it has been aborted |
| [`reason`](abort-signal/reason.md) <small>read-only</small> | The reason for aborting |

## Instance methods

Also inherits `addEventListener()`, `removeEventListener()`, and `dispatchEvent()` from `EventTarget`.

| Method | Description |
| --- | --- |
| [`throwIfAborted()`](abort-signal/throwifaborted.md) | Throws `reason` if aborted |

## Events

| Event | When it fires |
| --- | --- |
| [`abort`](abort-signal/abort-event.md) | Fires once when aborted |

## Examples

```js
async function main() {
  try {
    await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
main();
```

**Result**: After 300 milliseconds the request is canceled, and it prints `AbortError`.

> **Note:** When a request is canceled while in progress, what `fetch()` and `read()` throw isn't `signal.reason` but a new `AbortError`. So after `AbortSignal.timeout()` expires, `signal.reason.name` is `'TimeoutError'`, while the `name` of the exception thrown by `fetch()` is `'AbortError'`. To tell whether a request was canceled, check whether the exception's `name` is `'AbortError'`.

## Differences from the web

- There is no `DOMException`. The default `reason` is an `Error` whose `name` is `'AbortError'`, and the timeout `reason` is an `Error` whose `name` is `'TimeoutError'`.
- When a request is canceled while in progress, `fetch()` throws `AbortError`, not `signal.reason`.
- There is no `AbortSignal.any()` and no `onabort` property.

## See also

- [`AbortController`](abort-controller.md): sends the abort instruction
- [`fetch()`](fetch.md)
