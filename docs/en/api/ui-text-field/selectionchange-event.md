---
type: reference
native: "UITextFieldDelegate textFieldDidChangeSelection:"
---

# `UITextField`: `selectionchange` event

The **`selectionchange`** event fires when the text field's selection or cursor position changes.

## Syntax

```
field.addEventListener('selectionchange', (event) => { })
```

## Event object

`Event`. `type` is `'selectionchange'` and `target` is this text field. The event object does not carry the selection; read [`selectedRange`](selectedrange.md) in the callback. Not cancelable: `event.cancelable` is `false`.

## When it fires

| Cause | Fires? |
| --- | --- |
| The user taps to move the cursor elsewhere, drags the selection, or double-taps to select a word | Yes. **Not verified in the simulator** |
| The user types or deletes (the cursor moves along) | Yes. **Not verified in the simulator** |
| Code writes `selectedRange` while the text field is being edited | Yes (measured) |
| Code writes `selectedRange` while the text field is not being edited | **Not verified in the simulator**; do not rely on it firing or not firing |
| The text field begins or ends editing, or code writes `text` | **Not verified in the simulator**; do not rely on it firing or not firing |

- The callback does not run synchronously at the moment the selection changes; it runs a little later, see [When callbacks run](../ui-control.md#when-callbacks-run). The callback reads the selection as of when it runs, not as of when the event occurred.
- When the selection changes several times in a row, the callback may run several times, each time reading the latest selection.
- With no listeners there is no overhead.

## Examples

```js
const field = new UITextField();
field.addEventListener('selectionchange', (event) => {
  const range = field.selectedRange;
  console.log(event.type, event.target === field, range.location, range.length);
});
```

**Effect**: Prints one line each time the selection changes; the first two items are `selectionchange` and `true`.

## Corresponding iOS API

`textFieldDidChangeSelection:` in `UITextFieldDelegate`.

## See also

- [`selectedRange`](selectedrange.md)
- [`selectionchange` on `UITextView`](../ui-text-view/selectionchange-event.md)
