---
type: reference
native: UISearchBar.showsBookmarkButton
---

# `UISearchBar`: `showsBookmarkButton` property

The **`showsBookmarkButton`** property indicates whether a bookmark button is shown at the right end of the text field.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | A bookmark button is shown at the right end of the text field |
| `false` | Not shown |

- Readable and writable.
- The default is `false`.
- When the user taps the bookmark button, the search bar fires [`bookmarkclick`](bookmarkclick-event.md).
- It is independent of [`showsSearchResultsButton`](showssearchresultsbutton.md); both can be `true` at once. Which one is shown when both are on is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.showsBookmarkButton = true;
search.addEventListener('bookmarkclick', () => console.log('open bookmarks'));
```

**Effect**: A bookmark icon appears at the right end of the text field. Tapping it prints `open bookmarks` to the console. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.showsBookmarkButton`.

## See also

- [`bookmarkclick`](bookmarkclick-event.md) event
