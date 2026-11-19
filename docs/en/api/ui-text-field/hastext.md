---
type: reference
native: UITextField.hasText
---

# `UITextField`: `hasText` property

The **`hasText`** property indicates whether the text field has any content.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | There is content |
| `false` | The content is empty |

- Read-only; assigning to it throws `TypeError`.
- The default is `false`.
- There is no dedicated change notification; read it in the `input` callback.
- It is written the same way as the property of the same name on [`UITextView`](../ui-text-view.md).

## Examples

```js
const field = new UITextField();
field.text = 'a';
console.log(field.hasText);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UITextField.hasText` (the `UIKeyInput` protocol).

## See also

- [`text`](text.md)
