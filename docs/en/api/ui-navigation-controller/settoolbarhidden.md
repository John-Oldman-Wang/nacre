---
type: reference
native: "-[UINavigationController setToolbarHidden:animated:]"
---

# `UINavigationController`: `setToolbarHidden()` method

The **`setToolbarHidden()`** method hides or shows the toolbar at the bottom of the screen, optionally animated.

## Syntax

```
setToolbarHidden(hidden)
setToolbarHidden(hidden, { animated })
```

### Parameters

**`hidden`**

A boolean. `true` hides it, `false` shows it.

**`options.animated`**

A boolean, optional. `true` animates; `false` or omitted doesn't. Passing `null` for the whole options object is treated as omitting it.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const nav = new UINavigationController(new UIViewController());
nav.setToolbarHidden(false, { animated: true });
console.log(nav.isToolbarHidden);
```

**Effect**: The toolbar appears from the bottom with an animation. The console prints `false`. **The animation is not verified in the simulator.**

## Corresponding iOS API

`-[UINavigationController setToolbarHidden:animated:]`.

## See also

- [`isToolbarHidden`](istoolbarhidden.md)
- [`toolbar`](toolbar.md)
