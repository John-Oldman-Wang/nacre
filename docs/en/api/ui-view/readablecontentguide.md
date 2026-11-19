---
type: reference
native: UIView.readableContentGuide
---

# `UIView`: `readableContentGuide` property

The **`readableContentGuide`** property is a width range suited to reading long text. When the view is wide, it is narrower than the view.

## Value

[`UILayoutGuide`](../ui-layout-guide.md).

- Read-only; assigning to it throws `TypeError`.
- Provided by the system. You don't add it with `addLayoutGuide()`, and it isn't in [`layoutGuides`](layoutguides.md).
- Long text is easier to read aligned to it than aligned to the safe area.
- The exact area is **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const body = new UILabel();
body.numberOfLines = 0;
body.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(body);

const readable = page.view.readableContentGuide;
NSLayoutConstraint.activateConstraints([
  body.leadingAnchor.constraintEqualToAnchor(readable.leadingAnchor),
  body.trailingAnchor.constraintEqualToAnchor(readable.trailingAnchor),
  body.topAnchor.constraintEqualToAnchor(readable.topAnchor),
]);
```

**Effect**: The width of the multi-line text is limited to a range suited to reading. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.readableContentGuide`.

## See also

- [`UILayoutGuide`](../ui-layout-guide.md)
- [Laying out with constraints](../../guides/auto-layout.md)
