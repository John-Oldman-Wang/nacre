---
type: reference
native: UISwipeGestureRecognizer.numberOfTouchesRequired
---

# `UISwipeGestureRecognizer`: `numberOfTouchesRequired` property

The **`numberOfTouchesRequired`** property is how many fingers must swipe together.

## Value

A number, in fingers.

- Readable and writable.
- The default is `1`.

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- A negative number: throws `TypeError: numberOfTouchesRequired must be a non-negative integer`.
- A value that can't be converted to a number (`undefined`, `'abc'`, `NaN`): throws `TypeError: numberOfTouchesRequired must be a finite number, got "abc"`.
- The fractional part of a decimal is dropped: writing `2.9` reads back `2`. Numeric strings are used as numbers.
- On error, the property keeps its previous value.

## Examples

```js
const swipe = new UISwipeGestureRecognizer();
swipe.numberOfTouchesRequired = 2;
console.log(swipe.numberOfTouchesRequired);
```

**Effect**: Prints `2`. Once the recognizer is added to a view, the gesture is recognized only when two fingers swipe together. **Not verified in the simulator.**

## Corresponding iOS API

`UISwipeGestureRecognizer.numberOfTouchesRequired`.

## See also

- [`direction`](direction.md)
