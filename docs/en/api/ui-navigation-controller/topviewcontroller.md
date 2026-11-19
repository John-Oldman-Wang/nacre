---
type: reference
native: UINavigationController.topViewController
---

# `UINavigationController`: `topViewController` property

The **`topViewController`** property is the view controller at the top of the stack.

## Value

A `UIViewController`, or `null`.

- Read-only; assigning to it throws `TypeError`.
- `null` when the stack is empty.
- Equal to the last element of `viewControllers`. Right after `pushViewController()`, it is the newly pushed view controller.
- In a [`beforeshow`](beforeshow-event.md) callback, to tell which view controller is about to be shown, use the event object's `viewController`, not `topViewController`.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
const detail = new UIViewController();
nav.pushViewController(detail, { animated: false });
console.log(nav.topViewController === detail);
console.log(detail.navigationController === nav);
```

**Result**: The console prints `true` and `true`.

## Corresponding iOS API

`UINavigationController.topViewController`.

## See also

- [`visibleViewController`](visibleviewcontroller.md)
