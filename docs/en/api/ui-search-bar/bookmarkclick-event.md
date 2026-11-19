---
type: reference
native: "UISearchBarDelegate searchBarBookmarkButtonClicked:"
---

# `UISearchBar`: `bookmarkclick` event

The **`bookmarkclick`** event fires when the user taps the bookmark button.

## Syntax

```
search.addEventListener('bookmarkclick', (event) => { })
```

## Event object

`Event`. It has only `type` (`'bookmarkclick'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- The bookmark button exists only when [`showsBookmarkButton`](showsbookmarkbutton.md) is `true`.
- It needs a real tap to fire and is **not verified in the simulator**.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.showsBookmarkButton = true;
search.addEventListener('bookmarkclick', () => console.log('open bookmarks'));
```

**Effect**: Tapping the bookmark button prints `open bookmarks` to the console. **Not verified in the simulator.**

## Corresponding iOS API

`searchBarBookmarkButtonClicked:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`showsBookmarkButton`](showsbookmarkbutton.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
