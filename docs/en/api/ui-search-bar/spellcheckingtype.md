---
type: reference
native: UISearchBar.spellCheckingType
---

# `UISearchBar`: `spellCheckingType` property

The **`spellCheckingType`** property sets whether spelling is checked. It is one of the search bar's nine keyboard settings.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'default'` | The system decides based on what is typed |
| `'no'` | Doesn't underline misspelled words in red |
| `'yes'` | Underlines them in red |

- Readable and writable.
- The default is `'default'`.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged. Writing `null` is also treated as invalid.

```
[Nacre] spellCheckingType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.spellCheckingType = 'no';
console.log(search.searchTextField.spellCheckingType);
```

**Effect**: Misspelled words aren't underlined in red. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.spellCheckingType`. `UITextSpellCheckingTypeNo` is written `'no'`, and likewise for the rest.

## See also

- [`spellCheckingType` on `UITextField`](../ui-text-field/spellcheckingtype.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
