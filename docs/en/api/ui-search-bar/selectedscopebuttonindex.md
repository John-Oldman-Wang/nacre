---
type: reference
native: UISearchBar.selectedScopeButtonIndex
---

# `UISearchBar`: `selectedScopeButtonIndex` property

The **`selectedScopeButtonIndex`** property is the index of the selected scope button, counting from 0.

## Value

An integer, unitless.

- Readable and writable.
- The default is `0`.
- When the user taps a different scope button, the search bar fires [`scopechange`](scopechange-event.md). Writing it in code doesn't fire it.
- Writing an out-of-range value doesn't throw; the value is stored as is: with three buttons, writing `7` reads back `7`. Which button looks selected in that case is **not verified in the simulator**.
- Changing [`scopeButtonTitles`](scopebuttontitles.md) doesn't reset it to 0: if the index is `1` and you switch to two other titles, the index is still `1`. With only one title, the index becomes `0`.
- After the titles are cleared (writing `[]`), the index becomes `-1`.

So before using it to look up a title in `scopeButtonTitles`, check that it is in range.

### Invalid values

- Writing a value that can't be converted to a finite number throws `TypeError: selectedScopeButtonIndex must be a finite number, got undefined`, and the value stays unchanged.
- A string such as `'1'` is treated as a number; fractions are truncated toward zero.

## Examples

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['All', 'Mine', 'Shared'];
search.showsScopeBar = true;
search.selectedScopeButtonIndex = 2;

const i = search.selectedScopeButtonIndex;
const titles = search.scopeButtonTitles;
console.log(i >= 0 && i < titles.length ? titles[i] : 'none selected');
```

**Effect**: The third scope button becomes selected, and the console prints `Shared`. `scopechange` doesn't fire.

## Corresponding iOS API

`UISearchBar.selectedScopeButtonIndex`.

## See also

- [`scopechange`](scopechange-event.md) event
