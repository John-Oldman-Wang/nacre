---
type: reference
native: UITextView.text
---

# `UITextView`: `text` property

The **`text`** property is the full content of the text view.

## Value

A string; line breaks are `\n`.

- Readable and writable.
- The default value is the empty string `''`. With no content it is `''`, not `null`.
- Writing `null` or `undefined` gives `''`.
- After writing, the cursor is at the end of the content (measured).
- [`input`](input-event.md) fires when user input changes the content. Writing `text` in code doesn't fire `input` (measured). So after writing `text`, update any UI that depends on the content yourself; writing `text` in an `input` callback doesn't trigger the callback again.
- Writing `text` after [`attributedText`](attributedtext.md) has been written removes the previous styles (measured).

## Examples

```js
const input = new UITextView();
input.text = 'Line 1\nLine 2';
console.log(input.text.length, input.hasText);
```

**Result**: logs `13 true`. The text view shows two lines of text.

## Corresponding iOS API

`UITextView.text`.

## See also

- [`insertText()`](inserttext.md): change the content as if the user typed it
- [`input`](input-event.md) event
