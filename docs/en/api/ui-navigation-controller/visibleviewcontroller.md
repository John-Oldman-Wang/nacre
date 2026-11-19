---
type: reference
native: UINavigationController.visibleViewController
---

# `UINavigationController`: `visibleViewController` property

The **`visibleViewController`** property is the view controller the user sees right now.

## Value

A `UIViewController`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- When the top view controller has modally presented another view controller, it is the presented one; otherwise it is the same as [`topViewController`](topviewcontroller.md). The first case is **not verified in the simulator**.
- `null` when the stack is empty.

## Examples

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
console.log(nav.visibleViewController === home);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`UINavigationController.visibleViewController`.

## See also

- [`topViewController`](topviewcontroller.md)
- [`presentedViewController`](../ui-view-controller/presentedviewcontroller.md)
