---
type: reference
native: NSMutableParagraphStyle.lineBreakMode
---

# `NSMutableParagraphStyle`: `lineBreakMode` property

The **`lineBreakMode`** property is what happens when a line doesn't fit. The values are the same as [`UILabel.lineBreakMode`](../ui-label/linebreakmode.md): `'byWordWrapping'`, `'byCharWrapping'`, `'byClipping'`, `'byTruncatingHead'`, `'byTruncatingTail'`, `'byTruncatingMiddle'`.

## Value

A string.

- Readable and writable.
- Defaults to `'byWordWrapping'`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writing an unrecognized value doesn't throw: the property keeps its previous value and a warning listing all valid values is printed to the console.

## Examples

```js
const style = new NSMutableParagraphStyle();
style.lineBreakMode = 'byTruncatingTail';
console.log(style.lineBreakMode);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `byTruncatingTail`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.lineBreakMode`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.lineBreakMode`](../ns-paragraph-style/linebreakmode.md)
