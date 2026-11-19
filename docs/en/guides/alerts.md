# Showing alerts and menus

This guide shows how to use the system alert controller [`UIAlertController`](../api/ui-alert-controller.md) and its buttons, [`UIAlertAction`](../api/ui-alert-action.md), to notify the user, ask for confirmation, offer a choice among several actions, and collect a line of text.

## Recommended approach

- **Create a new alert controller each time you need one, and do not keep it afterward.** The text and buttons on an alert usually depend on the data at that moment. Creating one is cheap.
- **When the user must make a decision, include a cancel-style button.** The system puts the cancel button where users expect it; in an action sheet, it also gives "tapping outside" somewhere to go. An alert controller can have only one cancel-style button.
- **Use the `'destructive'` style for buttons that delete things.** The system shows its title in red. **Not verified in the simulator.**
- **Use an alert for a one-sentence message and an action sheet for choosing among several actions.** Text fields can only be added to alerts.
- **Listen on the buttons, not on the alert controller.** The alert controller itself has no events. Each button fires its own [`click`](../api/ui-alert-action/click-event.md), so the callback does not need to check which one it was.
- **Do not use the view controller dismissal events to learn that an alert closed.** The [`dismiss`](../api/ui-view-controller/dismiss-event.md) group of events never fires on alert controllers; listening for them does not throw, but nothing arrives. An alert closes in only two ways: the user taps a button, in which case that button fires its event; or code calls [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md), in which case await the promise it returns.

## First alert

Starting from a blank app, put a button on the page. Tapping it shows an alert asking whether to delete.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Delete Photo', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    // 1. Create the alert controller: title, message, style
    const alert = UIAlertController.alertControllerWithTitle('Delete this photo?', {
      message: 'This cannot be undone.',
      preferredStyle: 'alert',
    });

    // 2. Create two buttons
    const cancel = UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' });
    const remove = UIAlertAction.actionWithTitle('Delete', { style: 'destructive' });

    // 3. What tapping "Delete" does. "Cancel" only needs to close the alert, so no listener
    remove.addEventListener('click', () => {
      console.log('Photo deleted');
    });

    // 4. Add the buttons to the alert controller
    alert.addAction(cancel);
    alert.addAction(remove);

    // 5. Present it from the current view controller
    page.presentViewController(alert, { animated: true });
  });
});
```

**Effect** (**not verified in the simulator**)

- The top left of the page has a button with blue text, "Delete Photo".
- Tapping it shows an alert in the middle of the screen with the title "Delete this photo?", a line of message below it, and two buttons at the bottom: "Cancel" and a red "Delete".
- Tapping "Delete" closes the alert, and the console logs `Photo deleted`.
- Tapping "Cancel" closes the alert, and nothing is logged.

The examples below reuse `page` from here. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
```

## Showing a one-sentence message

```js
const notice = UIAlertController.alertControllerWithTitle('Save Failed', {
  message: 'The network connection was lost. Please try again later.',
  preferredStyle: 'alert',
});
notice.addAction(UIAlertAction.actionWithTitle('OK', { style: 'default' }));
page.presentViewController(notice, { animated: true });
```

**Effect** (**not verified in the simulator**): an alert appears in the middle of the screen with a single button, "OK". Tapping it closes the alert.

Buttons such as "OK" and "Cancel" that only close the alert need no listener.

## Waiting for the user's choice before continuing

You can wrap the button events in a promise so the caller can `await` the user's choice.

```js
/**
 * @param {UIViewController} from
 * @param {string} title
 * @param {string} message
 * @returns {Promise<boolean>}
 */
function confirm(from, title, message) {
  return new Promise((resolve) => {
    const alert = UIAlertController.alertControllerWithTitle(title, {
      message,
      preferredStyle: 'alert',
    });
    const no = UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' });
    const yes = UIAlertAction.actionWithTitle('OK', { style: 'default' });
    no.addEventListener('click', () => resolve(false));
    yes.addEventListener('click', () => resolve(true));
    alert.addAction(no);
    alert.addAction(yes);
    from.presentViewController(alert, { animated: true });
  });
}

async function logOut() {
  if (await confirm(page, 'Sign out?', 'You will need to enter your password again.')) {
    console.log('Signed out');
  }
}
```

**Effect** (**not verified in the simulator**): calling `logOut()` shows an alert. Tapping "OK" logs `Signed out`; tapping "Cancel" logs nothing.

Listen on both buttons: if you listen only on "OK", the promise never settles when the user taps "Cancel".

## Letting the user choose among several actions

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
const saveToAlbum = UIAlertAction.actionWithTitle('Save to Photos', { style: 'default' });
const removePhoto = UIAlertAction.actionWithTitle('Delete', { style: 'destructive' });
saveToAlbum.addEventListener('click', () => console.log('Saved'));
removePhoto.addEventListener('click', () => console.log('Deleted'));
menu.addAction(saveToAlbum);
menu.addAction(removePhoto);
menu.addAction(UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' }));
page.presentViewController(menu, { animated: true });
```

**Effect** (**not verified in the simulator**)

- An action sheet rises from the bottom of the screen with three items: "Save to Photos", a red "Delete", and "Cancel".
- Tapping "Save to Photos" closes the sheet, and the console logs `Saved`.
- Tapping "Cancel" or the empty area outside the sheet closes it, and nothing is logged.

Both the title and message of an action sheet can be `null`, in which case the sheet contains only buttons.

## Collecting a line of text

[`addTextField()`](../api/ui-alert-controller/addtextfield.md) adds a text field to an alert and returns it. It is an ordinary [`UITextField`](../api/ui-text-field.md); configure it as usual.

```js
const naming = UIAlertController.alertControllerWithTitle('Name the Album', {
  preferredStyle: 'alert',
});
const field = naming.addTextField();
field.placeholder = 'Album name';

const save = UIAlertAction.actionWithTitle('Save', { style: 'default' });
save.addEventListener('click', () => {
  console.log('Name is', field.text);
});
naming.addAction(UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' }));
naming.addAction(save);
page.presentViewController(naming, { animated: true });
```

**Effect** (**not verified in the simulator**)

- Below the title in the alert is a text field showing "Album name" in gray. The keyboard comes up when the alert appears.
- Type `Travel` and tap "Save": the alert closes, and the console logs `Name is Travel`.

For passwords, set `field.isSecureTextEntry` to `true`. You can add several text fields; they are arranged from top to bottom in the order added.

## Disabling "Save" until something is entered

This section continues with the alert from the previous section: before presenting, make "Save" disabled, and update it as the user types. The first few lines recreate `naming`, `field`, and `save` from the previous section:

```js
const naming = UIAlertController.alertControllerWithTitle('Name the Album', {
  preferredStyle: 'alert',
});
const field = naming.addTextField();
const save = UIAlertAction.actionWithTitle('Save', { style: 'default' });
naming.addAction(save);

save.isEnabled = false;
field.addEventListener('input', () => {
  save.isEnabled = field.text.length > 0;
});
page.presentViewController(naming, { animated: true });
```

**Effect** (**not verified in the simulator**): when the alert first appears, "Save" is gray and cannot be tapped. Once the text field has text, "Save" becomes tappable; delete all the text and it turns gray again.

## Marking the preferred button

```js
const naming = UIAlertController.alertControllerWithTitle('Name the Album', {
  preferredStyle: 'alert',
});
const save = UIAlertAction.actionWithTitle('Save', { style: 'default' });
naming.addAction(UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' }));
naming.addAction(save);

naming.preferredAction = save;
page.presentViewController(naming, { animated: true });
```

**Effect** (**not verified in the simulator**): the title of "Save" in the alert is shown in bold. With a hardware keyboard attached, pressing Return is the same as tapping it.

[`preferredAction`](../api/ui-alert-controller/preferredaction.md) must be a button already added with `addAction()`, so this line goes after `addAction()`.

## Closing an alert from code

```js
async function sync() {
  const progress = UIAlertController.alertControllerWithTitle('Syncing…', {
    preferredStyle: 'alert',
  });
  await page.presentViewController(progress, { animated: true });
  // …after syncing finishes
  await progress.dismissViewController({ animated: true });
}
```

**Effect** (**not verified in the simulator**): an alert with no buttons appears, which the user cannot close. `dismissViewController()` closes it.

Both methods return a promise that settles when the present or dismiss animation finishes. To know whether the alert is currently showing, check `page.presentedViewController === progress`.

## See also

- [`UIAlertController`](../api/ui-alert-controller.md): all members of the alert controller
- [`UIAlertAction`](../api/ui-alert-action.md): buttons on an alert controller
- [`UIViewController`](../api/ui-view-controller.md): presenting and dismissing view controllers
- [`UITextField`](../api/ui-text-field.md): the type of text fields in an alert
