---
type: reference
native: UISearchBar.keyboardAppearance
---

# `UISearchBar`: `keyboardAppearance` property

The **`keyboardAppearance`** property sets whether the keyboard is light or dark. It is one of the search bar's nine keyboard settings.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'default'` | Follows the system's current light or dark appearance |
| `'light'` | Always a light keyboard |
| `'dark'` | Always a dark keyboard |
| `'alert'` | The old name for `'dark'`. It can be written, and reads back as `'dark'` |

- Readable and writable.
- The default is `'default'`.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged. Writing `null` is also treated as invalid.

```
[Nacre] keyboardAppearance has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.keyboardAppearance = 'dark';
console.log(search.searchTextField.keyboardAppearance);
```

**Effect**: The keyboard is always dark. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.keyboardAppearance`. `UIKeyboardAppearanceDark` is written `'dark'`.

## See also

- [`keyboardAppearance` on `UITextField`](../ui-text-field/keyboardappearance.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
