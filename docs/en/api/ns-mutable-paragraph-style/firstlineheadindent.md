---
type: reference
native: NSMutableParagraphStyle.firstLineHeadIndent
---

# `NSMutableParagraphStyle`: `firstLineHeadIndent` property

The **`firstLineHeadIndent`** property is how far the first line is indented from the left.

## Value

A number, in [pt](../units.md).

- Readable and writable.
- Defaults to `0`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writes are converted to a number with `Number()`; a value that can't be converted to a finite number throws `TypeError`. A negative number throws `TypeError`:

```
TypeError: firstLineHeadIndent must be a non-negative number
```

## Examples

```js
const style = new NSMutableParagraphStyle();
style.firstLineHeadIndent = 8;
console.log(style.firstLineHeadIndent);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `8`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.firstLineHeadIndent`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.firstLineHeadIndent`](../ns-paragraph-style/firstlineheadindent.md)
