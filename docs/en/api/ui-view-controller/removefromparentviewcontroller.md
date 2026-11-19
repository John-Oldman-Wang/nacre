---
type: reference
native: "-[UIViewController removeFromParentViewController]"
---

# `UIViewController`: `removeFromParentViewController()` method

The **`removeFromParentViewController()`** method makes this view controller leave its parent. It only removes the parent-child relationship; it does not touch the views.

## Syntax

```
removeFromParentViewController()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. Calling it without a parent has no effect.

## Description

Removing a child fully also takes three lines, in the reverse order of adding:

1. `child.willMoveToParentViewController(null)`: tells it that it is about to leave.
2. `child.view.removeFromSuperview()`: takes the view off.
3. `child.removeFromParentViewController()`: removes the parent-child relationship. This line automatically calls `child.didMoveToParentViewController(null)`.

After removal, if no variable holds it, it is collected (verified by testing).

## Examples

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

panel.willMoveToParentViewController(null);
panel.view.removeFromSuperview();
panel.removeFromParentViewController();

console.log(page.childViewControllers.length);
console.log(panel.parentViewController);
```

**Result**: The console prints `0` and `null`.

## Corresponding iOS API

`-[UIViewController removeFromParentViewController]`.

## See also

- [`addChildViewController()`](addchildviewcontroller.md)
- [`willMoveToParentViewController()`](willmovetoparentviewcontroller.md)
