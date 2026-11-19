---
type: reference
native: UIRotationGestureRecognizer.rotation
---

# `UIRotationGestureRecognizer`: `rotation` property

The **`rotation`** property is the angle turned since the start of the gesture.

## Value

A number, in **radians**.

- Readable and writable.
- The default is `0`. Each gesture starts from 0.
- It can be negative, and does not wrap around past a full turn: writing `-7` reads back `-7`.
- If written during a gesture, calculation continues from the written value.
- Whether a positive value means clockwise or counterclockwise is **not verified in the simulator**.
- A callback reads the value as of the moment the callback runs. The angle at the moment the event occurred is in the event object's `rotation`.

### Observing changes

No separate event fires when it changes. During a gesture the system updates it, and the new value arrives with the [`changed`](../ui-gesture-recognizer/changed-event.md) event.

### Invalid values

- A value that cannot be converted to a number (`undefined`, `'soon'`, `NaN`) throws `TypeError: rotation must be a finite number, got "soon"`.
- Numeric strings are used as numbers: writing `'0.4'` reads back `0.4`.
- On error the property keeps its previous value.

## Examples

```js
const twist = new UIRotationGestureRecognizer();
twist.rotation = -7;
console.log(twist.rotation);
```

**Result**: Prints `-7`.

## Corresponding iOS API

`UIRotationGestureRecognizer.rotation`.

## See also

- [`velocity`](velocity.md)
- [`changed`](../ui-gesture-recognizer/changed-event.md): `rotation` on the event object
