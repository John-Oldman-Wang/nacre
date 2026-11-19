---
type: reference
native: UIAlertController.actions
---

# `UIAlertController`: `actions` property

The **`actions`** property is all the buttons added to the alert.

## Value

An array of [`UIAlertAction`](../ui-alert-action.md), in the order they were added.

- Read-only. Assigning to it throws `TypeError`. Add buttons with [`addAction()`](addaction.md).
- Defaults to an empty array.
- The buttons read back are the same objects that were added; listeners and your own data attached to them are still there, even if JS no longer kept a reference to them after adding.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Pick one', {
  preferredStyle: 'alert',
});
alert.addAction(UIAlertAction.actionWithTitle('OK', { style: 'default' }));
alert.addAction(UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' }));
console.log(alert.actions.map((a) => a.title).join(','));
```

**Result**: logs `OK,Cancel` to the console.

## Corresponding iOS API

`UIAlertController.actions`.

## See also

- [`addAction()`](addaction.md)
- [`UIAlertAction`](../ui-alert-action.md)
