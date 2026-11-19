---
type: reference
native: UISearchBar.showsScopeBar
---

# `UISearchBar`: `showsScopeBar` property

The **`showsScopeBar`** property indicates whether the scope bar, the row of scope buttons below the text field, is shown.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Shows the scope bar. With two or more titles, the height the search bar wants becomes 111 pt |
| `false` | Not shown |

- Readable and writable.
- The default is `false`.
- It can be written even when there are no titles; the height doesn't change.
- When positioning with `frame`, call `sizeToFit()` again after changing it; see [Size](../ui-search-bar.md#size).
- Writing it directly shows or hides the bar immediately. For an animation, use [`setShowsScopeBar()`](setshowsscopebar.md).
- Values of other types are converted to a boolean by truthiness.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['All', 'Mine'];
search.showsScopeBar = true;
console.log(search.intrinsicContentSize.height);
```

**Effect**: Two scope buttons appear below the text field. The console prints `111`.

## Corresponding iOS API

`UISearchBar.showsScopeBar`.

## See also

- [`scopeButtonTitles`](scopebuttontitles.md)
- [`setShowsScopeBar()`](setshowsscopebar.md)
