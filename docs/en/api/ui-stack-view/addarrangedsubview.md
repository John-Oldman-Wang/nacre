---
type: reference
native: "-[UIStackView addArrangedSubview:]"
---

# `UIStackView`: `addArrangedSubview()` method

The **`addArrangedSubview()`** method adds a view to the end of the arrangement.

## Syntax

```
addArrangedSubview(view)
```

### Parameters

**`view`**

The `UIView` to add.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `view` is not a view (`null`, a number, a string, a native object that is not a view), or is missing: `addArrangedSubview needs a UIView`.
- `view` is a window that has no native object yet (`new UIWindow()` with no scene, and `windowScene` not assigned yet): `addArrangedSubview:: UIWindow has no native object yet, so it cannot be passed as an argument`.

When it throws, the arrangement is unchanged.

## Description

- The view also becomes a subview of the stack view; you do not need to call `addSubview()` as well. If it had another superview, it is removed from that one.
- The view's `translatesAutoresizingMaskIntoConstraints` is set to `false` (verified by testing). Do not write constraints that determine its position; write only a width or height when needed.
- The arrangement updates at the next layout pass. To read the new `frame` immediately, call `layoutIfNeeded()` first.

## Examples

```js
const row = new UIStackView();
const gray = new UIView();
gray.backgroundColor = 'systemGray';
row.addArrangedSubview(gray);

console.log(gray.superview === row);
console.log(gray.translatesAutoresizingMaskIntoConstraints);
```

**Result**: Prints `true`, then `false`.

## Corresponding iOS API

`-[UIStackView addArrangedSubview:]`.

## See also

- [`insertArrangedSubview()`](insertarrangedsubview.md): insert at a given position
- [`removeFromSuperview()`](../ui-view/removefromsuperview.md): remove an arranged subview
- [Arranged subviews and subviews](../ui-stack-view.md#arranged-subviews-and-subviews)
