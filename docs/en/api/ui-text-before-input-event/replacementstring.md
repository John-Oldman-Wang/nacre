---
type: reference
native: UITextBeforeInputEvent.replacementString
---

# `UITextBeforeInputEvent`: `replacementString` property

The **`replacementString`** property is the text that will be put in place of [`range`](range.md).

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- When typing, it is the character typed.
- When deleting, it is an empty string.
- When pasting, it is the whole pasted content.
- In a multiline input, pressing Return gives `'\n'`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const code = new UITextField();
code.addEventListener('beforeinput', (e) => {
  if (!/^[0-9]*$/.test(e.replacementString)) {
    e.preventDefault();
  }
});
```

**Effect**: only digits can be entered in `code`; typing letters or pasting content with letters does nothing. **Not verified in the simulator.**

## Corresponding iOS API

`string` of `textField:shouldChangeCharactersInRange:replacementString:`, and `text` of `textView:shouldChangeTextInRange:replacementText:`.

## See also

- [`UITextBeforeInputEvent`](../ui-text-before-input-event.md)
