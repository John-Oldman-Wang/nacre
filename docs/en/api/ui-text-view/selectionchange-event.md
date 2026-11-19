---
type: reference
native: "UITextViewDelegate textViewDidChangeSelection:"
---

# `UITextView`: `selectionchange` event

The **`selectionchange`** event fires when the selection or cursor position in the text view changes.

## Syntax

```
input.addEventListener('selectionchange', (event) => { })
```

## Event object

`Event`. `type` is `'selectionchange'` and `target` is the text view. The event object doesn't carry the selection; read [`selectedRange`](selectedrange.md). It can't be canceled; `event.cancelable` is `false`.

## When it fires

| Cause | Fires? |
| --- | --- |
| The user taps to move the cursor elsewhere, drags the selection, or double-taps to select a word | Yes. **Not verified in the simulator** |
| The user types or deletes (the cursor moves along) | Yes. **Not verified in the simulator** |
| Code calls `insertText()` (the cursor moves to after the inserted content) | Yes (measured) |
| Code writes `selectedRange` | Yes, even when input isn't in progress (measured) |
| Code writes `text` (afterward the cursor is at the end) | **Not verified in the simulator**; don't rely on it firing or not firing |

- Callbacks run a little later and read the selection as of the moment they run, not as of the moment the event happened.
- When the selection changes several times in a row, the callback may run several times, and each time reads the latest selection.
- There is no cost when there are no listeners.

## Examples

```js
const input = new UITextView();
input.text = 'hello world';
input.addEventListener('selectionchange', (event) => {
  console.log(event.type, event.target === input, String(input.selectedRange));
});
input.selectedRange = new NSRange(2, 3);
```

**Result**: logs `selectionchange true NSRange(2, 3)`.

## Corresponding iOS API

`textViewDidChangeSelection:` on `UITextViewDelegate`.

## See also

- [`selectedRange`](selectedrange.md)
- [`selectionchange` on `UITextField`](../ui-text-field/selectionchange-event.md)
