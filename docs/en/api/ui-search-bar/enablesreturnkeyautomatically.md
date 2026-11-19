---
type: reference
native: UISearchBar.enablesReturnKeyAutomatically
---

# `UISearchBar`: `enablesReturnKeyAutomatically` property

The **`enablesReturnKeyAutomatically`** property sets whether the return key is grayed out when the field is empty. It is one of the search bar's nine keyboard settings.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The return key is grayed out and can't be pressed when the field is empty |
| `false` | The return key can always be pressed |

- Readable and writable.
- The default is `true`. A new `UITextField` defaults to `false`.
- Values of other types are converted to a boolean by truthiness.
- It is the same setting as the property of the same name on [`searchTextField`](searchtextfield.md): whichever side you write, the other side reads it.
- There is no change event: only the app's own code changes it, by writing the search bar's property or the property of the same name on `searchTextField`.
- The default and reads and writes were verified in the simulator (iPhone Air, iOS 27.2) and on a device (iPhone 14).

## Examples

```js
const search = new UISearchBar();
search.enablesReturnKeyAutomatically = false;
console.log(search.searchTextField.enablesReturnKeyAutomatically);
```

**Effect**: Search can be pressed even when nothing has been typed. **Not verified in the simulator.** The console prints the newly written value.

## Corresponding iOS API

`UISearchBar.enablesReturnKeyAutomatically`.

## See also

- [`enablesReturnKeyAutomatically` on `UITextField`](../ui-text-field/enablesreturnkeyautomatically.md): the property of the same name on the text field
- [`searchTextField`](searchtextfield.md)
