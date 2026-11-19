---
type: reference
web: AbortSignal.reason
---

# `AbortSignal`: `reason` property

The **`reason`** property is the reason for aborting.

## Value

Any value.

- Read-only; assigning to it throws `TypeError`.
- `undefined` before aborting.
- When a reason was given with [`controller.abort(reason)`](../abort-controller/abort.md) or [`AbortSignal.abort(reason)`](abort.md), it is that value.
- When no reason was given, it is an `Error` whose `name` is `'AbortError'` and whose `message` is `The operation was aborted`.
- When [`AbortSignal.timeout()`](timeout.md) expires, it is an `Error` whose `name` is `'TimeoutError'` and whose `message` is `The operation timed out`.
- On aborting, the [`abort`](abort-event.md) event fires, and it doesn't change afterward.

## Examples

```js
const controller = new AbortController();
controller.abort();
const reason = controller.signal.reason;
console.log(reason instanceof Error ? reason.name : reason);
```

**Result**: Prints `AbortError`.

## Differences from the web

The default reason is an `Error`, not a `DOMException`.

## See also

- [`throwIfAborted()`](throwifaborted.md)
