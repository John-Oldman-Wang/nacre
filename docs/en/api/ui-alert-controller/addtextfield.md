---
type: reference
native: "-[UIAlertController addTextFieldWithConfigurationHandler:]"
---

# `UIAlertController`: `addTextField()` method

The **`addTextField()`** method adds a text field to an alert box and returns it.

## Syntax

```
addTextField()
```

### Parameters

None.

### Return value

The newly added [`UITextField`](../ui-text-field.md). It is also the last item of [`textFields`](textfields.md).

Configure it as usual (`placeholder`, `isSecureTextEntry`, keyboard type…), and read the result from its `text` after the user taps a button.

### Exceptions

**`TypeError`**

Called on a bottom menu (`preferredStyle` is `'actionSheet'`): `addTextField: text fields can only be added to an alert whose preferredStyle is "alert"`.

## Description

- You can add several text fields; they are arranged top to bottom in the order added. **Not verified in the simulator.**
- The keyboard comes up when the alert box appears. **Not verified in the simulator.**

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Name this album', {
  preferredStyle: 'alert',
});
const field = alert.addTextField();
field.placeholder = 'Album name';

const save = UIAlertAction.actionWithTitle('Save', { style: 'default' });
save.addEventListener('click', () => {
  console.log('Name is', field.text);
});
alert.addAction(save);
```

**Effect** (**not verified in the simulator**)

- Once presented, the alert box has a text field below the title, showing "Album name" in gray.
- Type `Travel` and tap "Save": the alert box closes and the console logs `Name is Travel`.

## Corresponding iOS API

`-[UIAlertController addTextFieldWithConfigurationHandler:]`. ObjC hands the new text field to a configuration block; here it is the return value.

## See also

- [`textFields`](textfields.md)
- [`UITextField`](../ui-text-field.md)
