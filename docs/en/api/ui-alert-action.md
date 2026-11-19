---
type: reference
native: UIAlertAction
status: partial
---

# `UIAlertAction`

**`UIAlertAction`** represents a button on a [system alert](ui-alert-controller.md). A button has a title and a style. When the user taps it, the alert closes first, and then the button fires the [`click`](ui-alert-action/click-event.md) event.

Add buttons to an alert with [`addAction()`](ui-alert-controller/addaction.md). The title and style are given at creation and can't be changed afterward.

**Inheritance**: `EventTarget` → `NSObject` → `UIAlertAction`

For how to build common alerts with buttons, see the guide [Showing alerts and menus](../guides/alerts.md).

## Constructor

Can't be created with `new`. `new UIAlertAction()` throws `TypeError: Illegal constructor: UIAlertAction has no public initializer; use UIAlertAction.actionWithTitle(title, { style })`. Create one with the static method below.

## Static methods

[`UIAlertAction.actionWithTitle()`](ui-alert-action/actionwithtitle.md)

Creates a button with a title and a style.

## Instance properties

| Property | Description |
| --- | --- |
| [`title`](ui-alert-action/title.md) <small>read-only</small> | The text on the button |
| [`style`](ui-alert-action/style.md) <small>read-only</small> | The style: normal, cancel, or destructive |
| [`isEnabled`](ui-alert-action/isenabled.md) | Whether it can be tapped |

## Events

| Event | When it fires |
| --- | --- |
| [`click`](ui-alert-action/click-event.md) | The user taps this button. Fires after the alert closes |

This is the only name the system fires. Listening for other names doesn't throw: such a name is treated as a custom event and only fires when you dispatch it yourself with `dispatchEvent()`.

## The three button styles

| `style` | Effect |
| --- | --- |
| `'default'` | A normal button |
| `'cancel'` | Cancel. Its position is arranged by the system, not by the order buttons were added. At most one per alert. In an action sheet, tapping outside the menu is the same as tapping it |
| `'destructive'` | The title is red, indicating the action deletes something or can't be undone |

How the three styles look on screen is **not verified in the simulator**.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Delete this photo?', {
  preferredStyle: 'alert',
});
const remove = UIAlertAction.actionWithTitle('Delete', { style: 'destructive' });
remove.addEventListener('click', () => {
  console.log('photo deleted');
});
alert.addAction(UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' }));
alert.addAction(remove);
```

**Effect** (**not verified in the simulator**): Once presented, the bottom of the alert has "Cancel" and a red "Delete". Tap "Delete": the alert disappears and the console prints `photo deleted`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a) { … }]` | `const a = UIAlertAction.actionWithTitle('OK', { style: 'default' });`<br>`a.addEventListener('click', () => { … })` |
| `action.enabled = NO` | `action.isEnabled = false` |

## See also

- [`UIAlertController`](ui-alert-controller.md): the alert the button belongs to
- [Showing alerts and menus](../guides/alerts.md)
