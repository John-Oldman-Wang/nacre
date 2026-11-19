---
type: reference
native: UITextView.font
---

# `UITextView`: `font` property

The **`font`** property is the font of the text.

## Value

A [`UIFont`](../ui-font.md), or `null`.

- Readable and writable.
- The default value is `null`, meaning not set. In that case the system's default font is used, and the text is smaller than the system's standard 17 pt body text: measured with one line of text, the height the text view asks for is 30 pt; with 17 pt text it is 36 pt.
- Writing `null` reverts to not set.
- Always set it on a new text view.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.font = UIFont.systemFontOfSize(17);
```

**Effect**: the text uses the 17 pt system font.

## Corresponding iOS API

`UITextView.font`.

## See also

- [`UIFont`](../ui-font.md)
