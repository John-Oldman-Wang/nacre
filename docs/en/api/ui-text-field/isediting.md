---
type: reference
native: UITextField.editing
---

# `UITextField`: `isEditing` property

The **`isEditing`** property indicates whether the text field is being edited.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Being edited: the text field is first responder |
| `false` | Not being edited |

- Read-only; assigning to it throws `TypeError`.
- A new text field has `false`.
- `focus` fires when it becomes `true`, and `blur` fires when it becomes `false`.
- When `becomeFirstResponder()` is called directly in the `sceneconnect` callback, it is `true`, but `focus` does not fire (measured).

## Examples

```js
const field = new UITextField();
field.addEventListener('focus', () => console.log(field.isEditing));
field.addEventListener('blur', () => console.log(field.isEditing));
```

**Effect**: Prints `true` when the text field begins editing and `false` when editing ends.

## Corresponding iOS API

`UITextField.editing` (the getter is `isEditing`).

## See also

- [Focus](../ui-text-field.md#focus)
