---
type: reference
native: UILabel.numberOfLines
---

# `UILabel`: `numberOfLines` property

The **`numberOfLines`** property is the maximum number of lines the label shows.

## Value

An integer, in lines.

- Readable and writable.
- The default is `1`: the text does not wrap, and the part that does not fit is handled according to [`lineBreakMode`](linebreakmode.md).
- `0` means no limit, not "zero lines". The text takes as many lines as it needs.
- A number greater than 1: the text wraps automatically within the label's width and shows at most that many lines. When it does not fit, the last line is handled according to `lineBreakMode`. When the text has fewer lines, as many lines as it has are shown.
- When the label is not tall enough to show that many lines, only the lines that fit are shown. **Not verified in the simulator.**
- It affects the label's intrinsic size and the result of `sizeThatFits()`; see [Intrinsic size](../ui-label.md#intrinsic-size).

For the same text, the 15 pt system font, and the same width limit, the measured results of `sizeThatFits()` are:

| `numberOfLines` | Result of `sizeThatFits()` |
| --- | --- |
| `2` | Width 343, height 36 |
| `0` | Width 343, height 71.67 |

### Invalid values

The value written is converted to a number and then truncated toward zero: `'2'` gives `2`. Values that cannot be converted to a finite number (`'abc'`, `undefined`) throw `TypeError`.

## Examples

```js
const label = new UILabel();
label.text = 'A fairly long piece of text that does not fit on one line and needs to wrap.';
label.numberOfLines = 3;
```

**Effect**: The text wraps automatically within the label's width and shows at most 3 lines. When 3 lines are not enough, the end of the third line shows "…".

## Corresponding iOS API

`UILabel.numberOfLines`.

## See also

- [Line count, wrapping, and truncation](../ui-label.md#line-count-wrapping-and-truncation)
- [Displaying text](../../guides/labels.md): the recommended way to write multi-line text
