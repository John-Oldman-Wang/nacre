---
type: reference
native: UISearchBar.translucent
---

# `UISearchBar`: `isTranslucent` property

The **`isTranslucent`** property indicates whether the search bar's background is translucent.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Translucent background |
| `false` | Opaque background |

- Readable and writable.
- The default is `true`.
- The on-screen difference between the two values is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.isTranslucent = false;
console.log(search.isTranslucent);
```

**Result**: Prints `false`.

## Corresponding iOS API

`UISearchBar.translucent` (the getter is `isTranslucent`).

## See also

- [`barTintColor`](bartintcolor.md)
