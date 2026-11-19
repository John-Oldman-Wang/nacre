---
type: reference
native: "UITextFieldDelegate textFieldShouldReturn:"
---

# `UITextField`: `beforereturn` event

The **`beforereturn`** event fires when the user presses the Return key and the text field is about to handle it the default way. Calling `preventDefault()` in a listener keeps the text field from handling it the default way.

## Syntax

```
field.addEventListener('beforereturn', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is this text field. Cancelable: `event.cancelable` is `true` and `preventDefault()` takes effect.

## When it fires

- Fires when the user presses the Return key, before `return`. `beforereturn` can be canceled; `return` is an after-the-fact notification and cannot be canceled.
- If `preventDefault()` is called: the text field does not handle this Return the default way. **Not verified in the simulator.** Whether `return` still fires after canceling is **not verified in the simulator**.
- Only real keyboard input triggers it; automated acceptance runs cannot trigger it, so it is **not verified in the simulator**.
- If you just want to do something when Return is pressed (dismiss the keyboard, submit), listening for `return` is enough.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists only on `UITextField`. Listening for it on other controls does not throw, but the system never fires it there.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

```js
const field = new UITextField();
field.addEventListener('beforereturn', (event) => {
  if (field.text === '') event.preventDefault();
});
```

**Effect**: When the field is empty, pressing Return does nothing. **Not verified in the simulator.**

## Corresponding iOS API

Returning `NO` from `textFieldShouldReturn:` in `UITextFieldDelegate` corresponds to calling `event.preventDefault()` here. Dismissing the keyboard in that method corresponds to listening for `return` here and calling `resignFirstResponder()`.

## See also

- [`returnKeyType`](returnkeytype.md)
