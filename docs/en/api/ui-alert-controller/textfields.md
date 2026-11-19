---
type: reference
native: UIAlertController.textFields
---

# `UIAlertController`: `textFields` property

The **`textFields`** property is all the text fields added to an alert box.

## Value

An array of [`UITextField`](../ui-text-field.md), in the order they were added.

- Read-only. Assigning to it throws `TypeError`. Add text fields with [`addTextField()`](addtextfield.md).
- Defaults to an empty array. Always an empty array on a bottom menu.
- After the alert closes, the text fields are still there, and `text` is what the user typed. Read the results from here in a button's `click` callback.
- The text fields read back are the same objects `addTextField()` returned; your own data attached to them is still there.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Sign in', {
  preferredStyle: 'alert',
});
alert.addTextField().placeholder = 'Username';
alert.addTextField().placeholder = 'Password';
console.log(alert.textFields.length);
```

**Result**: logs `2` to the console.

## Corresponding iOS API

`UIAlertController.textFields`. In ObjC it is `nil` when there are no text fields; here it is an empty array.

## See also

- [`addTextField()`](addtextfield.md)
