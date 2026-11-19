# Presenting a modal view controller

This guide shows how to present a view controller modally, how to dismiss it, and how to know the user swiped it away. Modal presentation covers the current view controller with a new one to temporarily interrupt what is going on, for example "Sign in" or "New". The methods and events involved are all on [`UIViewController`](../api/ui-view-controller.md).

## Recommended approach

- **Use modal presentation when the new view controller is a separate task that returns to where it started once done or canceled; use a [navigation stack](../api/ui-navigation-controller.md) when the new view controller is the next level of the current content and the user will want to "go back".** For the difference, see [Modal presentation](../api/ui-view-controller.md#modal-presentation).
- **Write "open a modal view controller" as a function that creates a new view controller each time it is called.** While presented, it is held by the presenter; after dismissal no variable holds it, and it is garbage-collected along with its views, buttons, and listeners. The next opening is a new view controller that carries none of the previous input.
- **Dismissal from code and the user swiping it away go through the same cleanup.** Dismissing from code does not fire [`dismiss`](../api/ui-view-controller/dismiss-event.md), and a user swipe doesn't go through your button callback. If you write cleanup in only one place, the other path has none. See [Organizing how a modal view controller opens and closes](#organizing-how-a-modal-view-controller-opens-and-closes).
- **Pass results back as data.** When a modal view controller needs to hand a result to the outside, pass the value out as a callback argument rather than having the outside read the modal view controller's views.

Another approach is to create a modal view controller once, keep it, and present it repeatedly. This suits view controllers that are expensive to rebuild or that need to keep their previous state. The cost is that the view controller still occupies memory after it is dismissed.

## First modal view controller

Start from a blank app with two view controllers. The first has an "Open" button that slides the second up from the bottom. The second has a "Close" button.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the second view controller. It isn't shown yet
  const sheet = new UIViewController();
  sheet.view.backgroundColor = 'systemBackground';
  sheet.modalPresentationStyle = 'pageSheet';

  // 2. Put a "Close" button in the middle of the second view controller
  const close = UIButton.buttonWithType('system');
  close.setTitle('Close', { forState: ['normal'] });
  close.translatesAutoresizingMaskIntoConstraints = false;
  sheet.view.addSubview(close);
  NSLayoutConstraint.activateConstraints([
    close.centerXAnchor.constraintEqualToAnchor(sheet.view.centerXAnchor),
    close.centerYAnchor.constraintEqualToAnchor(sheet.view.centerYAnchor),
  ]);

  // 3. When "Close" is tapped, dismiss the second view controller
  close.addEventListener('click', () => {
    sheet.dismissViewController({ animated: true });
  });

  // 4. Put an "Open" button in the middle of the first view controller
  const open = UIButton.buttonWithType('system');
  open.setTitle('Open', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);

  // 5. When "Open" is tapped, present the second view controller
  open.addEventListener('click', async () => {
    await page.presentViewController(sheet, { animated: true });
    console.log('Second view controller fully shown');
  });
});
```

**Effect**

- After launch, the middle of the screen shows a blue "Open".
- Tapping "Open" slides the second view controller up from the bottom of the screen, covering the first as a card.
- When the slide-in animation ends, the console prints `Second view controller fully shown`.
- Tapping "Close" slides the card down and returns to the first view controller.
- Instead of tapping "Close", you can also hold the card and drag it down to dismiss it.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

This example creates `sheet` at the start and keeps a reference to it, so it isn't garbage-collected after dismissal, and tapping "Open" again presents the same view controller. The examples below reuse `page` and `sheet` from here. To try one section on its own, start with these lines:

```js
const page = new UIViewController();
const sheet = new UIViewController();
```

## Wait for the presentation animation to end

[`presentViewController()`](../api/ui-view-controller/presentviewcontroller.md) returns a Promise that fulfills when the presentation animation ends.

```js
async function openSheet() {
  await page.presentViewController(sheet, { animated: true });
  console.log(page.presentedViewController === sheet);
}
```

**Effect**: Calling `openSheet()` slides `sheet` up from the bottom of the screen to cover `page`. When the animation ends, the console prints `true`.

When `animated` is omitted it is `false`: the view controller appears directly, with no slide-in animation.

## Dismiss a modal view controller

Call [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md) on the presented view controller. It also returns a Promise, which fulfills when the dismissal animation ends.

```js
async function closeSheet() {
  await sheet.dismissViewController({ animated: true });
  console.log(page.presentedViewController);
}
```

**Effect**: `sheet` slides down off the screen, revealing `page`. When the animation ends, the console prints `null`.

> **Note:** Dismissing from code fires no events, including `beforedismiss` and `dismiss`. Put cleanup where you call `dismissViewController()`.

## Prevent the user from swiping to dismiss

By default, the user can drag a card-style modal view controller down to dismiss it. When you don't want a half-filled form dismissed this way, set [`isModalInPresentation`](../api/ui-view-controller/ismodalinpresentation.md).

```js
sheet.isModalInPresentation = true;
sheet.addEventListener('dismissattempt', () => {
  console.log('The user tried to dismiss, but it was blocked');
});
```

**Effect**: When the user drags the card down, it doesn't dismiss, and the console prints a line each time. It can be dismissed only through a button on the view controller.

This property can be changed at any time after presentation, for example set to `true` once the form is modified and back to `false` after saving.

## Know when the user swiped a modal view controller away

When the user drags the card away, the app's code never called `dismissViewController()`, so there is no Promise to wait on. To find out, listen for [`dismiss`](../api/ui-view-controller/dismiss-event.md) on the presented view controller.

```js
sheet.addEventListener('beforedismiss', () => {
  console.log('About to dismiss');
});
sheet.addEventListener('dismiss', () => {
  console.log('Dismissed');
});
```

**Effect**: When the user drags the card away, the console prints `About to dismiss`, then `Dismissed`.

When the user drags partway and lets it go back, the card isn't dismissed and `dismiss` doesn't fire; whether `beforedismiss` fires in that case is **not verified in the simulator**. So put cleanup in `dismiss`, not in `beforedismiss`.

## Organizing how a modal view controller opens and closes

Write "open a modal view controller" as a function: each call creates a new view controller, and the cleanup after dismissal is a function that runs only once, called both on dismissal from code and on the user swiping it away.

```js
/**
 * @param {UIViewController} host
 * @param {() => void} onClosed
 */
function openEditor(host, onClosed) {
  const editor = new UIViewController();
  editor.view.backgroundColor = 'systemBackground';
  editor.modalPresentationStyle = 'pageSheet';

  // Cleanup runs only once, however the view controller is dismissed
  let closed = false;
  function finish() {
    if (closed) return;
    closed = true;
    onClosed();
  }

  // Path 1: the user drags it down
  editor.addEventListener('dismiss', finish);

  // Path 2: tap "Done", dismissed by code
  const done = UIButton.buttonWithType('system');
  done.setTitle('Done', { forState: ['normal'] });
  done.translatesAutoresizingMaskIntoConstraints = false;
  editor.view.addSubview(done);
  NSLayoutConstraint.activateConstraints([
    done.centerXAnchor.constraintEqualToAnchor(editor.view.centerXAnchor),
    done.centerYAnchor.constraintEqualToAnchor(editor.view.centerYAnchor),
  ]);
  done.addEventListener('click', async () => {
    await editor.dismissViewController({ animated: true });
    finish();
  });

  return host.presentViewController(editor, { animated: true });
}

openEditor(page, () => {
  console.log('Editor dismissed');
});
```

**Effect**: A card slides in from the bottom with "Done" in the middle. Tapping "Done" or dragging the card down dismisses it, and either way the console prints one line, `Editor dismissed`. **This code has not been run as a whole in the simulator.**

`editor` is a local variable inside the function and doesn't need to be kept.

## Full-screen presentation

The default presentation style is a card. To make a modal view controller fill the whole screen, set [`modalPresentationStyle`](../api/ui-view-controller/modalpresentationstyle.md) before presenting.

```js
sheet.modalPresentationStyle = 'fullScreen';
page.presentViewController(sheet, { animated: true });
```

**Effect**: `sheet` slides in from the bottom and fills the whole screen, fully covering `page`. **Not verified in the simulator.**

The user cannot drag a full-screen modal view controller away, so it must have a close button; otherwise the user has no way to leave it.

## Use a different transition

```js
sheet.modalTransitionStyle = 'crossDissolve';
page.presentViewController(sheet, { animated: true });
```

**Effect**: Instead of sliding in from the bottom, `sheet` fades in in place. It fades out when dismissed. **Not verified in the simulator.**

For all values, see [`modalTransitionStyle`](../api/ui-view-controller/modaltransitionstyle.md).

## See also

- [`UIViewController`](../api/ui-view-controller.md): all members of a view controller
- [Building a view controller](pages.md)
- [Showing alerts and menus](alerts.md): system alerts are also a kind of modal view controller
- [`UINavigationController`](../api/ui-navigation-controller.md): another way to show a new view controller
