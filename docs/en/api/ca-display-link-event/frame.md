---
type: reference
native: CADisplayLinkEvent.frame
---

# `CADisplayLinkEvent`: `frame` property

The **`frame`** property is three times for this frame.

## Value

An object whose three fields are numbers, all in **seconds**:

- Read-only. Assigning to it throws `TypeError`.
- `timestamp`: the time of this frame.
- `duration`: the interval between two frames.
- `targetTimestamp`: the time this frame's content will be shown on screen, later than `timestamp`. Use it when computing positions from time.
- These three times are only good for taking differences between them. Their origin differs from `Date.now()`, so don't mix them.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const link = new CADisplayLink();
let first = 0;
link.addEventListener('tick', (e) => {
  if (first === 0) first = e.frame.targetTimestamp;
  console.log('过了', (e.frame.targetTimestamp - first).toFixed(3), '秒');
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Effect**: each frame prints how many seconds have passed since the first frame.

## Corresponding iOS API

`timestamp`, `duration`, and `targetTimestamp` of `CADisplayLink`.

## See also

- [`CADisplayLinkEvent`](../ca-display-link-event.md)
