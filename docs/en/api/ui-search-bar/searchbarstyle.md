---
type: reference
native: UISearchBar.searchBarStyle
---

# `UISearchBar`: `searchBarStyle` property

The **`searchBarStyle`** property determines whether the search bar has its own background.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'default'` | Currently the same as `'prominent'` |
| `'prominent'` | The search bar has its own background |
| `'minimal'` | No background, only the inner text field |

- Readable and writable.
- The default is `'default'`.
- The on-screen differences between the values are **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table doesn't throw. The console prints a warning, and the value stays unchanged.

```
[Nacre] searchBarStyle has no value "compact"; expected one of: default / prominent / minimal, ignored
```

## Examples

```js
const search = new UISearchBar();
search.searchBarStyle = 'minimal';
```

**Effect**: The search bar's own background disappears, leaving only the inner text field. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.searchBarStyle`. `UISearchBarStyleMinimal` is written `'minimal'`, and likewise for the rest.

## See also

- [`barStyle`](barstyle.md)
