---
type: reference
native: UINavigationController.barHideOnSwipeGestureRecognizer
---

# `UINavigationController`: `barHideOnSwipeGestureRecognizer` property

The **`barHideOnSwipeGestureRecognizer`** property is the gesture used by [`hidesBarsOnSwipe`](hidesbarsonswipe.md). Once `hidesBarsOnSwipe` is on, this gesture drives hiding and showing the navigation bar.

## Value

A [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- Its type allows `null`; check before using it.

With it, you can set which of it and the other gestures in the view controller takes priority, or temporarily disable it with `isEnabled`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnSwipe = true;
console.log(nav.barHideOnSwipeGestureRecognizer instanceof UIPanGestureRecognizer);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UINavigationController.barHideOnSwipeGestureRecognizer`.

## See also

- [`hidesBarsOnSwipe`](hidesbarsonswipe.md)
- [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md)
