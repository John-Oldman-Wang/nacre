---
type: reference
native: "-[UITabBarController init]"
---

# `UITabBarController()` constructor

The **`UITabBarController()`** constructor creates a tab bar controller with no view controllers.

## Syntax

```
new UITabBarController()
```

### Parameters

None.

### Return value

A new `UITabBarController`. [`viewControllers`](viewcontrollers.md) is an empty array and [`selectedIndex`](selectedindex.md) is `-1`.

You do not need to keep it yourself after creating it: once handed to a window, neither it nor its view controllers are reclaimed.

### Exceptions

**`TypeError`**

Thrown when constructing a subclass of it; see [Native classes](../native-classes.md).

## Examples

```js
const tabs = new UITabBarController();
console.log(tabs.viewControllers.length, tabs.selectedIndex);
```

**Result**: the console logs `0 -1`.

## Corresponding iOS API

`[[UITabBarController alloc] init]`.

## See also

- [`viewControllers`](viewcontrollers.md)
