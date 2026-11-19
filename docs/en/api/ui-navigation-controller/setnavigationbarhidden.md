---
type: reference
native: "-[UINavigationController setNavigationBarHidden:animated:]"
---

# `UINavigationController`: `setNavigationBarHidden()` method

The **`setNavigationBarHidden()`** method hides or shows the navigation bar, optionally animated.

## Syntax

```
setNavigationBarHidden(hidden)
setNavigationBarHidden(hidden, { animated })
```

### Parameters

**`hidden`**

A boolean. `true` hides it, `false` shows it.

**`options.animated`**

A boolean, optional. `true` animates; `false` or omitted doesn't.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.setNavigationBarHidden(true, { animated: true });
console.log(nav.isNavigationBarHidden);
```

**Effect**: The navigation bar disappears with an animation. The console prints `true`. **The animation is not verified in the simulator.**

## Corresponding iOS API

`-[UINavigationController setNavigationBarHidden:animated:]`.

## See also

- [`isNavigationBarHidden`](isnavigationbarhidden.md)
- [`beforeshow`](beforeshow-event.md): decide whether to hide it based on the view controller about to be shown
