---
type: reference
native: UILongPressGestureRecognizer.numberOfTouchesRequired
---

# `UILongPressGestureRecognizer`: `numberOfTouchesRequired` property

The **`numberOfTouchesRequired`** property is how many fingers must be held down together.

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
const press = new UILongPressGestureRecognizer();
press.numberOfTouchesRequired = 2;
console.log(press.numberOfTouchesRequired);
```

**Effect**: Prints `2`. Once the recognizer is added to a view, the gesture is recognized only when two fingers are held down together. **Not verified in the simulator.**

## Corresponding iOS API

`UILongPressGestureRecognizer.numberOfTouchesRequired`.

## See also

- [`numberOfTapsRequired`](numberoftapsrequired.md)
