---
type: reference
native: "UISearchBarDelegate searchBarResultsListButtonClicked:"
---

# `UISearchBar`: `resultslistclick` event

The **`resultslistclick`** event fires when the user taps the results list button.

## Syntax

```
search.addEventListener('resultslistclick', (event) => { })
```

## Event object

`Event`. It has only `type` (`'resultslistclick'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- The results list button exists only when [`showsSearchResultsButton`](showssearchresultsbutton.md) is `true`.
- It needs a real tap to fire and is **not verified in the simulator**.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.showsSearchResultsButton = true;
search.addEventListener('resultslistclick', () => console.log('show results list'));
```

**Effect**: Tapping the results list button prints `show results list` to the console. **Not verified in the simulator.**

## Corresponding iOS API

`searchBarResultsListButtonClicked:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`isSearchResultsButtonSelected`](issearchresultsbuttonselected.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
