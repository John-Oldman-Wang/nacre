---
type: reference
native: UISearchBar.autocorrectionType
---

# `UISearchBar`: `autocorrectionType` property

The **`autocorrectionType`** property sets whether autocorrection is on. It is one of the search bar's nine keyboard settings.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides based on what is typed |
| `'no'` | Doesn't automatically replace words the system thinks are misspelled |
| `'yes'` | Replaces them automatically |

- Readable and writable.
- The default is `'no'`: a search bar doesn't autocorrect by default. A new `UITextField` defaults to `'default'`.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged. Writing `null` is also treated as invalid.

```
[Nacre] autocorrectionType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.autocorrectionType = 'yes';
console.log(search.searchTextField.autocorrectionType);
```

**Effect**: While typing, the system automatically replaces misspelled words. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.autocorrectionType`. `UITextAutocorrectionTypeYes` is written `'yes'`, and likewise for the rest.

## See also

- [`autocorrectionType` on `UITextField`](../ui-text-field/autocorrectiontype.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
