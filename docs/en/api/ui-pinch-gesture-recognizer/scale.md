---
type: reference
native: UIPinchGestureRecognizer.scale
---

# `UIPinchGestureRecognizer`: `scale` property

The **`scale`** property is the distance between the two fingers as a multiple of the distance when the gesture began.

## Value

A number with no unit; it is a multiple.

- Readable and writable.
- Defaults to `1`. Greater than 1 means spreading; less than 1 means pinching. Every gesture starts at 1.
- There is no range: 0 and negative numbers can be written and are read back unchanged.
- If you write it during a gesture, later calculation continues from the written value.
- Reading it in a callback gives the value at the moment the callback runs. The multiple at the moment the event occurred is on the event object's `scale`.

### Observing changes

No separate event fires when it changes. During a gesture the system updates it, and the new value arrives with the [`changed`](../ui-gesture-recognizer/changed-event.md) event.

### Invalid values

- A value that cannot be converted to a number (`undefined`, `'soon'`, `NaN`) throws `TypeError: scale must be a finite number, got "soon"`.
- A numeric string is used as a number: writing `'0.4'` reads back `0.4`.
- On error, the property keeps its previous value.

## Examples

```js
const pinch = new UIPinchGestureRecognizer();
pinch.scale = 2;
console.log(pinch.scale);
```

**Result**: logs `2`.

## Corresponding iOS API

`UIPinchGestureRecognizer.scale`.

## See also

- [`velocity`](velocity.md)
- [`changed`](../ui-gesture-recognizer/changed-event.md): `scale` on the event object
