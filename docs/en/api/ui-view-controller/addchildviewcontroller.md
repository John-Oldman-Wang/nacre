---
type: reference
native: "-[UIViewController addChildViewController:]"
---

# `UIViewController`: `addChildViewController()` method

The **`addChildViewController()`** method adds a view controller as a child of this view controller. It only sets up the parent-child relationship; it does not touch the views.

## Syntax

```
addChildViewController(child)
```

### Parameters

**`child`**

A `UIViewController`. If it already has a parent, it is first removed from that parent.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The argument is not a view controller: `addChildViewController needs a UIViewController`.
- Adding a view controller as a child of itself, or adding one of its ancestors as its child: `addChildViewController: a view controller cannot be added as a child of itself or of one of its own descendants`. The existing relationships stay unchanged.

## Description

Adding a child fully takes three lines, in a fixed order:

1. `parent.addChildViewController(child)`: sets up the parent-child relationship. This line automatically calls `child.willMoveToParentViewController(parent)`.
2. `parent.view.addSubview(child.view)`: puts its view in place.
3. `child.didMoveToParentViewController(parent)`: tells it that it is in place.

If you only do line 2, the screen looks the same, but `child` does not know whom it belongs to: its `parentViewController` is `null`, and the parent does not keep it. When no variable holds `child`, the view controller object is collected while its view stays on screen. So write all three lines. **The consequences of doing only line 2 are not verified in the simulator.**

After adding, the parent keeps the child; you do not need to store the `child` variable separately.

## Examples

```js
const page = new UIViewController();
const panel = new UIViewController();
panel.view.backgroundColor = 'systemTeal';

page.addChildViewController(panel);
panel.view.frame = new CGRect(20, 120, 280, 160);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

console.log(page.childViewControllers.length);
console.log(panel.parentViewController === page);
```

**Effect**: A teal rectangle 280 pt wide and 160 pt tall appears on `page`. The console prints `1` and `true`.

## Corresponding iOS API

`-[UIViewController addChildViewController:]`. Native code does not check for cycles and crashes later; here it throws `TypeError` immediately.

## See also

- [`removeFromParentViewController()`](removefromparentviewcontroller.md)
- [`didMoveToParentViewController()`](didmovetoparentviewcontroller.md)
- [Parent and child view controllers](../ui-view-controller.md#parent-and-child-view-controllers)
