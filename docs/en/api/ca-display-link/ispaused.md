---
type: reference
native: CADisplayLink.paused
---

# `CADisplayLink`: `isPaused` property

The **`isPaused`** property determines whether the `CADisplayLink` pauses firing `tick`.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Pauses firing `tick`. It stays in the event loop; setting it back to `false` resumes |
| `false` | Fires normally |

- Readable and writable.
- Defaults to `false`.
- Writes are converted with `Boolean()` and never fail.
- After pausing, a callback that was already dispatched but hasn't run yet still runs.

## Examples

```js
const link = new CADisplayLink();
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
link.isPaused = true;
```

**Effect**: after pausing, `tick` no longer fires.

## Corresponding iOS API

`CADisplayLink.paused`.

## See also

- [`invalidate()`](invalidate.md): stopping for good
