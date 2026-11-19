---
type: reference
native: UISearchBar.searchTextField
---

# `UISearchBar`: `searchTextField` property

The **`searchTextField`** property is the text field inside the search bar, a [`UITextField`](../ui-text-field.md).

## Value

A [`UITextField`](../ui-text-field.md).

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.
- It shares the same text and the same keyboard settings with the search bar: its `text` is the same value as the search bar's [`text`](text.md), and so is `placeholder`; for the nine keyboard settings (`keyboardType`, `returnKeyType`, …), whichever side you write, the other side reads the new value. So writing these on the search bar alone is enough.
- You need it for the text field members the search bar doesn't have, such as the font, the text color, and when the clear button is shown.
- Its `clearButtonMode` defaults to `'always'` (the clear button is always at the right end when there is content); a new `UITextField` defaults to `'never'`.
- When the search bar has focus, its `isFirstResponder` is also `true`.

> **Note:** To observe text changes, use the search bar's [`input`](input-event.md). `searchTextField` is a control, and listening for `input` on it also receives the user's typing, but whether it fires when the user taps the clear button is **not verified in the simulator**.

## Examples

```js
const search = new UISearchBar();
search.searchTextField.keyboardType = 'url';
console.log(search.keyboardType);
console.log(search.searchTextField.clearButtonMode);
```

**Result**: Prints `url` and then `always`.

## Corresponding iOS API

`UISearchBar.searchTextField`. The native type is `UISearchTextField`; here it is provided as a plain `UITextField`.

## See also

- [`UITextField`](../ui-text-field.md)
