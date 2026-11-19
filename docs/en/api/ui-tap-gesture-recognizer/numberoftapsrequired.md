---
type: reference
native: UITapGestureRecognizer.numberOfTapsRequired
---

# `UITapGestureRecognizer`: `numberOfTapsRequired` property

The **`numberOfTapsRequired`** property is how many taps are needed to count as one tap.

## Value

A number, counting taps.

- Readable and writable.
- The default is `1`. Set it to `2` for a double tap.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: numberOfTapsRequired must be a non-negative integer`.
- A value that cannot be converted to a number (`undefined`, `'abc'`, `NaN`): throws `TypeError: numberOfTapsRequired must be a finite number, got "abc"`.
- The fractional part is dropped: writing `2.9` reads back `2`. Numeric strings are used as numbers.
- On error, the property keeps its previous value.

## Examples

```js
const card = new UIView();
const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
doubleTap.addEventListener('ended', () => {
  console.log('Double tap');
});
card.addGestureRecognizer(doubleTap);
```

**Effect**: Tapping `card` twice quickly prints `Double tap`. **Not verified in the simulator.**

## Corresponding iOS API

`UITapGestureRecognizer.numberOfTapsRequired`.

## See also

- [`requireGestureRecognizerToFail()`](../ui-gesture-recognizer/requiregesturerecognizertofail.md): making a single tap wait for a double tap to fail
