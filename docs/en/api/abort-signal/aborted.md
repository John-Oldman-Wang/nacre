---
type: reference
web: AbortSignal.aborted
---

# `AbortSignal`: `aborted` property

The **`aborted`** property indicates whether this signal has been aborted.

## Value

A boolean.

- `true`: already aborted.
- `false`: not aborted yet.
- Read-only; assigning to it throws `TypeError`.
- When it changes from `false` to `true`, the [`abort`](abort-event.md) event fires. Once `true`, it never changes back.

## Examples

```js
const controller = new AbortController();
console.log(controller.signal.aborted);
controller.abort();
console.log(controller.signal.aborted);
```

**Result**: Prints `false` and `true`.

## Differences from the web

Same as the web.

## See also

- [`reason`](reason.md)
