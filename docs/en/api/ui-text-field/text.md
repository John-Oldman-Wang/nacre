---
type: reference
native: UITextField.text
---

# `UITextField`: `text` property

The **`text`** property is the entire content of the field.

## Value

A string.

- Readable and writable.
- The default is the empty string `''`. When there is no content it is `''`, not `null`, so you can read `length` directly.
- A written value that is not a string is converted to a string. Writing `null` or `undefined` gives `''`.
- Writing it replaces the whole content of the field.
- `input` fires when the user's input changes the content. Writing `text` from code fires neither `input` nor `beforeinput`. **That `input` does not fire is not verified in the simulator.** To make a change from code fire `input` too, use [`insertText()`](inserttext.md).
- If [`attributedText`](attributedtext.md) was written and then `text` is written, the text of `attributedText` changes to match. Whether the original styles are kept is **not verified in the simulator**.

## Examples

```js
const field = new UITextField();
field.text = 'Jo';
console.log(field.text.length);
```

**Result**: Prints `2`. The field shows "Jo".

## Corresponding iOS API

`UITextField.text`. `nil` reads as `''`.

## See also

- [`insertText()`](inserttext.md): changing the content the way the user types
- [`hasText`](hastext.md)
