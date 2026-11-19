---
type: reference
native: "-[CADisplayLink addToRunLoop:forMode:]"
---

# `CADisplayLink`: `addToRunLoop()` method

The **`addToRunLoop()`** method adds the `CADisplayLink` to the event loop and starts it.

## Syntax

```
addToRunLoop(runLoop[, { forMode }])
```

### Parameters

**`runLoop`**

Must be [`NSRunLoop.mainRunLoop`](../ns-run-loop/mainrunloop.md).

**`options.forMode`**

A string that determines whether callbacks continue while the user drags a scroll view. Defaults to `'default'`.

| `forMode` | Effect |
| --- | --- |
| `'common'` | Always calls back. **Usually use this** |
| `'default'` | Calls back normally, pauses while the user drags a scroll view |
| `'tracking'` | Calls back only while the user drags a scroll view |

The differences among the three values during scrolling come from iOS's definition and are **not verified in the simulator**. The acceptance tests only use `'common'`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `runLoop` is not `NSRunLoop.mainRunLoop`: `addToRunLoop expects an NSRunLoop`. Type checking can't catch this error; only the runtime throws it.
- `forMode` is not recognized: `forMode has no value "idle"; expected one of: …`, followed by all valid values.

## Description

- Calling `addToRunLoop()` without listening for `tick` runs the callback zero times.
- You can call it several times with different `forMode` values.
- Once added, it isn't garbage-collected even if your code doesn't keep a reference to it, and it keeps running until [`invalidate()`](invalidate.md), or until every `forMode` it was added with has been canceled with [`removeFromRunLoop()`](removefromrunloop.md).

## Examples

```js
const link = new CADisplayLink();
link.addEventListener('tick', () => {
  console.log('tick');
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: one `tick` line is logged to the console for each frame the screen refreshes.

## Corresponding iOS API

`-[CADisplayLink addToRunLoop:forMode:]`. `NSRunLoopCommonModes` is written `'common'`, `NSDefaultRunLoopMode` is written `'default'`, and `UITrackingRunLoopMode` is written `'tracking'`.

## See also

- [`removeFromRunLoop()`](removefromrunloop.md)
- [`invalidate()`](invalidate.md)
