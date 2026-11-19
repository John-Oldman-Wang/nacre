---
type: reference
native: "+[CADisplayLink displayLinkWithTarget:selector:]"
---

# `CADisplayLink`: `tick` event

The **`tick`** event fires once for each frame the screen refreshes.

## Syntax

```
link.addEventListener('tick', (event) => { })
```

## Event object

A `CADisplayLinkEvent`. Besides `type` and `target`, it carries one field:

**`frame`**

Three times for this frame, all in **seconds**:

| Field | Meaning |
| --- | --- |
| `timestamp` | The time of this frame |
| `duration` | The interval between two frames |
| `targetTimestamp` | The time this frame's content will be displayed on screen, later than `timestamp` |

These three times are only good for subtracting from each other. Their origin differs from that of `Date.now()`, so don't mix them.

The callback parameter is declared as a plain `Event`. To read `frame`, cast it to `CADisplayLinkEvent` first, as in the example below.

Not cancelable.

## When it fires

- Once you have listened for `tick` and called [`addToRunLoop()`](addtorunloop.md), it fires once for each frame the screen refreshes. If either step is missing, it doesn't fire.
- It doesn't fire while [`isPaused`](ispaused.md) is `true`, or after [`invalidate()`](invalidate.md).
- Callbacks don't run synchronously at the moment the screen refreshes; see [How the runtime works](../how-it-works.md). If JS is busy running other code, the callback waits until it finishes.
- In the type definitions, `addEventListener()` only accepts `'tick'`. At runtime, listening for another name doesn't throw: it is treated as a custom event and only fires when you dispatch it yourself with `dispatchEvent()`.

## Examples

```js
const link = new CADisplayLink();
const speed = 120;       // pt per second
let last = 0;
let x = 0;

link.addEventListener('tick', (ev) => {
  const frame = /** @type {CADisplayLinkEvent} */ (ev).frame;
  const dt = last === 0 ? 0 : frame.timestamp - last;   // seconds since the previous callback
  last = frame.timestamp;
  x += speed * dt;
  console.log(x);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: `x` increases by 120 per second, regardless of how many frames per second the screen refreshes.

## Corresponding iOS API

The method named by the selector in `+[CADisplayLink displayLinkWithTarget:selector:]`. Instead of a target and selector, listen for `tick` directly; `link.timestamp` and the like from the ObjC callback argument become `frame` on the event object.

## See also

- [Computing position from time, not frame count](../../guides/frame-callback.md#computing-positions-from-time-not-frame-counts)
