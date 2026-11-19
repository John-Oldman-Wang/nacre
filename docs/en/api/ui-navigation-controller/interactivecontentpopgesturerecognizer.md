---
type: reference
native: UINavigationController.interactiveContentPopGestureRecognizer
---

# `UINavigationController`: `interactiveContentPopGestureRecognizer` property

The **`interactiveContentPopGestureRecognizer`** property is another back gesture added in iOS 26: swiping right anywhere in the view controller's content area also goes back to the previous view controller, without starting at the left edge.

## Value

A [`UIGestureRecognizer`](../ui-gesture-recognizer.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object. It and [`interactivePopGestureRecognizer`](interactivepopgesturerecognizer.md) are two different recognizers.
- It has a value only after the navigation controller's view has been created; see [`interactivePopGestureRecognizer`](interactivepopgesturerecognizer.md).
- Its type allows `null`; check before using it.

To turn swipe back off completely, set `isEnabled` to `false` on both recognizers.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
void nav.view;
for (const recognizer of [nav.interactivePopGestureRecognizer, nav.interactiveContentPopGestureRecognizer]) {
  if (recognizer !== null) {
    recognizer.isEnabled = false;
  }
}
```

**Effect**: Neither swiping from the edge nor swiping in the content area goes back to the previous view controller anymore. **Not verified in the simulator.**

## Corresponding iOS API

`UINavigationController.interactiveContentPopGestureRecognizer` (iOS 26 and later).

## See also

- [`interactivePopGestureRecognizer`](interactivepopgesturerecognizer.md)
- [Swipe back](../ui-navigation-controller.md#swipe-back)
