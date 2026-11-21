---
type: reference
native: "UITextViewDelegate textViewShouldBeginEditing:"
---

# `UITextView`: `beforefocus` event

The **`beforefocus`** event fires when the text view is about to become the first responder and start input: the user tapped it, or code called `becomeFirstResponder()`. Calling `preventDefault()` in a listener keeps it from entering editing, and the keyboard doesn't appear.

The first responder is the view currently receiving keyboard input; there is only one at a time. The keyboard appears when the text view becomes the first responder and goes away when it stops being one; see [Focus](../ui-text-field.md#focus).

## Syntax

```
input.addEventListener('beforefocus', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is this text view (measured). Cancelable: `event.cancelable` is `true` and `preventDefault()` takes effect (measured).

## When it fires

- Fires when code calls `becomeFirstResponder()`; the listeners finish before that call returns (measured). It also fires when the user taps the text view; **not verified on a device**.
- If `preventDefault()` is called: it doesn't enter editing, the keyboard doesn't appear, `becomeFirstResponder()` returns `false`, and `isFirstResponder` stays `false` (measured).
- If not: it enters editing as usual, `becomeFirstResponder()` returns `true` (measured), and [`focus`](focus-event.md) fires afterward.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists on `UITextView` and [`UITextField`](../ui-text-field/beforefocus-event.md). Listening for it on other views does not throw; it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

```js
const input = new UITextView();
let locked = true;
input.addEventListener('beforefocus', (event) => {
  if (locked) event.preventDefault();
});
console.log(input.becomeFirstResponder());
```

**Result**: Prints `false`. The text view does not enter editing. After changing `locked` to `false`, calling it again prints `true`. These two results were measured on a text view placed in a window.

## Corresponding iOS API

Returning `NO` from `textViewShouldBeginEditing:` in `UITextViewDelegate` corresponds to calling `event.preventDefault()` here.

## See also

- [`beforeblur`](beforeblur-event.md)
- [`focus`](focus-event.md)
- [Focus](../ui-text-field.md#focus)
