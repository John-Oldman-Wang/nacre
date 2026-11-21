---
type: reference
native: "UITextFieldDelegate textFieldShouldEndEditing:"
---

# `UITextField`: `beforeblur` event

The **`beforeblur`** event fires when the text field is about to stop being first responder. Calling `preventDefault()` in a listener keeps focus on the text field.

## Syntax

```
field.addEventListener('beforeblur', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is this text field. Cancelable: `event.cancelable` is `true` and `preventDefault()` takes effect.

## When it fires

- Fires when code calls `resignFirstResponder()`; the listeners have finished running before that call returns.
- If `preventDefault()` is called: focus stays on the text field, the keyboard is not dismissed, and `resignFirstResponder()` returns `false`.
- If it is not called: focus is removed as usual, then `blur` fires.
- `view.endEditing(true)` is forced; how the system handles that case is **not verified in the simulator**.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists on `UITextField` and [`UITextView`](../ui-text-view/beforeblur-event.md). Listening for it on other controls does not throw, but the system never fires it there.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

```js
const field = new UITextField();
field.addEventListener('beforeblur', (event) => {
  if (field.text === '') event.preventDefault();
});
field.becomeFirstResponder();
console.log(field.resignFirstResponder());
```

**Effect**: The text field is empty, so the console prints `false`, focus stays on the text field, and the keyboard is not dismissed. Calling it again after entering some content prints `true`.

## Corresponding iOS API

Returning `NO` from `textFieldShouldEndEditing:` in `UITextFieldDelegate` corresponds to calling `event.preventDefault()` here.

## See also

- [`beforefocus`](beforefocus-event.md)
- [Focus](../ui-text-field.md#focus)
