---
type: reference
native: "UITextFieldDelegate textFieldShouldClear:"
---

# `UITextField`: `beforeclear` event

The **`beforeclear`** event fires when the user taps the clear button on the right and the content is about to be cleared. Calling `preventDefault()` in a listener keeps the content.

## Syntax

```
field.addEventListener('beforeclear', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is this text field. Cancelable: `event.cancelable` is `true` and `preventDefault()` takes effect.

## When it fires

- Can fire only when the clear button is shown ([`clearButtonMode`](clearbuttonmode.md) is not `'never'`).
- If `preventDefault()` is called: the content is not cleared. **Not verified in the simulator.**
- Only a real touch triggers it; automated acceptance runs cannot trigger it, so it is **not verified in the simulator**.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists only on `UITextField`. Listening for it on other controls does not throw, but the system never fires it there.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

```js
const field = new UITextField();
field.clearButtonMode = 'whileEditing';
field.addEventListener('beforeclear', (event) => {
  if (field.text.length > 20) event.preventDefault();
});
```

**Effect**: When the content is longer than 20 characters, tapping the clear button does nothing. **Not verified in the simulator.**

## Corresponding iOS API

Returning `NO` from `textFieldShouldClear:` in `UITextFieldDelegate` corresponds to calling `event.preventDefault()` here.

## See also

- [`clearButtonMode`](clearbuttonmode.md)
