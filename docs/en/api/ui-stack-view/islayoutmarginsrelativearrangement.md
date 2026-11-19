---
type: reference
native: UIStackView.layoutMarginsRelativeArrangement
---

# `UIStackView`: `isLayoutMarginsRelativeArrangement` property

The **`isLayoutMarginsRelativeArrangement`** property determines whether the arranged subviews are laid out inside the stack view's padding.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Arranged subviews are laid out inside the stack view's padding, leaving the space given by [`directionalLayoutMargins`](../ui-view/directionallayoutmargins.md) around them |
| `false` | Arranged subviews touch the stack view's edges; the padding has no effect |

- Readable and writable.
- The default is `false`.
- The padding is `directionalLayoutMargins`, inherited from `UIView`, and its default is 8 pt on each edge, not 0. If you only turn this switch on without writing the padding, this default is used.
- When an edge of the stack view extends outside the safe area (for example, when it fills the whole screen), the system adds the safe area to the padding on that edge. To get exactly what you write, set the stack view's `insetsLayoutMarginsFromSafeArea` to `false`.
- When the stack view is not yet in a window but has already been laid out once, after changing the padding or this property you must call `setNeedsLayout()` and then `layoutIfNeeded()` for the arranged subviews' positions to update. This is not needed when the stack view is in a window.
- Converted with `Boolean()` on write.
- No change notification. Only the app's own code can change it.

## Examples

```js
const box = new UIStackView();
box.frame = new CGRect(0, 0, 200, 100);
box.isLayoutMarginsRelativeArrangement = true;
box.insetsLayoutMarginsFromSafeArea = false;
box.directionalLayoutMargins = { top: 10, leading: 20, bottom: 30, trailing: 40 };

const item = new UIView();
box.addArrangedSubview(item);
box.setNeedsLayout();
box.layoutIfNeeded();
console.log(String(item.frame));
```

**Result**: With a left-to-right language, prints `CGRect(20, 10, 140, 60)`; with right-to-left, `CGRect(40, 10, 140, 60)`. The arranged subview is inside the padding: 20 pt left on the left, 10 pt on top, width 200 − 20 − 40, height 100 − 10 − 30. The acceptance tests checked these numbers.

## Corresponding iOS API

`UIStackView.layoutMarginsRelativeArrangement`. Its ObjC getter name is `isLayoutMarginsRelativeArrangement`, and JS uses that name for both reading and writing.

## See also

- [Adding padding to a stack view](../../guides/stack-views.md#adding-padding-to-the-container)
- [`directionalLayoutMargins`](../ui-view/directionallayoutmargins.md)
