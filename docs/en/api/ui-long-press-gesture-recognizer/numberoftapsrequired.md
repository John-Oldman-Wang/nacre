---
type: reference
native: UILongPressGestureRecognizer.numberOfTapsRequired
---

# `UILongPressGestureRecognizer`: `numberOfTapsRequired` property

The **`numberOfTapsRequired`** property is how many full taps must come before the press.

## Value

A number, in taps.

- Readable and writable.
- The default is `0`: just press and hold. Set it to `1` for "tap once, then press and hold".

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: numberOfTapsRequired must be a non-negative integer`.
- A value that can't be converted to a number (`undefined`, `'abc'`, `NaN`): throws `TypeError: numberOfTapsRequired must be a finite number, got "abc"`.
- The fractional part of a decimal is dropped: writing `2.9` reads back `2`. Numeric strings are used as numbers.
- On error, the property keeps its previous value.

## Examples

```js
const press = new UILongPressGestureRecognizer();
press.numberOfTapsRequired = 1;
```

**Effect**: `began` fires only after one tap followed immediately by a 0.5-second press. **Not verified in the simulator.**

## Corresponding iOS API

`UILongPressGestureRecognizer.numberOfTapsRequired`.

## See also

- [`numberOfTouchesRequired`](numberoftouchesrequired.md)
