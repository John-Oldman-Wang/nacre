---
type: reference
native: UISearchBar.enabled
---

# `UISearchBar`: `isEnabled` property

The **`isEnabled`** property indicates whether the search bar can be tapped and typed into.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Can be tapped and typed into |
| `false` | The search bar doesn't receive touches: `isUserInteractionEnabled` becomes `false` along with it, and so does `isEnabled` on the inner text field. Tapping it does nothing and the keyboard doesn't appear |

- Readable and writable.
- The default is `true`.
- How it looks when disabled is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.isEnabled = false;
console.log(search.isUserInteractionEnabled, search.searchTextField.isEnabled);
```

**Result**: Prints `false false`. Tapping the search bar does nothing. Writing `true` back restores it.

## Corresponding iOS API

`UISearchBar.enabled` (the getter is `isEnabled`).

## See also

- [`searchTextField`](searchtextfield.md)
