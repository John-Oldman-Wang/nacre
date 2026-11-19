---
type: reference
native: UILabel.textColor
---

# `UILabel`: `textColor` property

The **`textColor`** property is the color of the label's text.

## Value

A [color](../ui-color.md) string.

- Readable and writable.
- The default is the semantic color `'label'`: black in light mode, white in dark mode, switching automatically.
- Accepts a color string or a `UIColor` object on write.
- The string read back is the same as the one written: write `'#336699'`, read back `'#336699'`.
- Writing `null` restores the default (**not verified in the simulator**). It never reads as `null`.
- System color names (`'systemRed'`, `'label'`, and the like) change automatically with dark mode.

### Invalid values

Writing an invalid color does not throw. The console prints a warning and the color keeps its previous value:

```
[Nacre] textColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const label = new UILabel();
label.text = 'Warning';
label.textColor = '#FF3B30';
```

**Effect**: The text turns red.

```js
const label = new UILabel();
label.textColor = '#336699';
console.log(label.textColor);
```

**Result**: The console prints `#336699`.

## Corresponding iOS API

`UILabel.textColor`. In ObjC it is a `UIColor` object; here it is written as a string.

## See also

- [`UIColor`](../ui-color.md): every way to write a color string
- [`highlightedTextColor`](highlightedtextcolor.md): the text color when highlighted
