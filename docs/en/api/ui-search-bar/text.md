---
type: reference
native: UISearchBar.text
---

# `UISearchBar`: `text` property

The **`text`** property is the text in the search bar.

## Value

A string.

- Readable and writable.
- The default is the empty string `''`, not `null`.
- Writing `null` or `undefined` gives `''`; writing a number gives its string form.
- It is the same text as `text` on [`searchTextField`](searchtextfield.md).
- When the user changes the text (typing, deleting, tapping the clear button), the search bar fires [`input`](input-event.md). Writing `text` in code doesn't fire it, so changing `text` in an `input` callback doesn't cause a loop.

## Examples

```js
const search = new UISearchBar();
search.text = 'beijing';
console.log(search.text);
```

**Effect**: `beijing` appears in the text field, and the console prints `beijing`. `input` doesn't fire.

## Corresponding iOS API

`UISearchBar.text`. `nil` reads as `''`.

## See also

- [`input`](input-event.md) event
- [`placeholder`](placeholder.md)
