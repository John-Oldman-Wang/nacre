---
type: reference
native: UILabel.font
---

# `UILabel`: `font` property

The **`font`** property is the font of the label's text, including size and weight.

## Value

A [`UIFont`](../ui-font.md).

- Readable and writable.
- The default is the system font at 17 pt.
- Writing `null` restores the default. It never reads as `null`.
- The object read is the one written: `label.font === the object written` is `true`.
- A `UIFont` cannot be modified. To change the size or weight, create a new `UIFont` and assign it.
- The label's font size does not automatically follow the text size the user sets in system settings; to follow it, reassign when the setting changes. See the guide [Setting fonts](../../guides/fonts.md).
- When [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) has shrunk the font size, `font` still reads as the original font and does not reflect the shrunken size. **Not verified in the simulator.**

### Invalid values

**`TypeError`**

The value written is neither a `UIFont` object nor `null`, such as `label.font = 'Helvetica'`.

## Examples

```js
const label = new UILabel();
label.text = 'Title';
label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
```

**Effect**: The text becomes the 20 pt semibold system font.

```js
const label = new UILabel();
label.text = '12:30';
label.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**Effect**: Every character takes the same width, which suits numbers and code.

## Corresponding iOS API

`UILabel.font`.

## See also

- [`UIFont`](../ui-font.md): every way to create a font
