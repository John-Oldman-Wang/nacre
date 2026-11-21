---
type: reference
native: UITextView.markedTextRange
---

# `UITextView`: `markedTextRange` property

The **`markedTextRange`** property is the stretch of text in the text view that an input method is still composing. When nothing is being composed, it is `null`.

Composing is the stage of typing with an input method such as Pinyin before the user picks the characters. For example, to type `你` the user first types `ni`. At that point `ni` is already in the text view's content, the system underlines it, and the user picks a character from the candidates. Once a character is picked, the stretch is replaced by that character and composition ends.

## Value

An [`NSRange`](../ns-range.md) or `null`.

While composing, it is an `NSRange`: `location` is the start of the composing stretch and `length` is its length, in UTF-16 code units counted from the start of the content, the same as [`selectedRange`](selectedrange.md). So `input.text.slice(location, location + length)` is the Pinyin the user hasn't converted yet.

When nothing is being composed, it is `null`. It is also `null` when the text view is not being edited.

- Read-only. Assigning to it throws `TypeError`.
- Each read returns a new `NSRange`.
- The composing text is part of [`text`](text.md): after typing `ni`, `text` is `'ni'`.
- Every composing step fires [`input`](input-event.md); read this property in the callback to know whether the user is still composing.

Its value in different situations (measured):

| Situation | `markedTextRange` |
| --- | --- |
| Not editing | `null` |
| Typing `ni` into an empty text view | `(0, 2)`, and `text` is `'ni'` |
| Then typing `nih` | `(0, 3)` |
| In the callback of the `input` fired after typing `ni` | `(0, 2)` |
| After composition ends | `null` |

The table was measured by simulating composition from code the way an input method does it; it is **not verified with a real input method**.

## Examples

### Skipping composing input in search-as-you-type

```js
const input = new UITextView();

/** @param {string} query */
function search(query) {
  console.log('Search:', query);
}

input.addEventListener('input', () => {
  if (input.markedTextRange !== null) {
    return;
  }
  search(input.text);
});
```

**Effect**: When typing `你好` with Pinyin, the unconverted input `n`, `ni`, `nih` does not trigger a search; once the characters are picked and the content becomes `你好`, it prints `Search: 你好`. When typing on an English keyboard, every character triggers a search. **Not verified with a real keyboard or input method.**

### Reading the unconverted Pinyin

```js
const input = new UITextView();
input.addEventListener('input', () => {
  const range = input.markedTextRange;
  if (range !== null) {
    console.log(input.text.slice(range.location, range.location + range.length));
  }
});
```

**Effect**: While composing, each typed letter prints the Pinyin not yet converted, such as `ni` and `nih`. **Not verified with a real input method.**

## Corresponding iOS API

`UITextView.markedTextRange` (a property of the `UITextInput` protocol). In ObjC it is a `UITextRange`, converted to offsets with `offsetFromPosition:toPosition:`; in JS it is directly an `NSRange` counted from the start of the content, and `null` (`nil` in ObjC) when nothing is being composed.

## See also

- [`selectedRange`](selectedrange.md): the selected range, represented the same way
- The [`input`](input-event.md) event
- [`NSRange`](../ns-range.md)
- [`markedTextRange` on `UITextField`](../ui-text-field/markedtextrange.md): written the same way
