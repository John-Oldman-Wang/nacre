---
type: reference
native: UISearchBar.scopeButtonTitles
---

# `UISearchBar`: `scopeButtonTitles` property

The **`scopeButtonTitles`** property holds the titles of the scope buttons, from left to right. The scope buttons are a row of segmented buttons below the text field, used to switch the search scope.

## Value

An array of strings.

- Readable and writable.
- The default is `[]`.
- Every read returns a new array. Changing that array doesn't affect the search bar; to change the titles, assign a whole new array.
- Writing `null` is the same as writing an empty array.
- Elements in the array that aren't strings are converted to strings.
- Setting the titles alone doesn't show the row: [`showsScopeBar`](showsscopebar.md) must also be `true`, and there must be at least two titles.
- Changing the titles affects [`selectedScopeButtonIndex`](selectedscopebuttonindex.md): with only one title it becomes `0`, when cleared it becomes `-1`, and otherwise it keeps its value.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't an array (a number, a string) throws `TypeError: scopeButtonTitles needs an array of strings or null`, and the value stays unchanged.

## Examples

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['All', 'Mine', 'Shared'];
search.showsScopeBar = true;
console.log(search.scopeButtonTitles.length);
```

**Effect**: A row of three buttons appears below the text field, with "All" selected. The console prints `3`.

## Corresponding iOS API

`UISearchBar.scopeButtonTitles`.

## See also

- [`showsScopeBar`](showsscopebar.md)
- [`selectedScopeButtonIndex`](selectedscopebuttonindex.md)
