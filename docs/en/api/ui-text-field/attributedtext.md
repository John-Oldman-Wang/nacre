---
type: reference
native: UITextField.attributedText
---

# `UITextField`: `attributedText` property

The **`attributedText`** property is the styled content of the field: text in which each run carries its own font, color, and other attributes.

## Value

An [`NSAttributedString`](../ns-attributed-string.md), or `null`.

- Readable and writable.
- An empty text field reads as either `null` or an attributed string of length 0; the acceptance tests accept both.
- Reading it returns a snapshot; compare content with `isEqualToAttributedString()`.
- After writing it, [`text`](text.md) reads as its plain text. If `text` is written afterward, the text of `attributedText` changes to match; whether the original styles are kept is **not verified in the simulator**.
- Writing it from code does not fire `input`.

### Invalid values

Writing a value that is not an `NSAttributedString` (such as a string) throws a `TypeError` whose message contains `attributedText`.

## Examples

```js
const field = new UITextField();
field.attributedText = new NSAttributedString('13800138000', { kern: 2 });
console.log(field.text);
```

**Result**: Prints `13800138000`. The digits in the field have an extra 2 pt of spacing between them.

## Corresponding iOS API

`UITextField.attributedText`.

## See also

- [Attributed strings](../ns-attributed-string.md)
- [`text`](text.md)
