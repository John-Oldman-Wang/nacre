---
type: reference
native: UIViewController.parentViewController
---

# `UIViewController`: `parentViewController` property

The **`parentViewController`** property is the parent view controller that contains this view controller.

## Value

A `UIViewController`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- The default is `null`.
- When the view controller is on a navigation stack, it is that navigation controller.
- Changed by [`addChildViewController()`](addchildviewcontroller.md) and [`removeFromParentViewController()`](removefromparentviewcontroller.md), and also when the view controller is pushed onto or popped off a navigation stack.
- No event fires when the parent-child relationships change: only the app's own code changes them.

## Examples

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
panel.didMoveToParentViewController(page);
console.log(panel.parentViewController === page);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`UIViewController.parentViewController`.

## See also

- [Parent and child view controllers](../ui-view-controller.md#parent-and-child-view-controllers)
- [`childViewControllers`](childviewcontrollers.md)
