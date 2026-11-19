---
type: reference
native: "UITextViewDelegate textViewDidEndEditing:"
---

# `UITextView`: `blur` event

The **`blur`** event fires when the text view stops being first responder and input ends. This is a good place to save the content.

## Syntax

```
input.addEventListener('blur', (event) => { })
```

## Event object

`Event`. `type` is the event name and `target` is the text view. It carries neither the content nor what changed. It can't be canceled; `preventDefault()` has no effect.

## When it fires

- Fires when code calls `resignFirstResponder()` (measured).
- Fires when the user drags the content to dismiss the keyboard ([`keyboardDismissMode`](../ui-scroll-view/keyboarddismissmode.md) is `'onDrag'`). **Not verified in the simulator.**
- Doesn't fire when [`isEditable`](iseditable.md) is `false` (measured, without a keyboard).
- Callbacks don't run synchronously at the moment the event happens; they run a little later. See [when callbacks run](../ui-control.md#when-callbacks-run).
- An exception thrown in a callback doesn't affect the text view, and other callbacks for the same event still run.

## Examples

```js
const input = new UITextView();
input.addEventListener('blur', () => console.log('You typed: ' + input.text));
```

**Effect**: when input ends, the console logs the full content.

## Corresponding iOS API

`textViewDidEndEditing:` on `UITextViewDelegate`, or `UITextViewTextDidEndEditingNotification`.

## See also

- [`focus`](focus-event.md)
