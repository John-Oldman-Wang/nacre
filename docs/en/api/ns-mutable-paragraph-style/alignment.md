---
type: reference
native: NSMutableParagraphStyle.alignment
---

# `NSMutableParagraphStyle`: `alignment` property

The **`alignment`** property is how text in the paragraph is aligned.

## Value

A string.

| Value | Effect |
| --- | --- |
| `'left'` | Left |
| `'center'` | Centered |
| `'right'` | Right |
| `'justified'` | Justified |
| `'natural'` | Follows the writing direction of the text: left for left-to-right languages, right for right-to-left languages |

- Readable and writable.
- Defaults to `'natural'`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writing a value not in the table doesn't throw: the property keeps its previous value and a warning is printed to the console:

```
[Nacre] alignment has no value "middle"; expected one of: left / center / right / justified / natural, ignored
```

## Examples

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
console.log(style.alignment);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `center`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.alignment`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.alignment`](../ns-paragraph-style/alignment.md)
