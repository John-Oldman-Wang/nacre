---
type: reference
native: UITextView.editable
---

# `UITextView`: `isEditable` property

The **`isEditable`** property indicates whether the user can change the content.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The user can change the content |
| `false` | The user can't change it, and tapping it doesn't bring up the keyboard. Text can still be selected with a long press and copied, and content taller than the view can still be scrolled. **Not verified in the simulator** |

- Readable and writable.
- The default value is `true`.
- It restricts only the user. Code can still change the content by writing `text` or calling `insertText()` and `deleteBackward()` (measured).
- It is linked with [`isSelectable`](isselectable.md): writing `isEditable = true` also makes `isSelectable` `true`; writing `isEditable = false` leaves `isSelectable` unchanged (measured).
- When it is `false`, `becomeFirstResponder()` still returns `true`, but `focus` doesn't fire, and `blur` doesn't fire on losing focus either (measured, without a keyboard).
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.isEditable = false;
input.text = 'A long piece of explanatory text…';
console.log(input.isSelectable);
```

**Effect**: the console logs `true`. Tapping it doesn't bring up the keyboard, but the user can select text. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.editable` (the getter is `isEditable`).

## See also

- [`isSelectable`](isselectable.md)
