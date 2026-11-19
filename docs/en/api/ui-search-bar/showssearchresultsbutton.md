---
type: reference
native: UISearchBar.showsSearchResultsButton
---

# `UISearchBar`: `showsSearchResultsButton` property

The **`showsSearchResultsButton`** property indicates whether a results list button is shown at the right end of the text field.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | A results list button is shown at the right end of the text field |
| `false` | Not shown |

- Readable and writable.
- The default is `false`.
- When the user taps the results list button, the search bar fires [`resultslistclick`](resultslistclick-event.md).
- It is independent of [`showsBookmarkButton`](showsbookmarkbutton.md); both can be `true` at once. Which one is shown when both are on is **not verified in the simulator**.
- Turning it off doesn't change [`isSearchResultsButtonSelected`](issearchresultsbuttonselected.md) back to `false`.
- Values of other types are converted to a boolean by truthiness.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.showsSearchResultsButton = true;
search.addEventListener('resultslistclick', () => console.log('show results list'));
```

**Effect**: A results list button appears at the right end of the text field. Tapping it prints `show results list` to the console. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.showsSearchResultsButton`.

## See also

- [`isSearchResultsButtonSelected`](issearchresultsbuttonselected.md)
- [`resultslistclick`](resultslistclick-event.md) event
