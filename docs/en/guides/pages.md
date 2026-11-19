# Building a view controller

This guide shows how to use [`UIViewController`](../api/ui-view-controller.md) to build one screen of content: putting things on it, setting its title, doing things when it appears and disappears, and embedding another view controller in it. For how to present and dismiss view controllers, see [Presenting a modal view controller](modal-pages.md).

## Recommended approach

- **Write a function that builds the view controller.** View controllers can't be subclassed. In the function, call `new UIViewController()`, put content in its [`view`](../api/ui-view-controller/view.md), and return it.
- **Don't keep view controllers around.** A view controller on screen is kept by whatever holds it: a window, a navigation stack, a presenter, a parent controller. Create one when needed and let it be garbage-collected after leaving; the next time you need to show the same content, build a new one from the data. Only keep a view controller in a variable for reuse when it is expensive to rebuild, at the cost of it and all its views staying in memory. See [Who keeps a view controller](../api/ui-view-controller.md#who-keeps-a-view-controller-alive).
- **Don't store view controllers outside the `sceneconnect` callback.** When the system destroys a scene, the windows, view controllers, and views that weren't stored elsewhere are garbage-collected together; ones stored outside are not. See [`UIWindowScene`](../api/ui-window-scene.md).
- **Give the root view a background color.** A view controller's root view is transparent by default. Without a background color, a root view controller shows a black screen, and a modal view controller lets the content beneath it show through. **Neither is verified in the simulator.**

## First view controller

Starting from a blank App, make a view controller that shows a line of text in the top-left corner.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);

  // 1. Build the view controller and set its background color
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';

  // 2. Put content in the root view, positioned against the safe area
  const label = new UILabel();
  label.text = 'Hello';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    label.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    label.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);

  // 3. Make it the window's root view controller and show it
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**Effect**

- The view controller's background is white in light mode and black in dark mode.
- "Hello" appears in the top-left corner of the view controller, 16 [pt](../api/units.md) from both the top and left edges of the safe area.

The "safe area" is the region of the screen not covered by the notch, the status bar, or the home indicator at the bottom. `safeAreaLayoutGuide` represents this region; for usage, see [Auto Layout](../api/auto-layout.md). For how to write colors, see [Colors](../api/ui-color.md).

The examples below reuse `page` from here. To try a section on its own, write this line first:

```js
const page = new UIViewController();
```

## Setting the title

```js
page.title = 'Settings';
```

**Effect**: when the view controller is in a [navigation stack](../api/ui-navigation-controller.md), "Settings" appears in the middle of the navigation bar at the top of the screen. After navigating from it to the next view controller, the next one's back button also shows "Settings".

When the view controller isn't in a navigation stack, there is no navigation bar and the title isn't shown anywhere. Buttons, subtitles, and the like on the navigation bar are set through [`page.navigationItem`](../api/ui-view-controller/navigationitem.md); see [Putting buttons and a title in the navigation bar](bar-buttons.md).

## Refreshing content every time the view controller comes back

```js
/** Your own function */
function reloadOrders() {}

page.addEventListener('beforeappear', () => {
  reloadOrders();
});
```

**Effect**: `reloadOrders()` runs once when the view controller first appears. It runs again each time you return from the next view controller, a full-screen view controller covering it is dismissed, or you switch back to this tab.

[`beforeappear`](../api/ui-view-controller/beforeappear-event.md) means "the view is about to appear on screen", not just the first time. For the cases that fire it, see [Appearing and disappearing](../api/ui-view-controller.md#appearing-and-disappearing).

## Focusing a text field automatically once the view controller appears

```js
const field = new UITextField();
page.view.addSubview(field);

page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**Effect**: after the view controller's transition animation ends, the text field starts editing and the keyboard comes up. Calling `becomeFirstResponder()` in this callback returns `true` (measured).

`{ once: true }` makes it focus only the first time the view controller appears. Without it, the field is focused every time you return to this view controller.

## Stopping a timer while the view controller isn't visible

```js
/** Your own function */
function refreshPrice() {}

/** @type {number | undefined} */
let timer;

page.addEventListener('beforeappear', () => {
  timer = setInterval(refreshPrice, 1000);
});
page.addEventListener('disappear', () => {
  clearInterval(timer);
});
```

**Effect**: while the view controller is on screen, `refreshPrice()` runs once per second. It stops after the view controller is covered by the next one, dismissed, or switched away from in a tab bar, and starts again when you return to it.

## Knowing whether it's in a navigation stack

```js
const stack = page.navigationController;
if (stack) {
  stack.popViewController({ animated: true });
}
```

**Effect**: when `page` is in a navigation stack, goes back to the previous view controller. Otherwise does nothing.

[`navigationController`](../api/ui-view-controller/navigationcontroller.md) is `null` when the view controller isn't in any navigation stack, so check it before use.

## Embedding another view controller in this one

To show another view controller's content in one area of a view controller, add it as a **child controller**. You don't need a child controller just to split one screen into parts in your code: write a few functions that return views and add those views to `page.view`. Child controllers are for when that area is a complete view controller in its own right, for example when it contains a navigation stack.

Adding takes three statements, in a fixed order:

```js
const panel = new UIViewController();
panel.view.backgroundColor = 'systemTeal';

page.addChildViewController(panel);                 // 1. Establish the parent-child relationship
panel.view.frame = new CGRect(20, 120, 280, 160);
page.view.addSubview(panel.view);                   // 2. Put its view in
panel.didMoveToParentViewController(page);          // 3. Tell it it has been put in place

console.log(page.childViewControllers.length);
console.log(panel.parentViewController === page);
```

**Effect**: a teal rectangle 280 pt wide and 160 pt tall appears on `page`. The console logs `1` and `true`.

All three statements are required. If you only do step 2, `panel` doesn't know whom it belongs to and isn't kept by `page`; see [`addChildViewController()`](../api/ui-view-controller/addchildviewcontroller.md).

Removing it is the reverse, also three statements:

```js
panel.willMoveToParentViewController(null);   // 1. Tell it it is about to leave
panel.view.removeFromSuperview();             // 2. Remove its view
panel.removeFromParentViewController();       // 3. End the parent-child relationship

console.log(page.childViewControllers.length);
console.log(panel.parentViewController);
```

**Effect**: the teal rectangle disappears. The console logs `0` and `null`.

## Reserving part of the safe area from a child view controller

When the parent view controller covers part of a child view controller with something (such as a row of tab buttons it draws itself), use [`additionalSafeAreaInsets`](../api/ui-view-controller/additionalsafeareainsets.md) to tell the child not to put content there. `panel` is the child view controller embedded in the previous section:

```js
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

panel.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0);

const note = new UILabel();
note.text = 'Against the bottom of the safe area';
note.translatesAutoresizingMaskIntoConstraints = false;
panel.view.addSubview(note);
const panelSafe = panel.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  note.centerXAnchor.constraintEqualToAnchor(panelSafe.centerXAnchor),
  note.bottomAnchor.constraintEqualToAnchor(panelSafe.bottomAnchor, { constant: -8 }),
]);
```

**Effect**: the bottom of `panel`'s safe area is 44 pt above the bottom of its view. The bottom of that line of text is 52 pt from the bottom of `panel`'s view (44 plus the 8 in the constraint), and the 44 pt left empty below is reserved for the parent to cover.

> **Note:** before the view controller is shown on screen, `panel.view.safeAreaInsets` reads 0 on all four sides, even after `additionalSafeAreaInsets` is written. It is correct only after the view controller is shown and laid out once (measured). Content constrained to `safeAreaLayoutGuide` is not affected.

## See also

- [`UIViewController`](../api/ui-view-controller.md): all members of a view controller
- [Presenting a modal view controller](modal-pages.md)
- [`UIView`](../api/ui-view.md): the type of `view`
- [Auto Layout](../api/auto-layout.md): constraints for positioning
- [`UINavigationController`](../api/ui-navigation-controller.md), [`UITabBarController`](../api/ui-tab-bar-controller.md): two parent controllers the system provides
