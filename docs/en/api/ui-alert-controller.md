---
type: reference
native: UIAlertController
status: partial
---

# `UIAlertController`

**`UIAlertController`** represents a system alert: a title, a message, and some buttons. The alert covers the current UI and disappears only after the user taps one of its buttons. An alert has two [styles](#the-two-styles), chosen at creation: an alert box in the middle of the screen, and a menu that rises from the bottom of the screen.

Each button on the alert is a [`UIAlertAction`](ui-alert-action.md). Whichever button the user taps fires a [`click`](ui-alert-action/click-event.md) event; the alert itself has no events.

An alert is a [view controller](ui-view-controller.md). It has no "show" method of its own; present it with the view controller's [`presentViewController()`](ui-view-controller/presentviewcontroller.md). The alert's appearance is decided by the system; the App only provides the text and the buttons.

> **Note:** creation, reading and writing properties, and errors were verified in the acceptance tests in the simulator (iPhone Air, iOS 27.2). What it looks like on screen and what happens after a button is tapped can only be verified by someone actually tapping, and are all **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UIAlertController`

For how to make alert boxes, bottom menus, and alerts with text fields, see the guide [Showing alerts and menus](../guides/alerts.md).

## Constructor

Can't be created with `new`. `new UIAlertController()` throws `TypeError: Illegal constructor: UIAlertController has no public initializer; use UIAlertController.alertControllerWithTitle(title, { message, preferredStyle })`. Create one with the static method below.

## Static methods

[`UIAlertController.alertControllerWithTitle()`](ui-alert-controller/alertcontrollerwithtitle.md)

Creates an alert with a title, a message, and a style.

## Instance properties

Also inherits the properties of [`UIViewController`](ui-view-controller.md). The alert's title is the inherited [`title`](ui-view-controller/title.md).

| Property | Description |
| --- | --- |
| [`message`](ui-alert-controller/message.md) | The message below the title |
| [`preferredStyle`](ui-alert-controller/preferredstyle.md) <small>read-only</small> | The style: alert box or bottom menu |
| [`severity`](ui-alert-controller/severity.md) | The severity |
| [`actions`](ui-alert-controller/actions.md) <small>read-only</small> | All buttons added |
| [`preferredAction`](ui-alert-controller/preferredaction.md) | The button shown in bold in an alert box |
| [`textFields`](ui-alert-controller/textfields.md) <small>read-only</small> | All text fields added |

## Instance methods

Also inherits the methods of [`UIViewController`](ui-view-controller.md). To close the alert from code, use the inherited [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md).

| Method | Description |
| --- | --- |
| [`addAction()`](ui-alert-controller/addaction.md) | Adds a button |
| [`addTextField()`](ui-alert-controller/addtextfield.md) | Adds a text field; only alert boxes can have them |

## Events

The alert has no events of its own. To find out which button the user tapped, listen for [`click`](ui-alert-action/click-event.md) on that button.

| Event | When it fires |
| --- | --- |
| `traitchange` | Inherited from [`UIViewController`](ui-view-controller.md): the [appearance traits](ui-trait-collection.md) changed. **Not verified in the simulator** on an alert |

The view controller dismissal events [`beforedismiss`](ui-view-controller/beforedismiss-event.md), [`dismiss`](ui-view-controller/dismiss-event.md), and [`dismissattempt`](ui-view-controller/dismissattempt-event.md) never fire on an alert, in either style: the system doesn't let an alert report that it was dismissed. Listening for them doesn't throw; they are treated as custom events and only fire when you dispatch them yourself with `dispatchEvent()`.

## The two styles

| `preferredStyle` | Where it appears | Can it have text fields? | Suited to |
| --- | --- | --- | --- |
| `'alert'` | The middle of the screen | Yes | Telling the user something; asking the user to confirm; asking the user to type a short piece of text |
| `'actionSheet'` | Rises from the bottom of the screen | No; calling `addTextField()` throws `TypeError` | Choosing one of several actions |

The style is given at creation and can't be changed afterward.

## When the alert closes

Whichever button on the alert the user taps, the system closes the alert. The App can't make a button "not close when tapped".

- The tapped button fires `click` once after the alert closes; the other buttons fire nothing. **Not verified in the simulator.**
- A button with no listener can still be tapped; tapping it just closes the alert.
- A disabled button can't be tapped: tapping it doesn't close the alert and fires no event. **Not verified in the simulator.**
- Closing the alert from code with [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md) doesn't count as tapping a button; no button fires an event. **Not verified in the simulator.**
- A bottom menu can be closed by tapping outside it. That is the same as tapping the button with the cancel style, and that button fires its event. **Not verified in the simulator.**
- An alert box can't be closed by tapping outside it. The user has no way to close an alert box with no buttons; only code can close it. **Not verified in the simulator.**
- After the alert closes, the text fields in `textFields` are still there, and their `text` is what the user typed.

## Examples

### Asking whether to delete

Starting from a blank App, put a button on the view controller. Tapping it shows an alert box asking the user whether to delete.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Delete photo', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    const alert = UIAlertController.alertControllerWithTitle('Delete this photo?', {
      message: 'This can\'t be undone.',
      preferredStyle: 'alert',
    });
    const cancel = UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' });
    const remove = UIAlertAction.actionWithTitle('Delete', { style: 'destructive' });
    remove.addEventListener('click', () => {
      console.log('Photo deleted');
    });
    alert.addAction(cancel);
    alert.addAction(remove);
    page.presentViewController(alert, { animated: true });
  });
});
```

**Effect** (**not verified in the simulator**)

- Near the top left of the view controller is a button with blue text, "Delete photo".
- Tapping it shows an alert box in the middle of the screen, titled "Delete this photo?", with a line of message below it and two buttons at the bottom: "Cancel" and a red "Delete".
- Tapping "Delete" closes the alert box and the console logs `Photo deleted`.
- Tapping "Cancel" closes the alert box and the console logs nothing.

For more patterns, see the guide [Showing alerts and menus](../guides/alerts.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIAlertController alertControllerWithTitle:@"Title" message:@"Message" preferredStyle:UIAlertControllerStyleAlert]` | `UIAlertController.alertControllerWithTitle('Title', { message: 'Message', preferredStyle: 'alert' })` |
| `[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:^(UIAlertAction *a) { … }]` | `const a = UIAlertAction.actionWithTitle('OK', { style: 'default' });`<br>`a.addEventListener('click', () => { … })` |
| `[alert addAction:action]` | `alert.addAction(action)` |
| `[alert addTextFieldWithConfigurationHandler:^(UITextField *f) { f.placeholder = @"Name"; }]` | `const f = alert.addTextField();`<br>`f.placeholder = 'Name'` |
| `alert.textFields.firstObject.text` | `alert.textFields[0].text` |
| `alert.preferredAction = action` | `alert.preferredAction = action` |
| `action.enabled = NO` | `action.isEnabled = false` |
| `[self presentViewController:alert animated:YES completion:nil]` | `page.presentViewController(alert, { animated: true })` |

## See also

- [Showing alerts and menus](../guides/alerts.md): showing a one-line message, waiting for the user to choose, entering text, disabling buttons
- [`UIAlertAction`](ui-alert-action.md): the buttons on an alert
- [`UIViewController`](ui-view-controller.md): the alert's parent class. Presenting, dismissing, and who presented whom
- [`UITextField`](ui-text-field.md): the type of the text fields in an alert
- [`UIActivityViewController`](ui-activity-view-controller.md): the system share sheet, another system view controller in the same group
- [Enums](enums.md): string values of enums, and what happens when one is wrong
