---
type: reference
native: NSTextContainer.maximumNumberOfLines
---

# `NSTextContainer`: `maximumNumberOfLines` property

The **`maximumNumberOfLines`** property is the maximum number of lines laid out.

## Value

A non-negative integer, the number of lines.

- Readable and writable.
- Defaults to `0`, meaning no limit.
- Lines beyond the limit aren't shown; `text` itself isn't truncated.
- Fractions are truncated toward zero.
- Measured: with six lines of 17 pt text, the text view's preferred height is 138 pt without a line limit and 57 pt when limited to two lines. For it to get shorter, also set `isScrollEnabled` to `false`.
- No change event: only the app's own code changes it.

### Invalid values

A negative number throws `TypeError: maximumNumberOfLines must be a non-negative integer`.

## Examples

```js
const input = new UITextView();
input.isScrollEnabled = false;
input.textContainer.maximumNumberOfLines = 3;
input.textContainer.lineBreakMode = 'byTruncatingTail';
```

**Effect**: only the first three lines are laid out, and when the third line doesn't fit it ends with an ellipsis. **The ellipsis is not verified in the simulator.**

## Corresponding iOS API

`NSTextContainer.maximumNumberOfLines`.

## See also

- [`lineBreakMode`](linebreakmode.md)
