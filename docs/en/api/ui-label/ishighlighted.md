---
type: reference
native: UILabel.highlighted
---

# `UILabel`: `isHighlighted` property

The **`isHighlighted`** property determines whether the label is in the highlighted state. When highlighted, the text is drawn in the color of [`highlightedTextColor`](highlightedtextcolor.md).

## Value

A boolean.

- Readable and writable.
- The default is `false`.
- `true`: the text is drawn in `highlightedTextColor`. When `highlightedTextColor` is `null`, the color does not change. **Not verified in the simulator.**
- `false`: the text is drawn in [`textColor`](textcolor.md).
- The system never changes it automatically; only the app's code does, so there is no change notification.

## Examples

```js
const label = new UILabel();
label.text = 'Temporary notice';
label.highlightedTextColor = 'systemYellow';
label.isHighlighted = true;
```

**Effect**: The text turns yellow. Setting `isHighlighted` back to `false` restores the `textColor` color. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.highlighted` (the getter is `isHighlighted`).

## See also

- [`highlightedTextColor`](highlightedtextcolor.md)
