---
type: reference
native: UINavigationController.barHideOnTapGestureRecognizer
---

# `UINavigationController`: `barHideOnTapGestureRecognizer` property

The **`barHideOnTapGestureRecognizer`** property is the gesture used by [`hidesBarsOnTap`](hidesbarsontap.md). Once `hidesBarsOnTap` is on, this gesture drives hiding and showing the navigation bar.

## Value

A [`UITapGestureRecognizer`](../ui-tap-gesture-recognizer.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- Its type allows `null`; check before using it.

With it, you can set which of it and the other gestures in the view controller takes priority, or temporarily disable it with `isEnabled`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.hidesBarsOnTap = true;
console.log(nav.barHideOnTapGestureRecognizer instanceof UITapGestureRecognizer);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UINavigationController.barHideOnTapGestureRecognizer`.

## See also

- [`hidesBarsOnTap`](hidesbarsontap.md)
- [`UITapGestureRecognizer`](../ui-tap-gesture-recognizer.md)
