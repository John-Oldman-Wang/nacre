---
type: reference
web: AbortSignal.throwIfAborted()
---

# `AbortSignal`: `throwIfAborted()` method

The **`throwIfAborted()`** method throws [`reason`](reason.md) if the signal has been aborted, and does nothing otherwise.

## Syntax

```
throwIfAborted()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

When the signal has been aborted, it throws [`reason`](reason.md) itself, which can be any value.

## Examples

```js
const controller = new AbortController();
controller.signal.throwIfAborted();
controller.abort('stop');
try {
  controller.signal.throwIfAborted();
} catch (err) {
  console.log(err);
}
```

**Result**: The first call does nothing; the second throws `'stop'`, and it prints `stop`.

## Differences from the web

Same as the web.

## See also

- [`aborted`](aborted.md)
