---
type: reference
native: "UITextViewDelegate textViewDidChange:"
---

# `UITextView`: `input` event

The **`input`** event fires when the content of the text view is changed by user input or by `insertText()` or `deleteBackward()`.

## Syntax

```
input.addEventListener('input', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is the text view. It carries neither the content nor what changed. It can't be canceled; `preventDefault()` has no effect.

## When it fires

| How it changed | Fires? |
| --- | --- |
| The user types, deletes, or pastes | Yes (**not verified in the simulator**) |
| [`insertText()`](inserttext.md), [`deleteBackward()`](deletebackward.md) | Yes (measured). Inserting an empty string also fires it; `deleteBackward()` doesn't fire it when nothing was deleted |
| Writing [`text`](text.md) or [`attributedText`](attributedtext.md) | No (measured) |

- A character can't be intercepted before it is entered. Length limits can only be enforced afterward by truncating in the callback.
- Callbacks don't run synchronously at the moment the event happens; they run a little later. See [when callbacks run](../ui-control.md#when-callbacks-run).
- An exception thrown in a callback doesn't affect the text view, and other callbacks for the same event still run.

## Examples

```js
const input = new UITextView();
const LIMIT = 200;
input.addEventListener('input', () => {
  if (input.text.length > LIMIT) {
    input.text = input.text.slice(0, LIMIT);
  }
});
```

**Effect**: when the content exceeds 200 UTF-16 code units, the excess is removed. Writing `text` doesn't fire `input`, so the callback doesn't run again because of it. The user first sees the extra characters, which then disappear (**not verified in the simulator**).

## Corresponding iOS API

`textViewDidChange:` on `UITextViewDelegate`, or `UITextViewTextDidChangeNotification`.

## See also

- [`text`](text.md)
