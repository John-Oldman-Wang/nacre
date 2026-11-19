---
type: reference
native: UISearchBar.searchResultsButtonSelected
---

# `UISearchBar`: `isSearchResultsButtonSelected` property

The **`isSearchResultsButtonSelected`** property indicates whether the results list button is shown in its selected style.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The results list button is shown in its selected style |
| `false` | The normal style |

- Readable and writable.
- The default is `false`.
- Turning off [`showsSearchResultsButton`](showssearchresultsbutton.md) doesn't change it back to `false`.
- Tapping the results list button doesn't toggle it automatically; change it yourself in [`resultslistclick`](resultslistclick-event.md). **Not verified in the simulator.**
- The on-screen difference between the two styles is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.showsSearchResultsButton = true;
search.addEventListener('resultslistclick', () => {
  search.isSearchResultsButtonSelected = !search.isSearchResultsButtonSelected;
});
```

**Effect**: Each tap on the results list button toggles it between the selected and normal styles. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.searchResultsButtonSelected` (the getter is `isSearchResultsButtonSelected`).

## See also

- [`showsSearchResultsButton`](showssearchresultsbutton.md)
