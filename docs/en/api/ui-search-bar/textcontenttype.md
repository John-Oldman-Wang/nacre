---
type: reference
native: UISearchBar.textContentType
---

# `UISearchBar`: `textContentType` property

The **`textContentType`** property sets what kind of content the field holds; the system uses it to offer AutoFill. It is one of the search bar's nine keyboard settings.

## Value

A string, or `null`. The values are the same as [`textContentType` on `UITextField`](../ui-text-field/textcontenttype.md), 48 in all.

- Readable and writable.
- The default is `null`, meaning not set.
- Writing `null` clears it.
- It doesn't change how the keyboard looks.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged.

```
[Nacre] textContentType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.textContentType = 'username';
console.log(search.searchTextField.textContentType);
```

**Effect**: The system treats this search bar as a place to enter a username and may offer saved accounts above the keyboard. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.textContentType`. `UITextContentTypeUsername` is written `'username'`, and `nil` is written `null`.

## See also

- [`textContentType` on `UITextField`](../ui-text-field/textcontenttype.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
