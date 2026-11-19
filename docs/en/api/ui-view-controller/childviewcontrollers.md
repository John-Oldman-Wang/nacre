---
type: reference
native: UIViewController.childViewControllers
---

# `UIViewController`: `childViewControllers` property

The **`childViewControllers`** property is this view controller's child view controllers, in the order they were added.

## Value

An array of `UIViewController`.

- Read-only; assigning to it throws `TypeError`. Add with [`addChildViewController()`](addchildviewcontroller.md); remove with [`removeFromParentViewController()`](removefromparentviewcontroller.md).
- The default is an empty array.
- The view controllers managed by a navigation controller or tab bar controller are also in that controller's array.
- Each element read is the same object that was added and can be compared with `===`.
- No event fires when the parent-child relationships change: only the app's own code changes them.

## Examples

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

console.log(page.childViewControllers.length);
console.log(page.childViewControllers[0] === panel);
```

**Result**: The console prints `1` and `true`.

## Corresponding iOS API

`UIViewController.childViewControllers`.

## See also

- [Parent and child view controllers](../ui-view-controller.md#parent-and-child-view-controllers)
