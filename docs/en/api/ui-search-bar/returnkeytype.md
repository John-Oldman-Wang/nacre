---
type: reference
native: UISearchBar.returnKeyType
---

# `UISearchBar`: `returnKeyType` property

The **`returnKeyType`** property sets the label on the return key. It is one of the search bar's nine keyboard settings.

## Value

A string. The values are the same as [`returnKeyType` on `UITextField`](../ui-text-field/returnkeytype.md).

- Readable and writable.
- The default is `'search'`: the return key reads Search. A new `UITextField` defaults to `'default'`.
- When the user presses the return key, the search bar fires [`search`](search-event.md). Whether tapping it still fires `search` after switching to another value is **not verified in the simulator**.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

### Invalid values

Writing a value that isn't in the table doesn't throw. The console prints a warning listing all valid values, and the value stays unchanged. Writing `null` is also treated as invalid.

```
[Nacre] returnKeyType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const search = new UISearchBar();
search.returnKeyType = 'go';
console.log(search.searchTextField.returnKeyType);
```

**Effect**: The return key's label changes to Go. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.returnKeyType`. `UIReturnKeyGo` is written `'go'`, and likewise for the rest.

## See also

- [`returnKeyType` on `UITextField`](../ui-text-field/returnkeytype.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
