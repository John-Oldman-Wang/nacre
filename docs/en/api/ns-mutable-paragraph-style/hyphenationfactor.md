---
type: reference
native: NSMutableParagraphStyle.hyphenationFactor
---

# `NSMutableParagraphStyle`: `hyphenationFactor` property

The **`hyphenationFactor`** property is how aggressively words are hyphenated. `0` means no hyphenation; `1` means hyphenate as much as possible.

## Value

A number, a ratio from 0 to 1.

- Readable and writable.
- Defaults to `0`.
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writes are converted to a number with `Number()`; a value that can't be converted to a finite number throws `TypeError`. A value outside 0 to 1 throws `TypeError`:

```
TypeError: hyphenationFactor must be between 0 and 1
```

## Examples

```js
const style = new NSMutableParagraphStyle();
style.hyphenationFactor = 1;
console.log(style.hyphenationFactor);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `1`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.hyphenationFactor`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.hyphenationFactor`](../ns-paragraph-style/hyphenationfactor.md)
