---
type: reference
native: UIButton.titleLabel
---

# `UIButton`: `titleLabel` property

The **`titleLabel`** property is the [`UILabel`](../ui-label.md) inside the button that displays the title. The button itself has no properties such as font or number of lines; set them through this label.

## Value

[`UILabel`](../ui-label.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- A `system` button's `titleLabel` has a value, and its `text` is the title currently displayed. Other button types are **not verified in the simulator**.
- Its type allows `null`, so check before using it.

> **Note:** Don't change the title text or color through `titleLabel`; use [`setTitle()`](settitle.md) and [`setTitleColor()`](settitlecolor.md). If you change `titleLabel.text` directly, the button switches it back the next time its state changes.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Submit', { forState: ['normal'] });
const label = button.titleLabel;
if (label) {
  label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
```

**Effect**: The title becomes 20 pt semibold.

## Corresponding iOS API

`UIButton.titleLabel`.

## See also

- [`UILabel`](../ui-label.md): font, number of lines, truncation
- [`imageView`](imageview.md)
