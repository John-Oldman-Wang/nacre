---
type: reference
native: "-[UIViewController willMoveToParentViewController:]"
---

# `UIViewController`: `willMoveToParentViewController()` method

The **`willMoveToParentViewController()`** method notifies the system that this view controller is about to change its parent.

## Syntax

```
willMoveToParentViewController(parent)
```

### Parameters

**`parent`**

The new parent, a `UIViewController`; or `null`, meaning it is about to leave its parent.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument is neither a view controller nor `null`.

## Description

- When adding, you do not call it yourself: [`addChildViewController()`](addchildviewcontroller.md) calls `willMoveToParentViewController(parent)` automatically.
- When removing, **call `willMoveToParentViewController(null)` yourself**, before [`removeFromParentViewController()`](removefromparentviewcontroller.md).
- This notification is sent to the system; JS cannot receive it, and the view controller has no corresponding event. The consequences of leaving it out are **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
panel.didMoveToParentViewController(page);

panel.willMoveToParentViewController(null);
panel.removeFromParentViewController();
console.log(panel.parentViewController);
```

**Result**: The console prints `null`.

## Corresponding iOS API

`-[UIViewController willMoveToParentViewController:]`.

## See also

- [`didMoveToParentViewController()`](didmovetoparentviewcontroller.md)
- [Parent and child view controllers](../ui-view-controller.md#parent-and-child-view-controllers)
