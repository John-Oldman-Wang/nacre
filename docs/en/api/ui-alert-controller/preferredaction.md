---
type: reference
native: UIAlertController.preferredAction
---

# `UIAlertController`: `preferredAction` property

The **`preferredAction`** property is the button shown in bold in an alert box. It is also what pressing Return triggers when a keyboard is attached.

## Value

A [`UIAlertAction`](../ui-alert-action.md), or `null`.

- Readable and writable.
- Defaults to `null`: no bold button.
- Must be a button already added to this alert with [`addAction()`](addaction.md), so set it after `addAction()`.
- The bold appearance on screen and the Return key behavior are **not verified in the simulator**.
- No event fires when it changes: only the App itself can change it.

### Invalid values

- Neither a `UIAlertAction` nor `null`: throws `TypeError`.
- A button that isn't in this alert: throws `TypeError: preferredAction must be one of this alert's actions; add it with addAction() first`.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Save changes?', {
  preferredStyle: 'alert',
});
const save = UIAlertAction.actionWithTitle('Save', { style: 'default' });
alert.addAction(UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' }));
alert.addAction(save);
alert.preferredAction = save;
```

**Effect** (**not verified in the simulator**): the title of "Save" in the alert box is shown in bold. When a keyboard is attached, pressing Return is the same as tapping it.

## Corresponding iOS API

`UIAlertController.preferredAction`.

## See also

- [`addAction()`](addaction.md)
