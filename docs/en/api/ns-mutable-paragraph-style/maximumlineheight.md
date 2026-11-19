---
type: reference
native: NSMutableParagraphStyle.maximumLineHeight
---

# `NSMutableParagraphStyle`: `maximumLineHeight` property

The **`maximumLineHeight`** property is the upper limit of the line height. `0` means no limit.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writes are converted to a number with `Number()`; a value that can't be converted to a finite number throws `TypeError`. A negative number throws `TypeError`:

```
TypeError: maximumLineHeight must be a non-negative number
```

## Examples

```js
const style = new NSMutableParagraphStyle();
style.maximumLineHeight = 8;
console.log(style.maximumLineHeight);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `8`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.maximumLineHeight`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.maximumLineHeight`](../ns-paragraph-style/maximumlineheight.md)
