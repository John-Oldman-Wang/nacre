---
type: reference
native: UIView.gestureRecognizers
---

# `UIView`: `gestureRecognizers` property

The **`gestureRecognizers`** property is all the gesture recognizers on the view.

## Value

A read-only array of [`UIGestureRecognizer`](../ui-gesture-recognizer.md).

- Read-only; assigning to it throws `TypeError`.
- An empty array when there are none.
- Each read returns a new array containing the same objects.
- Recognizers that the system itself added to the view are included.

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
card.addGestureRecognizer(tap);
console.log(card.gestureRecognizers.includes(tap));
```

**Result**: Prints `true`.

## Corresponding iOS API

`UIView.gestureRecognizers`.

## See also

- [`addGestureRecognizer()`](addgesturerecognizer.md)
