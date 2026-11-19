---
type: reference
native: CADisplayLink.targetTimestamp
---

# `CADisplayLink`: `targetTimestamp` property

The **`targetTimestamp`** property is the time the most recent frame's content will be displayed on screen, later than [`timestamp`](timestamp.md).

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`.
- Its value before it starts is **not verified in the simulator**.
- Its origin differs from that of `Date.now()`. Only subtract it from the other two times; don't mix it with `Date.now()`.
- It changes every frame and has no separate change event. By the time the callback runs, this property may already hold the next frame's value; in the callback, use `frame.targetTimestamp` from the [`tick`](tick-event.md) event object.
- Use it when predicting where something will be in the next frame based on time.

## Examples

```js
const link = new CADisplayLink();
link.addEventListener('tick', () => {
  console.log(link.targetTimestamp);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: logs the time this frame's content will be displayed, once per frame.

## Corresponding iOS API

`CADisplayLink.targetTimestamp` (`CFTimeInterval`).

## See also

- [`tick`](tick-event.md): the field of the same name on the event object
