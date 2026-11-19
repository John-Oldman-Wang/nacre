---
type: reference
native: NSMutableParagraphStyle.baseWritingDirection
---

# `NSMutableParagraphStyle`: `baseWritingDirection` property

The **`baseWritingDirection`** property is which side the paragraph starts from.

## Value

A string.

| Value | Effect |
| --- | --- |
| `'natural'` | Determined from the text content |
| `'leftToRight'` | Left to right |
| `'rightToLeft'` | Right to left |

- Readable and writable.
- Defaults to `'natural'`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writing a value not in the table doesn't throw: the property keeps its previous value and a warning is printed to the console:

```
[Nacre] baseWritingDirection has no value "up"; expected one of: natural / leftToRight / rightToLeft, ignored
```

## Examples

```js
const style = new NSMutableParagraphStyle();
style.baseWritingDirection = 'rightToLeft';
console.log(style.baseWritingDirection);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `rightToLeft`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.baseWritingDirection`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.baseWritingDirection`](../ns-paragraph-style/basewritingdirection.md)
