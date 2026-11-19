---
type: reference
native: UIScrollView.directionalPressGestureRecognizer
---

# `UIScrollView`: `directionalPressGestureRecognizer` property

The **`directionalPressGestureRecognizer`** property is the gesture recognizer for arrow key presses. According to Apple's documentation, it is for the tvOS remote.

## Value

A [`UIGestureRecognizer`](../ui-gesture-recognizer.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- This property was added from the iOS headers. The acceptance tests verify that it can be read and has the right type; its effect is **not verified in the simulator**, and the usage follows Apple's documentation.

## Examples

```js
const scroller = new UIScrollView();
console.log(scroller.directionalPressGestureRecognizer === null);
```

**Result**: logs `true` or `false`. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.directionalPressGestureRecognizer`.
