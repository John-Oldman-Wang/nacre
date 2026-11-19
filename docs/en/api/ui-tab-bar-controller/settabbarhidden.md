---
type: reference
native: "-[UITabBarController setTabBarHidden:animated:]"
---

# `UITabBarController`: `setTabBarHidden()` method

The **`setTabBarHidden()`** method hides or shows the tab bar, optionally animated.

## Syntax

```
setTabBarHidden(hidden)
setTabBarHidden(hidden, { animated })
```

### Parameters

**`hidden`**

A boolean. `true` hides it; `false` shows it.

**`options.animated`**

A boolean. Optional; defaults to `false`.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const tabs = new UITabBarController();
tabs.setTabBarHidden(true, { animated: true });
console.log(tabs.isTabBarHidden);
```

**Effect**: the tab bar disappears with an animation, and the console logs `true`. Calling it again with `false` brings it back. **The animation is not verified in the simulator.**

## Corresponding iOS API

`-[UITabBarController setTabBarHidden:animated:]`.

## See also

- [`isTabBarHidden`](istabbarhidden.md)
