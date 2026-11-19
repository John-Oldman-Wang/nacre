---
type: reference
native: NSMutableParagraphStyle.allowsDefaultTighteningForTruncation
---

# `NSMutableParagraphStyle`: `allowsDefaultTighteningForTruncation` property

The **`allowsDefaultTighteningForTruncation`** property is whether, before text is truncated, the system first tries tightening the letter spacing a little.

## Value

A boolean.

`true`: tighten the letter spacing first, and don't truncate if the text fits after tightening. `false`: don't tighten; truncate directly.

- Readable and writable.
- Defaults to `false` (**not verified in the simulator**).
- When a paragraph style is put into an attributed string, a copy of it at that moment is stored. Changing this property afterward doesn't affect attributed strings already created; create a new attributed string and give it to the view again.

### Invalid values

Writes are converted with `Boolean()`.

## Examples

```js
const style = new NSMutableParagraphStyle();
style.allowsDefaultTighteningForTruncation = true;
console.log(style.allowsDefaultTighteningForTruncation);
const text = new NSAttributedString('First line\nSecond line', { paragraphStyle: style });
```

**Result**: The console prints `true`. The two lines in the attributed string are laid out with this setting; the on-screen effect is **not verified in the simulator**.

## Corresponding iOS API

`NSMutableParagraphStyle.allowsDefaultTighteningForTruncation`.

## See also

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.allowsDefaultTighteningForTruncation`](../ns-paragraph-style/allowsdefaulttighteningfortruncation.md)
