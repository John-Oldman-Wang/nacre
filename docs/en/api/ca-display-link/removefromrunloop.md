---
type: reference
native: "-[CADisplayLink removeFromRunLoop:forMode:]"
---

# `CADisplayLink`: `removeFromRunLoop()` method

The **`removeFromRunLoop()`** method cancels the `CADisplayLink`'s callbacks for one mode.

## Syntax

```
removeFromRunLoop(runLoop[, { forMode }])
```

### Parameters

**`runLoop`**

Must be [`NSRunLoop.mainRunLoop`](../ns-run-loop/mainrunloop.md).

**`options.forMode`**

One of `'default'`, `'common'`, and `'tracking'`; defaults to `'default'`. See [`addToRunLoop()`](addtorunloop.md) for what they mean.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `runLoop` is not `NSRunLoop.mainRunLoop`.
- `forMode` is not recognized: `forMode has no value "idle"; expected one of: …`.

## Description

- Once every `forMode` it was added with has been canceled, it no longer calls back and can be garbage-collected.
- Unlike [`invalidate()`](invalidate.md), you can call `addToRunLoop()` again after canceling. **Not verified in the simulator.**

## Examples

```js
const link = new CADisplayLink();
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
link.removeFromRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Effect**: `tick` no longer fires. **Not verified in the simulator.**

## Corresponding iOS API

`-[CADisplayLink removeFromRunLoop:forMode:]`.

## See also

- [`addToRunLoop()`](addtorunloop.md)
