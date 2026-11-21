---
type: reference
native: "UITextViewDelegate textView:shouldChangeTextInRange:replacementText:"
---

# `UITextView`: `beforeinput` event

The **`beforeinput`** event fires when the user's input is about to change the text view's content: a keystroke, a line break, a deletion, or a paste. Calling `preventDefault()` in a listener stops the change from happening.

## Syntax

```
input.addEventListener('beforeinput', (event) => { })
```

## Event object

`UITextViewBeforeInputEvent`. `type` is `'beforeinput'` and `target` is this text view. Cancelable (measured).

It also carries two read-only fields describing which stretch the change intends to replace with what (measured):

| Field | Type | Meaning |
| --- | --- | --- |
| `range` | [`NSRange`](../ns-range.md) | The stretch to be replaced. `location` is the start and `length` is the length, both in UTF-16 code units, matching JS string indices |
| `replacementString` | String | The text to put in its place |

What each kind of change looks like (from Apple's documentation, **not verified on a device**):

| User action | `range.length` | `replacementString` |
| --- | --- | --- |
| Type one character at the cursor | 0 | The character typed |
| Press Return for a line break | 0 | `'\n'` |
| Press Delete to delete one character | The length deleted | An empty string |
| Select a stretch and paste | The length of the selected stretch | The entire pasted content |

The content after the change is `input.text.slice(0, range.location) + replacementString + input.text.slice(range.location + range.length)`.

## When it fires

- Fires before each change the user makes. The system decides whether to make the change only after the listeners finish, so a blocked character never shows up first.
- If `preventDefault()` is called: the content does not change.
- If not: the change happens as usual, and [`input`](input-event.md) fires afterward.
- The fields listeners receive when the system asks, and the answer handed back to the system depending on whether `preventDefault()` was called, are verified by the acceptance tests by asking the way the system does. Real keyboard input is **not verified on a device**.
- Writing `text` from code and calling `insertText()` or `deleteBackward()` do not fire it. **Not verified on a device.**
- With input methods such as Pinyin, the Pinyin letters not yet converted to characters are also individual changes. How it fires in that case is **not verified on a device**, and blocking it may interrupt input.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event, and changes happen as usual (measured).
- It can be listened to alongside the scroll view events; the scroll events still fire as usual (measured).
- Exists on `UITextView` and [`UITextField`](../ui-text-field/beforeinput-event.md). Listening for it on other views does not throw; it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

### Limiting length

```js
const input = new UITextView();
const LIMIT = 200;
input.addEventListener('beforeinput', (event) => {
  const { range, replacementString } = event;
  const next = input.text.slice(0, range.location) + replacementString +
    input.text.slice(range.location + range.length);
  if (next.length > LIMIT) {
    event.preventDefault();
  }
});
```

**Effect**: Once the content holds 200 UTF-16 code units, further keystrokes do nothing. Pasting text that would make the total length exceed 200 inserts none of it. Deleting works as usual. **Not verified on a device.**

### Disallowing line breaks

```js
const input = new UITextView();
input.addEventListener('beforeinput', (event) => {
  if (event.replacementString.includes('\n')) {
    event.preventDefault();
  }
});
```

**Effect**: Pressing Return does nothing. If pasted content contains a line break, none of it is inserted. **Not verified on a device.**

## Corresponding iOS API

Returning `NO` from `textView:shouldChangeTextInRange:replacementText:` in `UITextViewDelegate` corresponds to calling `event.preventDefault()` here. The two arguments are in `event.range` and `event.replacementString`.

## See also

- [Limiting the input length](../../guides/multiline-text.md#limiting-the-input-length)
- [`input`](input-event.md): fires after the change
- [`NSRange`](../ns-range.md)
