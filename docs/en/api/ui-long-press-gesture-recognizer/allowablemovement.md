---
type: reference
native: UILongPressGestureRecognizer.allowableMovement
---

# `UILongPressGestureRecognizer`: `allowableMovement` property

The **`allowableMovement`** property is how far the finger can move before the long press is recognized.

## Value

A number, in [points (pt)](../units.md).

- Readable and writable.
- The default is `10`.
- If the finger moves farther than this before the gesture is recognized, it doesn't count as a long press and no events fire. After the gesture is recognized, the finger can move any distance, and every move fires [`changed`](../ui-gesture-recognizer/changed-event.md).

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: allowableMovement must be a non-negative number`.
- A value that can't be converted to a number (`undefined`, `'soon'`, `NaN`): throws `TypeError: allowableMovement must be a finite number, got "soon"`.
- Numeric strings are used as numbers: writing `'0.4'` reads back `0.4`.
- On error, the property keeps its previous value.

## Examples

```js
const press = new UILongPressGestureRecognizer();
press.allowableMovement = 30;
```

**Effect**: While the finger is held, it can wobble up to 30 pt and still count as a long press. **Not verified in the simulator.**

## Corresponding iOS API

`UILongPressGestureRecognizer.allowableMovement`.

## See also

- [`minimumPressDuration`](minimumpressduration.md)
