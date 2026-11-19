---
type: reference
native: UIView.keyboardLayoutGuide
---

# `UIView`: `keyboardLayoutGuide` property

The **`keyboardLayoutGuide`** property is the area the keyboard occupies. When the keyboard is hidden, its top edge is at the bottom edge of the safe area; when the keyboard is shown, it is at the keyboard's top edge.

## Value

A [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md).

- Read-only; assigning to it throws `TypeError`.
- Provided by the system. You don't add it with `addLayoutGuide()`, and it isn't in [`layoutGuides`](layoutguides.md).
- Constrain the bottom edge of your content to its `topAnchor`, and one constraint covers both the keyboard showing and hiding, in sync with the keyboard animation. You don't need to listen for keyboard events or compute the keyboard's height.
- Measured: with the keyboard hidden, `page.view.keyboardLayoutGuide.layoutFrame.height` is 34 pt, equal to the height of the safe area taken by the home indicator at the bottom of the screen.

## Examples

```js
const page = new UIViewController();
const bar = new UIView();
bar.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(bar);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  bar.heightAnchor.constraintEqualToConstant(44),
  bar.bottomAnchor.constraintEqualToAnchor(
    page.view.keyboardLayoutGuide.topAnchor, { constant: -16 }),
]);
```

**Effect**: With no keyboard, `bar` is 16 pt above the bottom edge of the safe area (asserted in the acceptance tests). When the keyboard appears, `bar` moves up with it and stops 16 pt above the keyboard. The position with the keyboard shown is **not verified in the simulator**.

## Corresponding iOS API

`UIView.keyboardLayoutGuide`.

## See also

- [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)
- [Laying out with constraints](../../guides/auto-layout.md)
