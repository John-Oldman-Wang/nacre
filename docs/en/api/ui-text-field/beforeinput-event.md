---
type: reference
native: "UITextFieldDelegate textField:shouldChangeCharactersInRange:replacementString:"
---

# `UITextField`: `beforeinput` event

The **`beforeinput`** event fires when the user's input is about to change the content: a keystroke, a deletion, or a paste. Calling `preventDefault()` in a listener stops the change from happening.

## Syntax

```
field.addEventListener('beforeinput', (event) => { })
```

## Event object

`UITextFieldBeforeInputEvent`. `type` is `'beforeinput'` and `target` is this text field. Cancelable.

It also carries two read-only fields describing which stretch the change intends to replace with what:

| Field | Type | Meaning |
| --- | --- | --- |
| `range` | [`NSRange`](../ns-range.md) | The stretch to be replaced. `location` is the start and `length` is the length, both in UTF-16 code units, matching JS string indices |
| `replacementString` | String | The text to put in its place |

What each of the three kinds of change looks like (from Apple's documentation, **not verified in the simulator**):

| User action | `range.length` | `replacementString` |
| --- | --- | --- |
| Type one character at the cursor | 0 | The character typed |
| Press Delete to delete one character | The length deleted | An empty string |
| Select a stretch and paste | The length of the selected stretch | The entire pasted content |

The content after the change is `field.text.slice(0, range.location) + replacementString + field.text.slice(range.location + range.length)`.

## When it fires

- Fires before each change the user makes. The system decides whether to make the change only after the listeners finish, so a blocked character never shows up first.
- If `preventDefault()` is called: the content does not change.
- Writing `text` from code and calling `insertText()` or `deleteBackward()` do not fire it. The latter two are **not verified in the simulator**.
- Only real keyboard input triggers it; automated acceptance runs cannot trigger it, so it is **not verified in the simulator**.
- With input methods such as Pinyin, the Pinyin letters not yet converted to characters are also individual changes. How it fires in that case is **not verified in the simulator**, and blocking it may interrupt input.
- Listeners run on the spot. After firing the event, the system waits for all listeners to finish before deciding whether to proceed.
- When an event has several listeners, the system does not proceed if any one of them calls `preventDefault()`.
- If a listener throws, the other listeners for the same event still run. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app). Throwing is not the same as calling `preventDefault()`.
- After the last listener is removed, the system no longer fires this event.
- Exists on `UITextField` and [`UITextView`](../ui-text-view/beforeinput-event.md). Listening for it on other controls does not throw, but the system never fires it there.

> **Note:** The system waits while listeners run. In a listener, only make the decision; do not do slow work.

## Examples

### Limiting length

```js
const field = new UITextField();
field.addEventListener('beforeinput', (event) => {
  const { range, replacementString } = event;
  const next = field.text.slice(0, range.location) + replacementString +
    field.text.slice(range.location + range.length);
  if (next.length > 6) {
    event.preventDefault();
  }
});
```

**Effect**: Once the text field holds 6 characters, further keystrokes do nothing. Pasting text that would make the total length exceed 6 inserts none of it. Deleting works as usual. **Not verified in the simulator.**

### Digits only

```js
const field = new UITextField();
field.addEventListener('beforeinput', (event) => {
  if (/[^0-9]/.test(event.replacementString)) {
    event.preventDefault();
  }
});
```

**Effect**: Digit keys type as usual; other keys do nothing. If pasted content contains even one non-digit character, none of it is inserted. **Not verified in the simulator.**

## Corresponding iOS API

Returning `NO` from `textField:shouldChangeCharactersInRange:replacementString:` in `UITextFieldDelegate` corresponds to calling `event.preventDefault()` here. The two arguments are in `event.range` and `event.replacementString`.

## See also

- [Limiting input length or filtering characters](../../guides/text-fields.md#limiting-input-length-or-filtering-characters)
- [`NSRange`](../ns-range.md)
