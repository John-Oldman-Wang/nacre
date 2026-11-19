---
type: reference
native: "-[UINavigationController initWithRootViewController:]"
---

# `UINavigationController()` constructor

The **`UINavigationController()`** constructor creates a navigation controller.

## Syntax

```
new UINavigationController()
new UINavigationController(rootViewController)
```

### Parameters

**`rootViewController`**

Optional; a `UIViewController` to be the bottom of the stack. If omitted, the stack is empty; add view controllers later with [`pushViewController()`](pushviewcontroller.md) or [`viewControllers`](viewcontrollers.md).

### Return value

A new `UINavigationController`.

### Exceptions

**`TypeError`**

- `rootViewController` is currently some window's root view controller: `cannot construct UINavigationController with these arguments`. The window stays as it is. For how to handle this, see [Putting an already-shown view controller into a navigation stack](../../guides/navigation.md#putting-an-already-shown-view-controller-into-a-navigation-stack) in the guide.
- Subclassing it and constructing: `class MyNav extends UINavigationController {}` throws on `new`; see [native classes](../native-classes.md).

## Examples

```js
const empty = new UINavigationController();
const withRoot = new UINavigationController(new UIViewController());
console.log(empty.viewControllers.length, withRoot.viewControllers.length);
```

**Result**: The console prints `0 1`.

## Corresponding iOS API

`-[UINavigationController initWithRootViewController:]`; with no argument, `init`.

## See also

- [`viewControllers`](viewcontrollers.md)
