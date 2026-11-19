---
type: reference
native: "UITextFieldDelegate textFieldShouldBeginEditing:"
---

# `UITextField`: `beforefocus` event

The **`beforefocus`** event fires when the text field is about to become first responder: the user tapped it, or code called `becomeFirstResponder()`. Calling `preventDefault()` in a listener keeps the text field from entering editing, and the keyboard does not appear.

## Syntax

```
field.addEventListener('beforefocus', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is this text field. Cancelable: `event.cancelable` is `true` and `preventDefault()` takes effect.

## When it fires

- Fires when the user taps the text field or code calls `becomeFirstResponder()`. When called from code, the listeners have finished running before that call returns.
- If `preventDefault()` is called: editing does not begin, the keyboard does not appear, and `becomeFirstResponder()` returns `false`.
- If it is not called: focus happens as usual, then `focus` fires. The measured order is `beforefocus` → `focus`.
- Measured: when a listener throws, the text field still gets focus.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists only on `UITextField`. Listening for it on other controls does not throw, but the system never fires it there.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

```js
const field = new UITextField();
let locked = true;
field.addEventListener('beforefocus', (event) => {
  if (locked) event.preventDefault();
});
console.log(field.becomeFirstResponder());
```

**Result**: Prints `false`. The text field did not enter editing.

## Corresponding iOS API

Returning `NO` from `textFieldShouldBeginEditing:` in `UITextFieldDelegate` corresponds to calling `event.preventDefault()` here.

## See also

- [`beforeblur`](beforeblur-event.md)
- [Focus](../ui-text-field.md#focus)
