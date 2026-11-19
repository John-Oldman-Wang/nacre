---
type: reference
native: UITextField.selectedTextRange
---

# `UITextField`: `selectedRange` property

The **`selectedRange`** property is the selected range in the text field. When no text is selected, it is the cursor position.

## Value

An [`NSRange`](../ns-range.md): `location` is the start and `length` is the length, in UTF-16 code units, the same as JS string indices. A `length` of 0 means no text is selected and there is only a cursor.

- Readable and writable.
- Each read returns a new `NSRange` whose fields are read-only.
- When writing, you can pass an `NSRange` or a plain object `{ location, length }`. The fields are converted to integers, with fractions truncated toward zero.
- It can be read and written even when the text field is not being edited, and a written value reads back (measured). In that case no cursor or selection highlight is visible on screen.
- [`selectionchange`](selectionchange-event.md) fires when the selection changes.

Its value in different situations:

| Situation | `selectedRange` |
| --- | --- |
| A new text field that has never been edited | `(0, 0)`. It stays `(0, 0)` after `text` is written from code; it does not move to the end |
| Writing `(0, 3)` while not editing | Reads back as `(0, 3)` |
| While editing | The cursor position on screen, or the selected stretch |

Whether a selection written while not editing is kept once the text field begins editing, and where the selection ends up after editing ends, is **not verified in the simulator**; do not rely on it. To control the cursor position the user sees, write it after the text field begins editing: after `becomeFirstResponder()` returns `true`, or in the `focus` callback.

Writing a range beyond the content does not throw (measured, while editing):

| Written when the content is 10 code units | Reads back as |
| --- | --- |
| `(100, 5)`: start out of range | `(10, 0)`, cursor at the end |
| `(2, 100)`: length out of range | `(2, 0)`, start unchanged, length becomes 0 |

So to select all, write `new NSRange(0, field.text.length)`; do not pass a very large length.

Placing the cursor between the two code units of an emoji does not throw and is not corrected; see [Selection and cursor](../ui-text-field.md#selection-and-cursor).

### Invalid values

- A missing field: `TypeError: selectedRange is missing length, or it is not a finite number`
- Not an object, including `null`: `TypeError: selectedRange needs an object with all of: location, length`
- A negative number: `TypeError: selectedRange.location must be a non-negative integer`

After it throws, the selection is unchanged.

## Examples

### Reading the selected text

```js
const field = new UITextField();
field.text = 'hello world';
field.selectedRange = new NSRange(0, 5);

const range = field.selectedRange;
console.log(range.location, range.length);
console.log(field.text.slice(range.location, range.location + range.length));
```

**Result**: Prints `0 5` and `hello`.

### Moving the cursor to the end

```js
const field = new UITextField();
field.text = 'hello';
field.selectedRange = { location: field.text.length, length: 0 };
```

**Effect**: The cursor is after `hello`. The cursor is visible on screen only while the text field is being edited.

## Corresponding iOS API

`UITextField.selectedTextRange`, then converted to offsets with `offsetFromPosition:toPosition:`. In JS it is directly an `NSRange` counted from the start of the content; there is no `UITextRange` or `UITextPosition`.

## See also

- The [`selectionchange`](selectionchange-event.md) event
- [`NSRange`](../ns-range.md)
- [`selectedRange` on `UITextView`](../ui-text-view/selectedrange.md): written the same way
