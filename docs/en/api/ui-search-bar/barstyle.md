---
type: reference
native: UISearchBar.barStyle
---

# `UISearchBar`: `barStyle` property

The **`barStyle`** property is the search bar's light or dark style.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'default'` | Follows the system's light or dark appearance |
| `'black'` | A dark bar |

- Readable and writable.
- The default is `'default'`.
- The on-screen difference between the two values is **not verified in the simulator**.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table doesn't throw. The console prints a warning, and the value stays unchanged.

```
[Nacre] barStyle has no value "blackTranslucent"; expected one of: default / black, ignored
```

## Examples

```js
const search = new UISearchBar();
search.barStyle = 'black';
console.log(search.barStyle);
```

**Result**: Prints `black`.

## Corresponding iOS API

`UISearchBar.barStyle`. `UIBarStyleBlackOpaque` and `UIBarStyleBlackTranslucent` have been deprecated since iOS 13 and have no corresponding value.

## See also

- [`searchBarStyle`](searchbarstyle.md)
