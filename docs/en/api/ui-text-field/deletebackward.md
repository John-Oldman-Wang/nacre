---
type: reference
native: "-[UITextField deleteBackward]"
---

# `UITextField`: `deleteBackward()` method

The **`deleteBackward()`** method deletes the way the user presses the Delete key: if text is selected, it deletes the selection; otherwise, it deletes the one character before the cursor.

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

- When the cursor is at the start and no text is selected, it does nothing.
- When it deletes content, `input` fires once; `beforeinput` does not fire.
- It is written the same way as the method of the same name on [`UITextView`](../ui-text-view/deletebackward.md).

The behaviors above are **not verified in the simulator**.

## Examples

```js
const field = new UITextField();
field.text = 'abc';
field.selectedRange = new NSRange(3, 0);
field.deleteBackward();
console.log(field.text);
```

**Result**: Prints `ab`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UITextField deleteBackward]` (the `UIKeyInput` protocol).

## See also

- [`insertText()`](inserttext.md)
