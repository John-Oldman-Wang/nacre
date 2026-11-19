---
type: reference
native: "-[UITextView deleteBackward]"
---

# `UITextView`: `deleteBackward()` method

The **`deleteBackward()`** method deletes as if the user pressed the Delete key: if text is selected, it deletes the selection; otherwise it deletes the one character before the cursor.

## Syntax

```
deleteBackward()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- Fires `input` once when content is deleted. When the cursor is at the start and there's nothing to delete, it does nothing and doesn't fire (measured).
- It still deletes when [`isEditable`](iseditable.md) is `false` (measured).

## Examples

```js
const input = new UITextView();
input.text = 'abc';
input.deleteBackward();
console.log(input.text);
```

**Result**: logs `ab`.

## Corresponding iOS API

`-[UITextView deleteBackward]` (the `UIKeyInput` protocol).

## See also

- [`insertText()`](inserttext.md)
