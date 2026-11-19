---
type: reference
native: "-[CADisplayLink invalidate]"
---

# `CADisplayLink`: `invalidate()` method

The **`invalidate()`** method stops the `CADisplayLink` for good. It no longer fires `tick` and can't be started again.

## Syntax

```
invalidate()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- To use it again after stopping, create a new one.
- To stop only temporarily, use [`isPaused`](ispaused.md).
- Callbacks don't run synchronously at the moment the screen refreshes; see [How the runtime works](../how-it-works.md). So after stopping, a callback that was already dispatched but hasn't run yet still runs. If the callback depends on the link being stopped, check that yourself.

## Examples

```js
const link = new CADisplayLink();
let count = 0;
link.addEventListener('tick', () => {
  count += 1;
  if (count === 60) link.invalidate();
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Effect**: stops after the callback runs 60 times. A callback dispatched before stopping may still run one more time.

## Corresponding iOS API

`-[CADisplayLink invalidate]`.

## See also

- [`isPaused`](ispaused.md): pausing
