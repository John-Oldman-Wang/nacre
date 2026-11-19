---
type: reference
native: "-[UINavigationController setViewControllers:animated:]"
---

# `UINavigationController`: `setViewControllers()` method

The **`setViewControllers()`** method replaces the whole stack; the last element of the array becomes the top.

## Syntax

```
setViewControllers(viewControllers)
setViewControllers(viewControllers, { animated })
```

### Parameters

**`viewControllers`**

An array of `UIViewController`, bottom first.

**`options.animated`**

A boolean, optional. When animated, whether the system plays a push or a pop animation is decided by the system based on whether the new top was in the old stack; **the animation is not verified in the simulator**. When omitted, it switches directly.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The array contains a native object that isn't a view controller: `setViewControllers: only accepts UIViewController`.

## Description

View controllers not in the new array are effectively popped; see [Who keeps the view controllers in the stack alive](../ui-navigation-controller.md#who-keeps-the-view-controllers-in-the-stack-alive). When you don't need an animation, you can also assign [`viewControllers`](viewcontrollers.md) directly.

## Examples

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
const a = new UIViewController();
const b = new UIViewController();
a.title = 'A';
b.title = 'B';

nav.setViewControllers([home, a, b], { animated: true });
console.log(nav.viewControllers.length, nav.topViewController === b);
```

**Result**: The stack becomes three view controllers, home, A, and B, and the screen shows B. The console prints `3 true`.

## Corresponding iOS API

`-[UINavigationController setViewControllers:animated:]`.

## See also

- [`viewControllers`](viewcontrollers.md)
