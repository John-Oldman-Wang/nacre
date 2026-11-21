---
type: reference
native: "UITextViewDelegate textViewShouldEndEditing:"
---

# `UITextView`: `beforeblur` event

The **`beforeblur`** event fires when the text view is about to stop being the first responder and end input. Calling `preventDefault()` in a listener keeps the focus on the text view.

The first responder is the view currently receiving keyboard input; see [`beforefocus`](beforefocus-event.md).

## Syntax

```
input.addEventListener('beforeblur', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is this text view. Cancelable: `event.cancelable` is `true` and `preventDefault()` takes effect (measured).

## When it fires

- Fires when code calls `resignFirstResponder()`; the listeners finish before that call returns (measured). It also fires when a user action unfocuses it (such as dragging the text down to dismiss the keyboard); **not verified on a device**.
- If `preventDefault()` is called: the focus stays on the text view, the keyboard doesn't go away, `resignFirstResponder()` returns `false`, and `isFirstResponder` stays `true` (measured).
- If not: it loses focus as usual, `resignFirstResponder()` returns `true` (measured), and [`blur`](blur-event.md) fires afterward.
- `view.endEditing(true)` is forced; how the system handles it then is **not verified on a device**.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists on `UITextView` and [`UITextField`](../ui-text-field/beforeblur-event.md). Listening for it on other views does not throw; it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

```js
const input = new UITextView();
input.addEventListener('beforeblur', (event) => {
  if (input.text.trim() === '') event.preventDefault();
});
input.becomeFirstResponder();
console.log(input.resignFirstResponder());
```

**Effect**: When the text view is in a window and empty, the console prints `false`, the focus stays on the text view, and the keyboard doesn't go away. After typing something, calling it again prints `true`.

## Corresponding iOS API

Returning `NO` from `textViewShouldEndEditing:` in `UITextViewDelegate` corresponds to calling `event.preventDefault()` here.

## See also

- [`beforefocus`](beforefocus-event.md)
- [`blur`](blur-event.md)
- [Focus](../ui-text-field.md#focus)
