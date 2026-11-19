---
type: reference
web: AbortSignal abort event
---

# `AbortSignal`: `abort` event

The **`abort`** event fires when the signal is aborted.

## Syntax

```
signal.addEventListener('abort', (event) => { })
```

## Event object

`Event`, with only `type` and `target`. Not cancelable.

## When it fires

- When [`controller.abort()`](../abort-controller/abort.md) is called.
- When [`AbortSignal.timeout()`](timeout.md) expires.
- Fires only once. Calling `abort()` again doesn't fire it again.
- A signal returned by [`AbortSignal.abort()`](abort.md) is already aborted when created, so listeners added afterward don't receive this event.

When the event fires, [`aborted`](aborted.md) is already `true` and [`reason`](reason.md) already has a value.

## Examples

```js
const controller = new AbortController();
controller.signal.addEventListener('abort', () => {
  console.log('aborted', controller.signal.aborted);
});
controller.abort();
```

**Result**: Prints `aborted true`.

## Differences from the web

There is no `onabort` property; listen only with `addEventListener()`.

## See also

- [`AbortController`](../abort-controller.md)
