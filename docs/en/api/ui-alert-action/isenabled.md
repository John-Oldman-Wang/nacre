---
type: reference
native: UIAlertAction.enabled
---

# `UIAlertAction`: `isEnabled` property

The **`isEnabled`** property decides whether the alert button can be tapped.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Can be tapped |
| `false` | The button is gray and can't be tapped. Tapping it doesn't close the alert and doesn't fire `click`. **Not verified in the simulator** |

- Readable and writable.
- The default is `true`.
- Non-boolean values are converted with `Boolean(v)`.
- Changing it while the alert is on screen also takes effect.
- No event fires when it changes: only the app itself can change it.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Name this album', {
  preferredStyle: 'alert',
});
const field = alert.addTextField();
const save = UIAlertAction.actionWithTitle('Save', { style: 'default' });
alert.addAction(save);

save.isEnabled = false;
field.addEventListener('input', () => {
  save.isEnabled = field.text.length > 0;
});
```

**Effect** (**not verified in the simulator**): Once presented, "Save" is gray and can't be tapped. When there is text in the text field, "Save" becomes tappable; delete all the text and it turns gray again.

## Corresponding iOS API

`UIAlertAction.enabled`. In JS it is called `isEnabled`.

## See also

- [`click`](click-event.md)
