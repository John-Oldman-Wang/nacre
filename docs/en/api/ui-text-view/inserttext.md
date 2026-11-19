---
type: reference
native: "-[UITextView insertText:]"
---

# `UITextView`: `insertText()` method

The **`insertText()`** method inserts text as if the user typed it: at the cursor position, or, if text is selected, replacing the selection. The cursor moves to after the inserted content.

## Syntax

```
insertText(text)
```

### Parameters

**`text`**

The text to insert, a string. Other types are converted with `String()`; `null` and `undefined` are treated as the empty string.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- Fires `input` once, and also fires `selectionchange`. Inserting an empty string changes nothing but still fires `input` (measured).
- It still inserts when [`isEditable`](iseditable.md) is `false` (measured).
- Callbacks run a little later: on the line after calling `insertText()`, the `input` callback hasn't run yet.

## Examples

```js
const input = new UITextView();
input.text = 'Hello';
input.insertText('😀');
console.log(input.text);
```

**Result**: logs `Hello😀`. After `text` is written the cursor is at the end, so the emoji is inserted at the end.

## Corresponding iOS API

`-[UITextView insertText:]` (the `UIKeyInput` protocol).

## See also

- [`deleteBackward()`](deletebackward.md)
- [`input`](input-event.md) event
