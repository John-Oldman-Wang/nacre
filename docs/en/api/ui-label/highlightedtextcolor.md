---
type: reference
native: UILabel.highlightedTextColor
---

# `UILabel`: `highlightedTextColor` property

The **`highlightedTextColor`** property is the text color when the label is in the highlighted state.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default is `null`, meaning the color does not change when highlighted.
- Accepts a color string or a `UIColor` object on write. The string read back is the same as the one written.
- Only takes effect when [`isHighlighted`](ishighlighted.md) is `true`.

### Invalid values

Writing an invalid color does not throw. The console prints a warning and the color keeps its previous value:

```
[Nacre] highlightedTextColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const label = new UILabel();
label.highlightedTextColor = 'systemYellow';
console.log(label.highlightedTextColor);
```

**Result**: The console prints `systemYellow`.

## Corresponding iOS API

`UILabel.highlightedTextColor`. In ObjC it is a `UIColor` object; here it is written as a string.

## See also

- [`isHighlighted`](ishighlighted.md)
- [`textColor`](textcolor.md)
