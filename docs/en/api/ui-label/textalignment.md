---
type: reference
native: UILabel.textAlignment
---

# `UILabel`: `textAlignment` property

The **`textAlignment`** property determines the horizontal alignment of the text within the label's width.

## Value

A string, one of these five:

| Value | Effect |
| --- | --- |
| `'left'` | Left |
| `'center'` | Centered |
| `'right'` | Right |
| `'justified'` | Justified: every line except the last is spread out to fill the whole line. Only meaningful for multi-line text. **Not verified in the simulator** |
| `'natural'` | Follows the writing direction of the system language: left for left-to-right languages, right for right-to-left languages (Arabic, Hebrew) |

- Readable and writable.
- The default is `'natural'`.
- Alignment happens within the label's own width. When the label is exactly as wide as the text, the alignments look the same. To see centering, the label must be wider than the text, for example with its width set by constraints on both sides.

### Invalid values

Writing a value not in the table does not throw. The property keeps its previous value, and the console prints a warning, with all available values listed at the ellipsis:

```
[Nacre] textAlignment has no value "middle"; expected one of: …, ignored
```

## Examples

```js
const label = new UILabel();
label.text = 'Centered title';
label.textAlignment = 'center';
```

**Effect**: The text is centered horizontally within the label's width.

## Corresponding iOS API

`UILabel.textAlignment`. `NSTextAlignmentCenter` is written `'center'`, and likewise for the rest.

## See also

- [Enums](../enums.md): why an invalid property value is a warning instead of an exception
