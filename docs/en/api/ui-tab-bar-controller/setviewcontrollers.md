---
type: reference
native: "-[UITabBarController setViewControllers:animated:]"
---

# `UITabBarController`: `setViewControllers()` method

The **`setViewControllers()`** method replaces all of the tab bar controller's view controllers, optionally animated.

## Syntax

```
setViewControllers(viewControllers)
setViewControllers(viewControllers, { animated })
```

### Parameters

**`viewControllers`**

An array of `UIViewController`, in the left-to-right order of the tabs.

**`options.animated`**

A boolean. Optional; defaults to `false`. How the animation looks is **not verified in the simulator**.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The array contains a native object that is not a view controller. The error message, and whether the original view controllers stay unchanged, are **not verified in the simulator**.

## Description

View controllers that are replaced no longer belong to this tab bar controller; their [`tabBarController`](../ui-view-controller/tabbarcontroller.md) goes back to `null`. If no other variable keeps them, they are reclaimed.

## Examples

```js
const home = new UIViewController();
const market = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, market];

const settings = new UIViewController();
settings.tabBarItem = new UITabBarItem({ title: 'Settings', image: UIImage.systemImageNamed('gearshape') });
tabs.setViewControllers([home, settings], { animated: true });
console.log(tabs.viewControllers.length);
console.log(market.tabBarController);
```

**Result**: the tab bar now has two tabs. The console logs `2` and `null`.

## Corresponding iOS API

`-[UITabBarController setViewControllers:animated:]`.

## See also

- [`viewControllers`](viewcontrollers.md)
