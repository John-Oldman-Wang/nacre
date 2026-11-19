---
type: reference
native: UISearchBar.placeholder
---

# `UISearchBar`: `placeholder` property

The **`placeholder`** property is the gray text shown when the search bar is empty. It disappears when the user types the first character.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`.
- It is the same value as `placeholder` on [`searchTextField`](searchtextfield.md).
- There is no change event: only the app's own code changes it.

### `null` and the empty string

`null` and the empty string `''` both mean "no placeholder"; writing either one clears it.

Whether it reads back as `null` or `''` after clearing depends on which one the clearing write used. Once the search bar has no placeholder, writing the other one doesn't change what reads back. So to check whether there is a placeholder, use `!search.placeholder`, not `=== null`.

## Examples

### Showing placeholder text

```js
const search = new UISearchBar();
search.placeholder = 'Search cities';
```

**Effect**: When the text field is empty, it shows gray "Search cities".

### What reads back after clearing

```js
const search = new UISearchBar();
search.placeholder = 'Search cities';
search.placeholder = '';
console.log(search.placeholder === '');
search.placeholder = null;
console.log(search.placeholder === '');
```

**Result**: Prints `true` both times. When `null` is written the second time, the search bar already has no placeholder, so it still reads back as `''`.

## Corresponding iOS API

`UISearchBar.placeholder`.

## See also

- [`prompt`](prompt.md): has no such difference between `null` and the empty string
