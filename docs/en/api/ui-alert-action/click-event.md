---
type: reference
native: UIAlertAction handler
---

# `UIAlertAction`: `click` event

The **`click`** event fires when the user taps this alert button.

## Syntax

```
action.addEventListener('click', (event) => { })
```

## Event object

`Event`. `type` is `'click'` and `target` is the button; it carries no other data.

Not cancelable; `preventDefault()` has no effect: the alert has already closed when it fires.

## When it fires

- When the user taps this button, the system closes the alert first, then fires it. That the event fires after the alert closes is **not verified in the simulator**.
- Only the tapped button fires; the other buttons fire nothing.
- In an action sheet, tapping the empty area outside the menu is the same as tapping the cancel-style button, and that button fires. **Not verified in the simulator.**
- A disabled button can't be tapped and doesn't fire. **Not verified in the simulator.**
- When code closes the alert with [`dismissViewController()`](../ui-view-controller/dismissviewcontroller.md), no button fires. **Not verified in the simulator.**
- The callback doesn't run the moment the finger lifts; it runs a little later. See [When callbacks run](../ui-control.md#when-callbacks-run).
- A button with no listener can still be tapped; tapping it just closes the alert.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Delete this photo?', {
  preferredStyle: 'alert',
});
const remove = UIAlertAction.actionWithTitle('Delete', { style: 'destructive' });
remove.addEventListener('click', () => {
  console.log('photo deleted');
});
alert.addAction(remove);
```

**Effect** (**not verified in the simulator**): Once presented, tap "Delete": the alert disappears and the console prints `photo deleted`.

## Corresponding iOS API

The `handler` of `+[UIAlertAction actionWithTitle:style:handler:]`. Here there is no callback parameter; it becomes an event on the button.

## See also

- [`UIAlertAction.actionWithTitle()`](actionwithtitle.md)
- [When the alert closes](../ui-alert-controller.md#when-the-alert-closes)
