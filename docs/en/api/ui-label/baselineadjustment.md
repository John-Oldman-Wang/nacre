---
type: reference
native: UILabel.baselineAdjustment
---

# `UILabel`: `baselineAdjustment` property

The **`baselineAdjustment`** property determines how text is placed vertically after the font size shrinks automatically.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'alignBaselines'` | The shrunken text keeps its baseline where the baseline was at the original font size. The baseline is the line the bottoms of letters align to |
| `'alignCenters'` | The shrunken text is centered vertically in the label |
| `'none'` | The shrunken text sits against the top of the label |

- Readable and writable.
- The default is `'alignBaselines'`.
- Only takes effect when [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) is `true`.

Neither the default nor the effect is **verified in the simulator**.

### Invalid values

Writing a value not in the table does not throw. The property keeps its previous value, and the console prints a warning:

```
[Nacre] baselineAdjustment has no value "middle"; expected one of: …, ignored
```

## Examples

```js
const label = new UILabel();
label.adjustsFontSizeToFitWidth = true;
label.baselineAdjustment = 'alignCenters';
```

**Effect**: After the font size shrinks, the text is centered vertically in the label. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.baselineAdjustment`. `UIBaselineAdjustmentAlignCenters` is written `'alignCenters'`, and likewise for the rest.

## See also

- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md)
