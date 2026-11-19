---
type: reference
native: UISearchBar.secureTextEntry
---

# `UISearchBar`: `isSecureTextEntry` property

The **`isSecureTextEntry`** property sets whether typed characters are shown as dots. It is one of the search bar's nine keyboard settings.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Typed content is shown as dots |
| `false` | Shown normally |

- Readable and writable.
- The default is `false`.
- Values of other types are converted to a boolean by truthiness.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

## Examples

```js
const search = new UISearchBar();
search.isSecureTextEntry = true;
console.log(search.searchTextField.isSecureTextEntry);
```

**Effect**: Typed characters are shown as dots. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.secureTextEntry` (the getter is `isSecureTextEntry`).

## See also

- [`isSecureTextEntry` on `UITextField`](../ui-text-field/issecuretextentry.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
