---
type: reference
native: UILabel.minimumScaleFactor
---

# `UILabel`: `minimumScaleFactor` property

The **`minimumScaleFactor`** property is the smallest fraction of the original font size the font can shrink to during automatic shrinking.

## Value

A number, a ratio from 0 to 1, with no unit. `0.5` means it can shrink to half at most.

- Readable and writable.
- The default is `0`.
- Only takes effect when [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) is `true`.
- When using automatic shrinking, set it explicitly to a value greater than 0 to give the shrinking a lower limit.

Neither the default nor the effect is **verified in the simulator**.

### Invalid values

The value written is converted to a number with `Number()`. Values that cannot be converted to a finite number (`'abc'`, `undefined`) throw `TypeError`.

## Examples

```js
const label = new UILabel();
label.text = 'A title too long for one line';
label.adjustsFontSizeToFitWidth = true;
label.minimumScaleFactor = 0.5;
```

**Effect**: When it does not fit, the font size shrinks to at most half the original; if it still does not fit, it is truncated. **Not verified in the simulator.**

## Corresponding iOS API

`UILabel.minimumScaleFactor`.

## See also

- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md)
