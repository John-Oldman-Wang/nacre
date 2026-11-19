---
type: reference
native: UILongPressGestureRecognizer.minimumPressDuration
---

# `UILongPressGestureRecognizer`: `minimumPressDuration` property

The **`minimumPressDuration`** property is how long the finger must be held for the gesture to count as a long press.

## Value

A number, in **seconds**, not milliseconds.

- Readable and writable.
- The default is `0.5`.
- [`began`](../ui-gesture-recognizer/began-event.md) fires once the finger has been held this long.
- Set to `0`: `began` fires as soon as the finger touches down, `changed` fires as it moves, and `ended` fires when it lifts. Use this for effects like "dim when the finger is down, restore when it lifts". A tap recognizer can't do this, because it waits until the finger lifts before firing. **Not verified in the simulator.**

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: minimumPressDuration must be a non-negative number`.
- A value that can't be converted to a number (`undefined`, `'soon'`, `NaN`): throws `TypeError: minimumPressDuration must be a finite number, got "soon"`.
- Numeric strings are used as numbers: writing `'0.4'` reads back `0.4`.
- On error, the property keeps its previous value.

## Examples

```js
const press = new UILongPressGestureRecognizer();
press.minimumPressDuration = 1;
```

**Effect**: The finger must be held for 1 second before `began` fires. **Not verified in the simulator.**

```js
const touch = new UILongPressGestureRecognizer();
touch.minimumPressDuration = 0;
```

**Effect**: `began` fires as soon as the finger touches down. **Not verified in the simulator.**

See [Dimming while the finger is down](../../guides/gestures.md#dimming-while-the-finger-is-down) in the guide.

## Corresponding iOS API

`UILongPressGestureRecognizer.minimumPressDuration`.

## See also

- [`allowableMovement`](allowablemovement.md)
