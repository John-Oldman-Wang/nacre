---
type: reference
native: "-[UISearchBar setShowsScopeBar:animated:]"
---

# `UISearchBar`: `setShowsScopeBar()` method

The **`setShowsScopeBar()`** method shows or hides the scope bar, optionally animated.

## Syntax

```
setShowsScopeBar(showsScopeBar)
setShowsScopeBar(showsScopeBar, { animated })
```

### Parameters

**`showsScopeBar`**

A boolean. `true` shows it, `false` hides it.

**`options.animated`**

A boolean, optional. When omitted or `false`, the change is immediate, the same as writing [`showsScopeBar`](showsscopebar.md) directly. The look of the animation is **not verified in the simulator**.

### Return value

None (`undefined`).

When animated, the `showsScopeBar` property already has the new value when the call returns.

### Exceptions

None.

## Examples

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['All', 'Mine'];
search.setShowsScopeBar(true, { animated: true });
console.log(search.showsScopeBar);
```

**Effect**: The scope bar appears with an animation. The console prints `true`.

## Corresponding iOS API

`-[UISearchBar setShowsScopeBar:animated:]`. `animated:` becomes `animated` in the options object.

## See also

- [`showsScopeBar`](showsscopebar.md)
