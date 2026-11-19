---
type: reference
native: NSMutableParagraphStyle.tailIndent
---

# `NSMutableParagraphStyle`: `tailIndent` property

The **`tailIndent`** property is the right edge of the lines. A positive number is measured from the left; `0` or a negative number is measured from the right, so `-16` leaves 16 pt on the right.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writes are converted to a number with `Number()`; a value that can't be converted to a finite number throws `TypeError`. Negative numbers are allowed.

## Examples

```js
const style = new NSMutableParagraphStyle();
style.tailIndent = -16;
console.log(style.tailIndent);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `-16`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.tailIndent`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.tailIndent`](../ns-paragraph-style/tailindent.md)
