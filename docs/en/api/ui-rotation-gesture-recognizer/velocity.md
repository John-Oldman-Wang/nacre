---
type: reference
native: UIRotationGestureRecognizer.velocity
---

# `UIRotationGestureRecognizer`: `velocity` property

The **`velocity`** property is the rotation velocity.

## Value

A number, in radians per second.

- Read-only; assigning to it throws `TypeError`.
- The default is `0`. It is 0 when no gesture is in progress.

### Observing changes

No separate event fires when it changes. The value during a gesture arrives as the `velocity` of the [`changed`](../ui-gesture-recognizer/changed-event.md) event.

## Examples

```js
const twist = new UIRotationGestureRecognizer();
console.log(twist.velocity);
```

**Result**: Prints `0`.

## Corresponding iOS API

`UIRotationGestureRecognizer.velocity`.

## See also

- [`rotation`](rotation.md)
