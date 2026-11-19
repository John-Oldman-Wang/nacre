---
type: reference
native: "-[UIView isDescendantOfView:]"
---

# `UIView`: `isDescendantOfView()` method

The **`isDescendantOfView()`** method checks whether the receiver is a descendant of `view`.

## Syntax

```
isDescendantOfView(view)
```

### Parameters

**`view`**

A `UIView`.

### Return value

A boolean. Returns `true` when the receiver is a subview of `view`, a subview of a subview, and so on. Also returns `true` when `view` is the receiver itself.

### Exceptions

**`TypeError`**

The argument isn't a view (another native object, `null`, a number, or missing): `isDescendantOfView needs a UIView`.

## Examples

```js
const card = new UIView();
const dot = new UIView();
card.addSubview(dot);
console.log(dot.isDescendantOfView(card), card.isDescendantOfView(dot), card.isDescendantOfView(card));
```

**Result**: Prints `true false true`.

## Corresponding iOS API

`-[UIView isDescendantOfView:]`.

## See also

- [`addSubview()`](addsubview.md): use this method first to check whether adding would create a cycle
