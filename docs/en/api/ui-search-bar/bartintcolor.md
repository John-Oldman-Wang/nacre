---
type: reference
native: UISearchBar.barTintColor
---

# `UISearchBar`: `barTintColor` property

The **`barTintColor`** property is the search bar's own background color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default is `null`, meaning the system background.
- Writing `null` restores the system background.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the value stays unchanged; see [colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const search = new UISearchBar();
search.barTintColor = '#F2F2F7';
```

**Effect**: The search bar's background turns light gray. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.barTintColor`.

## See also

- [`tintColor`](tintcolor.md)
- [`searchBarStyle`](searchbarstyle.md)
