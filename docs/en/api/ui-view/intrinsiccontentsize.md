---
type: reference
native: UIView.intrinsicContentSize
---

# `UIView`: `intrinsicContentSize` property

The **`intrinsicContentSize`** property is the view's intrinsic size computed from its content: how large the view itself knows it should be.

## Value

A [`CGSize`](../cg-size.md), in [pt](../units.md).

- Read-only; assigning to it throws `TypeError`.
- A plain `UIView` has no content and returns `(-1, -1)`, meaning no intrinsic size (measured). A dimension with no intrinsic size is `-1`.
- [`UILabel`](../ui-label.md) returns the size of its laid-out text, [`UIButton`](../ui-button.md) returns the size of its title and icon, and [`UIImageView`](../ui-image.md) returns the size of its image.
- A view with an intrinsic size doesn't need width and height constraints when positioned by constraints; you only write its position. When the content changes, the intrinsic size changes with it, and the view's size is updated on the next layout pass.
- No change notification. To have it recomputed immediately after the content changes, call [`invalidateIntrinsicContentSize()`](invalidateintrinsiccontentsize.md).

## Examples

```js
console.log(String(new UIView().intrinsicContentSize));

const label = new UILabel();
label.text = 'Hello';
console.log(label.intrinsicContentSize.width > 0);
```

**Result**: Prints `CGSize(-1, -1)`, then `true`.

## Corresponding iOS API

`UIView.intrinsicContentSize`.

## See also

- [Intrinsic size](../auto-layout.md#intrinsic-content-size)
- [`setContentHuggingPriority()`](setcontenthuggingpriority.md)
