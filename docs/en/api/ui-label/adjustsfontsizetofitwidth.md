---
type: reference
native: UILabel.adjustsFontSizeToFitWidth
---

# `UILabel`: `adjustsFontSizeToFitWidth` property

The **`adjustsFontSizeToFitWidth`** property determines whether the font size shrinks when the text does not fit.

## Value

A boolean.

- Readable and writable.
- The default is `false`.
- `true`: when the text does not fit, the font size shrinks until it fits or reaches the lower limit set by [`minimumScaleFactor`](minimumscalefactor.md). If it still does not fit at the lower limit, it is truncated according to [`lineBreakMode`](linebreakmode.md).
- `false`: the font size stays the same; text that does not fit is handled according to `lineBreakMode`.
- After shrinking, [`font`](font.md) still reads as the original font.

Neither the default nor the effect is **verified in the simulator**.

## Examples

```js
const label = new UILabel();
label.text = '¥ 1,234,567.89';
label.numberOfLines = 1;
label.adjustsFontSizeToFitWidth = true;
label.minimumScaleFactor = 0.5;
```

**Effect**: When the text fits, it is shown at the original font size. When it does not, the font size shrinks automatically until the whole line fits, down to at most half the original size. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.adjustsFontSizeToFitWidth`.

## See also

- [`minimumScaleFactor`](minimumscalefactor.md), [`baselineAdjustment`](baselineadjustment.md)
