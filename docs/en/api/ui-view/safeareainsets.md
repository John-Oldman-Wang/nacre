---
type: reference
native: UIView.safeAreaInsets
---

# `UIView`: `safeAreaInsets` property

The **`safeAreaInsets`** property gives the distances from the four edges of the [safe area](../ui-view.md#safe-area) to the four edges of the view. The safe area is the part of the view that isn't covered by the notch, the status bar, the rounded screen corners, or the home indicator.

## Value

[`UIEdgeInsets`](../ui-edge-insets.md), in [pt](../units.md). The fields are `top`, `left`, `bottom`, and `right`.

- Read-only; assigning to it throws `TypeError`.
- Determined by the system. Each view's values are computed from that view's own area: a view touching the top of the screen has a top inset, and a view entirely in the middle of the screen has 0 pt on all four edges.
- Before the view is shown on screen, all four edges are 0 pt (verified by testing: the root view of a view controller not yet in a window). Reading too early gives wrong values.
- There is no event when the safe area changes. Code that reads the values has to read them again itself; constraints aligned to [`safeAreaLayoutGuide`](safearealayoutguide.md) are recomputed automatically.

When positioning with constraints, align to `safeAreaLayoutGuide` instead of reading these values.

## Examples

```js
const page = new UIViewController();
const insets = page.view.safeAreaInsets;

const bar = new UIView();
bar.frame = new CGRect(0, insets.top, page.view.bounds.width, 44);
bar.backgroundColor = 'systemTeal';
page.view.addSubview(bar);
```

**Effect**: When the view controller is already shown, you get a 44 pt tall teal bar spanning the screen's width, with its top edge right below the notch and status bar. When the view controller isn't shown yet, `insets.top` is 0. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.safeAreaInsets`.

## See also

- [`safeAreaLayoutGuide`](safearealayoutguide.md)
- [Safe area](../ui-view.md#safe-area)
- [Avoiding the notch and the home indicator](../../guides/views.md#avoiding-the-notch-and-the-home-indicator)
