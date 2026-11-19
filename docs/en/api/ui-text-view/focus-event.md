---
type: reference
native: "UITextViewDelegate textViewDidBeginEditing:"
---

# `UITextView`: `focus` event

The **`focus`** event fires when the text view becomes first responder and input begins.

## Syntax

```
input.addEventListener('focus', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is the text view. It carries neither the content nor what changed. It can't be canceled; `preventDefault()` has no effect.

## When it fires

- Fires when the user taps the text view. **Not verified in the simulator.**
- Fires when code calls `becomeFirstResponder()` and it succeeds (measured).
- When [`isEditable`](iseditable.md) is `false`, `becomeFirstResponder()` still returns `true`, but `focus` doesn't fire (measured, without a keyboard).
- Callbacks don't run synchronously at the moment the event happens; they run a little later. See [when callbacks run](../ui-control.md#when-callbacks-run).
- An exception thrown in a callback doesn't affect the text view, and other callbacks for the same event still run.

## Examples

```js
const input = new UITextView();
input.addEventListener('focus', () => console.log('Input began'));
```

**Effect**: when input begins in the text view, the console logs `Input began`.

## Corresponding iOS API

`textViewDidBeginEditing:` on `UITextViewDelegate`, or `UITextViewTextDidBeginEditingNotification`.

## See also

- [`blur`](blur-event.md)
