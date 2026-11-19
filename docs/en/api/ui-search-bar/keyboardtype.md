---
type: reference
native: UISearchBar.keyboardType
---

# `UISearchBar`: `keyboardType` property

The **`keyboardType`** property sets which keyboard appears. It is one of the search bar's nine keyboard settings.

## Value

A string. The values are the same as [`keyboardType` on `UITextField`](../ui-text-field/keyboardtype.md); see that page for which keyboard each value shows.

- Readable and writable.
- The default is `'default'`: the standard keyboard for the current input method.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged. Writing `null` is also treated as invalid.

```
[Nacre] keyboardType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.keyboardType = 'emailAddress';
console.log(search.searchTextField.keyboardType);
```

**Effect**: Tapping the search bar shows the email keyboard, which has `@` and `.` keys. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.keyboardType`. `UIKeyboardTypeURL` is written `'url'`, and likewise for the rest.

## See also

- [`keyboardType` on `UITextField`](../ui-text-field/keyboardtype.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
