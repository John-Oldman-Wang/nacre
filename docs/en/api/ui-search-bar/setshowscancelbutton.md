---
type: reference
native: "-[UISearchBar setShowsCancelButton:animated:]"
---

# `UISearchBar`: `setShowsCancelButton()` method

The **`setShowsCancelButton()`** method shows or hides the cancel button, optionally animated.

## Syntax

```
setShowsCancelButton(showsCancelButton)
setShowsCancelButton(showsCancelButton, { animated })
```

### Parameters

**`showsCancelButton`**

A boolean. `true` shows it, `false` hides it.

**`options.animated`**

A boolean, optional. When `true`, the cancel button slides in or out. When omitted or `false`, the change is immediate, the same as writing [`showsCancelButton`](showscancelbutton.md) directly. The look of the animation is **not verified in the simulator**.

### Return value

None (`undefined`).

When animated, the `showsCancelButton` property already has the new value when the call returns.

### Exceptions

None.

## Examples

```js
const search = new UISearchBar();
search.addEventListener('focus', () => {
  search.setShowsCancelButton(true, { animated: true });
});
search.addEventListener('blur', () => {
  search.setShowsCancelButton(false, { animated: true });
});
```

**Effect**: Tapping the search bar slides a cancel button in on the right; when the keyboard goes away, the cancel button slides out. **Not verified in the simulator.**

## Corresponding iOS API

`-[UISearchBar setShowsCancelButton:animated:]`. `animated:` becomes `animated` in the options object.

## See also

- [`showsCancelButton`](showscancelbutton.md)
