---
type: reference
native: UIPinchGestureRecognizer.velocity
---

# `UIPinchGestureRecognizer`: `velocity` property

The **`velocity`** property is how much `scale` changes per second.

## Value

A number, in multiples per second.

- Read-only. Assigning to it throws `TypeError`.
- Defaults to `0`. It is 0 when no gesture is in progress.

### Observing changes

No separate event fires when it changes. During a gesture its value arrives as `velocity` on the [`changed`](../ui-gesture-recognizer/changed-event.md) event.

## Examples

```js
const pinch = new UIPinchGestureRecognizer();
console.log(pinch.velocity);
```

**Result**: logs `0`.

## Corresponding iOS API

`UIPinchGestureRecognizer.velocity`.

## See also

- [`scale`](scale.md)
