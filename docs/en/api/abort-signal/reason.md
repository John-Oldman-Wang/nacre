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
- When no reason was given, it is a [`DOMException`](../dom-exception.md) whose `name` is `'AbortError'`, whose `code` is 20, and whose `message` is `The operation was aborted`.
- When [`AbortSignal.timeout()`](timeout.md) expires, it is a `DOMException` whose `name` is `'TimeoutError'`, whose `code` is 23, and whose `message` is `The operation timed out` (measured).
- On aborting, the [`abort`](abort-event.md) event fires, and it doesn't change afterward.

## Examples

```js
const controller = new AbortController();
controller.abort();
const reason = controller.signal.reason;
console.log(reason instanceof DOMException ? reason.name + ' ' + reason.code : reason);
```

**Result**: Prints `AbortError 20`.

## Differences from the web

Same as the web.

## See also

- [`throwIfAborted()`](throwifaborted.md)
