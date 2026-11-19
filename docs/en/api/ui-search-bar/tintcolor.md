---
type: reference
native: UISearchBar.tintColor
---

# `UISearchBar`: `tintColor` property

The **`tintColor`** property is the color of the cursor and buttons in the search bar.

## Value

A [color](../ui-color.md) string.

- Readable and writable.
- Reading it always returns a value. If it was never set, it is the color inherited from the enclosing views.
- Writing `null` restores the inherited color.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing an invalid color doesn't throw. The console prints a warning, and the value stays unchanged; see [colors](../ui-color.md#invalid-values-warn-instead-of-throwing).

## Examples

```js
const search = new UISearchBar();
search.tintColor = 'systemOrange';
```

**Effect**: The cursor and the cancel button turn orange. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.tintColor`.

## See also

- [`barTintColor`](bartintcolor.md)
