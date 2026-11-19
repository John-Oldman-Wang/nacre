---
type: reference
native: "-[UITextField insertText:]"
---

# `UITextField`: `insertText()` method

The **`insertText()`** method inserts text the way the user types: at the cursor position ([`selectedRange`](selectedrange.md)), or, if text is selected, in place of the selection. The cursor moves to the end of the inserted content.

## Syntax

```
insertText(text)
```

### Parameters

**`text`**

The text to insert, a string. Other types are converted with `String()`; `null` and `undefined` are treated as an empty string.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- Fires `input` once. Does not fire `beforeinput`: that event only asks about the user's input.
- It can be called when the text field is not being edited; it inserts at the `selectedRange` position. A text field that has never been edited has a `selectedRange` of `(0, 0)`, so the text is inserted at the start; to insert at the end, first set `selectedRange` to `new NSRange(field.text.length, 0)`.
- It is written the same way as the method of the same name on [`UITextView`](../ui-text-view/inserttext.md).

How it differs from writing `text` directly:

| | `field.text = …` | `insertText()` / `deleteBackward()` |
| --- | --- | --- |
| What changes | The whole content is replaced | Only the cursor or selection spot changes |
| Fires `input` | No | Yes |
| Fires `beforeinput` | No | No |

The `insertText()` behaviors listed above are **not verified in the simulator**.

## Examples

```js
const field = new UITextField();
field.text = 'Hello';
field.selectedRange = new NSRange(field.text.length, 0);
field.insertText(', world');
console.log(field.text);
```

**Result**: Prints `Hello, world`. **Not verified in the simulator**; the acceptance tests include corresponding assertions, but they have not been run since they were written.

## Corresponding iOS API

`-[UITextField insertText:]` (the `UIKeyInput` protocol).

## See also

- [`deleteBackward()`](deletebackward.md)
- [`text`](text.md): replacing the whole content
