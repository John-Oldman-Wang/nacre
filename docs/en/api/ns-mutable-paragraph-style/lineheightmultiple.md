---
type: reference
native: NSMutableParagraphStyle.lineHeightMultiple
---

# `NSMutableParagraphStyle`: `lineHeightMultiple` property

The **`lineHeightMultiple`** property is the line height as a multiple of the font's natural line height. `0` means no adjustment.

## Value

A number, a multiplier, unitless.

- Readable and writable.
- Defaults to `0`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writes are converted to a number with `Number()`; a value that can't be converted to a finite number throws `TypeError`. A negative number throws `TypeError`:

```
TypeError: lineHeightMultiple must be a non-negative number
```

## Examples

```js
const style = new NSMutableParagraphStyle();
style.lineHeightMultiple = 1.5;
console.log(style.lineHeightMultiple);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `1.5`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.lineHeightMultiple`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.lineHeightMultiple`](../ns-paragraph-style/lineheightmultiple.md)
