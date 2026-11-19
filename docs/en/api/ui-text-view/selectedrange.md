---
type: reference
native: UITextView.selectedRange
---

# `UITextView`: `selectedRange` property

The **`selectedRange`** property is the selected range in the text view. When no text is selected, it is the cursor position.

## Value

An [`NSRange`](../ns-range.md): `location` is the start and `length` is the length, in UTF-16 code units, the same as JS string indexes. A `length` of 0 means no text is selected, only a cursor.

- Readable and writable.
- The default value is `(0, 0)`.
- Each read returns a new `NSRange`.
- When writing, you can pass an `NSRange` or a plain object `{ location, length }`.
- It can be read and written even when input isn't in progress; there's no need to focus first.
- After writing [`text`](text.md), the cursor is at the end (measured).
- [`selectionchange`](selectionchange-event.md) fires when the selection changes.
- How the selected range looks on screen is **not verified in the simulator**.

Writing a range beyond the content doesn't throw (measured, with 10 characters of content):

| Written | Reads back as |
| --- | --- |
| `(100, 5)`: start out of range | `(10, 0)`, cursor at the end |
| `(2, 100)`: length out of range | `(2, 0)`, start unchanged, length becomes 0 |

### Invalid values

- Missing field: `TypeError: selectedRange is missing length, or it is not a finite number`
- Not an object: `TypeError: selectedRange needs an object with all of: location, length`
- Negative number: `TypeError: selectedRange.location must be a non-negative integer`

## Examples

```js
const input = new UITextView();
input.text = 'hello world';
input.selectedRange = new NSRange(0, 5);
const range = input.selectedRange;
console.log(input.text.slice(range.location, range.location + range.length));
input.selectedRange = new NSRange(0, input.text.length);
```

**Result**: logs `hello`. The last line selects all.

## Corresponding iOS API

`UITextView.selectedRange`. `NSMakeRange(0, 5)` is written `new NSRange(0, 5)`.

## See also

- [`NSRange`](../ns-range.md)
- [`selectionchange`](selectionchange-event.md) event
- [`selectedRange` on `UITextField`](../ui-text-field/selectedrange.md): used the same way
