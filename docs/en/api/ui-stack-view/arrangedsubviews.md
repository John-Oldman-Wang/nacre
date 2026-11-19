---
type: reference
native: UIStackView.arrangedSubviews
---

# `UIStackView`: `arrangedSubviews` property

The **`arrangedSubviews`** property is all of the stack view's arranged subviews, in arrangement order (left to right or top to bottom).

## Value

An array of `UIView`.

- Read-only; assigning to it throws `TypeError`.
- A new, empty stack view has an empty array.
- Hidden arranged subviews (`isHidden` is `true`) are included.
- Each read returns a new array. The view objects in it are the same and can be compared with `===`. Changing this array does not affect the stack view.
- It is a subset of `subviews`. Views added with `addSubview()` are in `subviews` but not here; see [Arranged subviews and subviews](../ui-stack-view.md#arranged-subviews-and-subviews).
- No change notification. Only the app's own code changes the arranged subviews.

## Examples

```js
const a = new UIView();
const b = new UIView();
const row = new UIStackView([a, b]);

b.isHidden = true;
console.log(row.arrangedSubviews.length);
console.log(row.arrangedSubviews[0] === a);
console.log(row.arrangedSubviews === row.arrangedSubviews);
```

**Result**: Prints `2`, `true`, `false` in order.

## Corresponding iOS API

`UIStackView.arrangedSubviews`.

## See also

- [`addArrangedSubview()`](addarrangedsubview.md), [`removeArrangedSubview()`](removearrangedsubview.md)
- [`subviews`](../ui-view/subviews.md): all subviews
