---
type: reference
native: UIView.safeAreaLayoutGuide
---

# `UIView`: `safeAreaLayoutGuide` property

The **`safeAreaLayoutGuide`** property is the layout guide that represents the [safe area](../ui-view.md#safe-area). The safe area is the part of the view that isn't covered by the notch, the status bar, the rounded screen corners, or the home indicator.

## Value

[`UILayoutGuide`](../ui-layout-guide.md).

- Read-only; assigning to it throws `TypeError`.
- Provided by the system. You don't add it with `addLayoutGuide()`, and it isn't in [`layoutGuides`](layoutguides.md).
- Align content to it, not to the view controller's root view, and the content won't be covered. Constraints aligned to it are recomputed automatically when the safe area changes, and they don't depend on when you read anything; [`safeAreaInsets`](safeareainsets.md) reads 0 before the view is shown.
- The usual approach: the background fills the whole view controller, and text and buttons go inside the safe area.

## Examples

```js
const page = new UIViewController();
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(banner);

const guide = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  banner.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  banner.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  banner.bottomAnchor.constraintEqualToAnchor(guide.bottomAnchor, { constant: -24 }),
  banner.heightAnchor.constraintEqualToConstant(60),
]);
```

**Effect**: Once the view controller is shown, a 60 pt tall bar appears near the bottom. Its left and right edges are 16 pt inside the safe area, and its bottom edge is 24 pt above the bottom of the safe area.

## Corresponding iOS API

`UIView.safeAreaLayoutGuide`.

## See also

- [`UILayoutGuide`](../ui-layout-guide.md)
- [Laying out with constraints](../../guides/auto-layout.md)
