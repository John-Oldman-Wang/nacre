---
type: reference
native: UINavigationController.interactivePopGestureRecognizer
---

# `UINavigationController`: `interactivePopGestureRecognizer` property

The **`interactivePopGestureRecognizer`** property is the gesture used for swipe back: the finger swipes right from the left edge, the top view controller moves away with the finger, and releasing goes back to the previous view controller. See [Swipe back](../ui-navigation-controller.md#swipe-back).

## Value

A [`UIGestureRecognizer`](../ui-gesture-recognizer.md), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- It is attached to the navigation controller's own view: its `view` is the navigation controller's [`view`](../ui-view-controller/view.md).
- It has a value only after the navigation controller's view has been created. Reading the navigation controller's `view` once creates the view; once the navigation controller is on screen, it always has a value.
- Its type allows `null`; check before using it.

It is an ordinary recognizer, and all members of [`UIGestureRecognizer`](../ui-gesture-recognizer.md) work on it. The most used is `isEnabled`: setting it to `false` turns swipe back off, and setting it back to `true` restores it. The default is `true`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
void nav.view;
const swipeBack = nav.interactivePopGestureRecognizer;
if (swipeBack !== null) {
  swipeBack.isEnabled = false;
}
```

**Effect**: Swiping from the left no longer goes back to the previous view controller; tapping the back button on the navigation bar still does. `isEnabled` reads back `false`; **that swiping has no effect is not verified in the simulator.** For operations in progress that shouldn't be interrupted, such as submitting an order, turn it off at the start and back on at the end.

## Corresponding iOS API

`UINavigationController.interactivePopGestureRecognizer`.

## See also

- [`interactiveContentPopGestureRecognizer`](interactivecontentpopgesturerecognizer.md): swiping right anywhere in the content area to go back
- [Swipe back](../ui-navigation-controller.md#swipe-back)
- [`UIGestureRecognizer`](../ui-gesture-recognizer.md)
