---
type: reference
native: UISearchBar.autocapitalizationType
---

# `UISearchBar`: `autocapitalizationType` property

The **`autocapitalizationType`** property sets the automatic capitalization rule. It is one of the search bar's nine keyboard settings.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'none'` | No automatic capitalization |
| `'words'` | Capitalizes the first letter of each word |
| `'sentences'` | Capitalizes the first letter of each sentence |
| `'allCharacters'` | Capitalizes all letters |

- Readable and writable.
- The default is `'sentences'`.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged. Writing `null` is also treated as invalid.

```
[Nacre] autocapitalizationType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.autocapitalizationType = 'none';
console.log(search.searchTextField.autocapitalizationType);
```

**Effect**: The first letter typed isn't capitalized automatically. Suited to searching content that isn't natural language, such as usernames or code. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.autocapitalizationType`. `UITextAutocapitalizationTypeNone` is written `'none'`, and likewise for the rest.

## See also

- [`autocapitalizationType` on `UITextField`](../ui-text-field/autocapitalizationtype.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
