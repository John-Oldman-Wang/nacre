---
type: reference
native: CADisplayLink
status: partial
---

# `CADisplayLink`

**`CADisplayLink`** represents a timer synchronized with screen refreshes. It fires a [`tick`](ca-display-link/tick-event.md) event once for each frame the screen refreshes. Computing and setting the UI for that frame in the callback gives an animation driven entirely by code.

A new `CADisplayLink` doesn't start on its own. It starts firing only after you both listen for `tick` and call [`addToRunLoop()`](ca-display-link/addtorunloop.md) to add it to the main thread's event loop, [`NSRunLoop.mainRunLoop`](ns-run-loop/mainrunloop.md).

**Once added, it keeps running until stopped.** Even if your code doesn't keep a reference to it, it isn't garbage-collected, and the callback keeps running every frame. Always call [`invalidate()`](ca-display-link/invalidate.md) when you no longer need it.

For animations that can be expressed as "from one value to another" or "through a sequence of values", use an [animation object](ca-animation.md): once an animation object is added to a layer, the system computes the intermediate value for each frame without running JS (**this comes from iOS's definition and is not verified in the simulator**). Every frame of a `CADisplayLink` runs a JS callback, and if JS is busy running other code, the callback waits until it finishes: the acceptance tests once measured the first frame arriving 2.07 seconds after `addToRunLoop()`, because JS was running other code the whole time. `CADisplayLink` suits cases that animation objects can't express: positions that depend on live data, your own physics simulation, game logic that needs a decision every frame.

**Inheritance**: `EventTarget` → `NSObject` → `CADisplayLink`

For how to use it for frame-by-frame animation, see the guide [Running code every frame](../guides/frame-callback.md).

## Constructor

[`CADisplayLink()`](ca-display-link/constructor.md)

Creates a `CADisplayLink` that isn't running yet.

## Instance properties

| Property | Description |
| --- | --- |
| [`isPaused`](ca-display-link/ispaused.md) | Whether firing `tick` is paused |
| [`preferredFrameRateRange`](ca-display-link/preferredframeraterange.md) | How many callbacks per second you'd like |
| [`timestamp`](ca-display-link/timestamp.md) <small>read-only</small> | The time of the most recent frame |
| [`duration`](ca-display-link/duration.md) <small>read-only</small> | The interval between two frames |
| [`targetTimestamp`](ca-display-link/targettimestamp.md) <small>read-only</small> | The time the most recent frame's content will be displayed |

## Instance methods

| Method | Description |
| --- | --- |
| [`addToRunLoop()`](ca-display-link/addtorunloop.md) | Starts it |
| [`removeFromRunLoop()`](ca-display-link/removefromrunloop.md) | Cancels callbacks for one mode |
| [`invalidate()`](ca-display-link/invalidate.md) | Stops it for good |

## Events

| Event | When it fires |
| --- | --- |
| [`tick`](ca-display-link/tick-event.md) | Each frame the screen refreshes |

## Examples

```js
const link = new CADisplayLink();

link.addEventListener('tick', (ev) => {
  const frame = ev.frame;
  console.log('Frame time:', frame.timestamp);
});

link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: one line is logged to the console for each frame the screen refreshes.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CADisplayLink displayLinkWithTarget:self selector:@selector(tick:)]` | `new CADisplayLink()`, then `addEventListener('tick', …)` |
| `[link addToRunLoop:NSRunLoop.mainRunLoop forMode:NSRunLoopCommonModes]` | `link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' })` |
| `link.paused = YES` | `link.isPaused = true` |
| `link.preferredFrameRateRange = CAFrameRateRangeMake(30, 60, 30)` | `link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30)` |

## See also

- [Running code every frame](../guides/frame-callback.md)
- [`NSRunLoop`](ns-run-loop.md): the first argument of `addToRunLoop()`
- [Structs](structs.md): `CAFrameRateRange`
- [How the runtime works](how-it-works.md): when callbacks run
