---
type: reference
native: UITextView.hasText
---

# `UITextView`: `hasText` property

The **`hasText`** property indicates whether the text view has any content.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | There is content |
| `false` | The content is empty |

- Read-only; assigning to it throws `TypeError`.
- The default value is `false`.
- There is no separate change notification; read it in the `input` callback.

## Examples

```js
const input = new UITextView();
input.text = 'a';
console.log(input.hasText);
```

**Result**: logs `true`.

## Corresponding iOS API

`UITextView.hasText` (the `UIKeyInput` protocol).

## See also

- [`text`](text.md)
