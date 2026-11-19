---
type: reference
native: "UISearchBarDelegate searchBar:selectedScopeButtonIndexDidChange:"
---

# `UISearchBar`: `scopechange` event

The **`scopechange`** event fires when the user taps a different scope button.

## Syntax

```
search.addEventListener('scopechange', (event) => { })
```

## Event object

`Event`. It has only `type` (`'scopechange'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- Read the new index from [`selectedScopeButtonIndex`](selectedscopebuttonindex.md).
- Writing `selectedScopeButtonIndex` in code doesn't fire it.
- It needs a real tap to fire and is **not verified in the simulator**.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['All', 'Mine', 'Shared'];
search.showsScopeBar = true;
search.addEventListener('scopechange', () => {
  console.log('scope', search.selectedScopeButtonIndex);
});
```

**Effect**: Tapping "Mine" prints `scope 1` to the console. **Not verified in the simulator.**

## Corresponding iOS API

`searchBar:selectedScopeButtonIndexDidChange:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`scopeButtonTitles`](scopebuttontitles.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
