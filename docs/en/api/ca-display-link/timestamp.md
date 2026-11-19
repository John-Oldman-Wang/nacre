---
type: reference
native: CADisplayLink.timestamp
---

# `CADisplayLink`: `timestamp` property

The **`timestamp`** property is the time of the most recent frame.

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`.
- `0` before it starts.
- Its origin differs from that of `Date.now()`. Only subtract it from the other two times; don't mix it with `Date.now()`.
- It changes every frame and has no separate change event. By the time the callback runs, this property may already hold the next frame's value; in the callback, use `frame.timestamp` from the [`tick`](tick-event.md) event object.


## Examples

```js
const link = new CADisplayLink();
link.addEventListener('tick', () => {
  console.log(link.timestamp);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: logs the time of the most recent frame once per frame.

## Corresponding iOS API

`CADisplayLink.timestamp` (`CFTimeInterval`).

## See also

- [`tick`](tick-event.md): the field of the same name on the event object
