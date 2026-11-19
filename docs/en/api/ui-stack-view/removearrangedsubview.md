---
type: reference
native: "-[UIStackView removeArrangedSubview:]"
---

# `UIStackView`: `removeArrangedSubview()` method

The **`removeArrangedSubview()`** method stops a view from taking part in the arrangement. The view is still a subview of the stack view and is still shown on screen.

To take a view off the screen, use [`view.removeFromSuperview()`](../ui-view/removefromsuperview.md). It also removes the view from the arrangement.

## Syntax

```
removeArrangedSubview(view)
```

### Parameters

**`view`**

The `UIView` to remove from the arrangement.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`view` is not a view, or is missing: `removeArrangedSubview needs a UIView`. When it throws, the arrangement is unchanged.

## Examples

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';

row.removeArrangedSubview(orange);

console.log(row.arrangedSubviews.length);
console.log(orange.superview === row);
console.log(row.subviews.length);
```

**Result**

- Prints `2`, `true`, `3` in order.
- The red and teal blocks split the whole row. The orange block is still in the view hierarchy, but the stack view no longer positions it. **Where the orange block is shown at this point is not verified in the simulator.**

## Corresponding iOS API

`-[UIStackView removeArrangedSubview:]`.

## See also

- [`removeFromSuperview()`](../ui-view/removefromsuperview.md): actually removing it
- [Arranged subviews and subviews](../ui-stack-view.md#arranged-subviews-and-subviews)
