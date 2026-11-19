---
type: reference
native: "-[UIViewController didMoveToParentViewController:]"
---

# `UIViewController`: `didMoveToParentViewController()` method

The **`didMoveToParentViewController()`** method notifies the system that this view controller has finished changing its parent.

## Syntax

```
didMoveToParentViewController(parent)
```

### Parameters

**`parent`**

The new parent, a `UIViewController`; or `null`, meaning it has left its parent.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument is neither a view controller nor `null`: `didMoveToParentViewController needs a UIViewController or null`.

## Description

- When adding, **call `didMoveToParentViewController(parent)` yourself**, after [`addChildViewController()`](addchildviewcontroller.md) and `addSubview()`.
- When removing, you do not call it yourself: [`removeFromParentViewController()`](removefromparentviewcontroller.md) calls `didMoveToParentViewController(null)` automatically.
- This notification is sent to the system; JS cannot receive it, and the view controller has no corresponding event. The consequences of leaving it out are **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);
console.log(panel.parentViewController === page);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`-[UIViewController didMoveToParentViewController:]`.

## See also

- [`willMoveToParentViewController()`](willmovetoparentviewcontroller.md)
- [Parent and child view controllers](../ui-view-controller.md#parent-and-child-view-controllers)
