---
type: reference
native: UITextView.attributedText
---

# `UITextView`: `attributedText` property

The **`attributedText`** property is the styled content of the text view: a piece of text where each run carries its own attributes, such as font and color.

## Value

An [`NSAttributedString`](../ns-attributed-string.md), or `null`.

- Readable and writable.
- An empty text view reads as either `null` or an attributed string of length 0; the acceptance tests accept both.
- The value read is a snapshot and can't be modified (it isn't an `NSMutableAttributedString`).
- After writing it, [`text`](text.md) reads as its plain text. Writing `text` afterward changes the text and removes the previous styles (measured).
- Writing `null` clears it, and `text` becomes `''`.
- Writing it in code doesn't fire `input`.

### Invalid values

Writing a value that isn't an `NSAttributedString` (such as a string) throws `TypeError`, and the error message contains `attributedText`.

## Examples

```js
const input = new UITextView();
const styled = new NSMutableAttributedString('First\nSecond', { font: UIFont.systemFontOfSize(17) });
styled.addAttribute('backgroundColor', { value: 'systemYellow', range: new NSRange(0, 5) });
input.attributedText = styled;
console.log(input.text);
```

**Effect**: the console logs two lines: `First` and `Second`. The word "First" has a yellow background.

## Corresponding iOS API

`UITextView.attributedText`.

## See also

- [Attributed strings](../ns-attributed-string.md)
- [`text`](text.md)
