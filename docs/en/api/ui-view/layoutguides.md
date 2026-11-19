---
type: reference
native: UIView.layoutGuides
---

# `UIView`: `layoutGuides` property

The **`layoutGuides`** property is the layout guides added to this view with [`addLayoutGuide()`](addlayoutguide.md).

## Value

A read-only array of [`UILayoutGuide`](../ui-layout-guide.md).

- Read-only; assigning to it throws `TypeError`.
- Doesn't include the system-provided `safeAreaLayoutGuide`, `layoutMarginsGuide`, `readableContentGuide`, or `keyboardLayoutGuide`.

## Examples

```js
const card = new UIView();
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
console.log(card.layoutGuides.includes(spacer));
```

**Result**: Logs `true`.

## Corresponding iOS API

`UIView.layoutGuides`.

## See also

- [`addLayoutGuide()`](addlayoutguide.md), [`removeLayoutGuide()`](removelayoutguide.md)
