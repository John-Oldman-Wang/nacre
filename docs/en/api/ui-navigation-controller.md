---
type: reference
native: UINavigationController
status: partial
---

# `UINavigationController`

**`UINavigationController`** represents a stack of view controllers, called a navigation controller. It is itself a view controller ([`UIViewController`](ui-view-controller.md)), but it shows no content of its own; instead it manages a set of view controllers: the one at the top of the stack is shown on screen, and the others stay in the stack, not shown.

There are two operations on the stack. **Push** puts a new view controller on top of the stack, and the screen switches to it. **Pop** removes the top view controller, and the screen goes back to the one below it. Interfaces that go in level by level and come back level by level, like "list → detail → one level deeper", use it.

The navigation controller draws a **navigation bar** at the top of the screen. The middle of the navigation bar shows the title of the top view controller; when the stack holds more than one view controller, the left side of the navigation bar has a **back button** labeled with the previous view controller's title. The navigation bar, the back button, and the animation when switching view controllers are all provided by the system. What the navigation bar shows is decided by the top view controller: the title comes from its [`title`](ui-view-controller/title.md), and the buttons from its [`navigationItem`](ui-view-controller/navigationitem.md); see [`UINavigationItem`](ui-navigation-item.md).

It is a view controller, so it has all the members of `UIViewController`: it can be a window's root view controller, it can be presented modally, and it can be placed in a tab of a [`UITabBarController`](ui-tab-bar-controller.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UINavigationController`

For moving between view controllers, navigating by path, and cleaning up when a view controller leaves the stack, see the guide [Navigating between view controllers](../guides/navigation.md).

## Constructor

[`UINavigationController()`](ui-navigation-controller/constructor.md)

Creates a navigation controller. You can give it a view controller as the bottom of the stack, or start with an empty stack.

## Instance properties

Also inherits the properties of [`UIViewController`](ui-view-controller.md).

| Property | Description |
| --- | --- |
| [`viewControllers`](ui-navigation-controller/viewcontrollers.md) | All view controllers in the stack, bottom first |
| [`topViewController`](ui-navigation-controller/topviewcontroller.md) <small>read-only</small> | The view controller at the top of the stack |
| [`visibleViewController`](ui-navigation-controller/visibleviewcontroller.md) <small>read-only</small> | The view controller the user sees right now |
| [`isNavigationBarHidden`](ui-navigation-controller/isnavigationbarhidden.md) | Whether the navigation bar is hidden |
| [`isToolbarHidden`](ui-navigation-controller/istoolbarhidden.md) | Whether the toolbar at the bottom is hidden |
| [`toolbar`](ui-navigation-controller/toolbar.md) <small>read-only</small> | The bottom toolbar managed by the navigation controller itself |
| [`interactivePopGestureRecognizer`](ui-navigation-controller/interactivepopgesturerecognizer.md) <small>read-only</small> | The swipe-back gesture. Set its `isEnabled` to turn swipe back on or off |
| [`interactiveContentPopGestureRecognizer`](ui-navigation-controller/interactivecontentpopgesturerecognizer.md) <small>read-only</small> | The gesture for swiping right anywhere in the content area to go back (iOS 26 and later) |
| [`hidesBarsOnSwipe`](ui-navigation-controller/hidesbarsonswipe.md) | Automatically hides the navigation bar when the user swipes up on the content |
| [`hidesBarsOnTap`](ui-navigation-controller/hidesbarsontap.md) | A tap on the content toggles the navigation bar |
| [`hidesBarsWhenKeyboardAppears`](ui-navigation-controller/hidesbarswhenkeyboardappears.md) | Automatically hides the navigation bar when the keyboard appears |
| [`hidesBarsWhenVerticallyCompact`](ui-navigation-controller/hidesbarswhenverticallycompact.md) | Automatically hides the navigation bar when vertical space is tight |
| [`barHideOnSwipeGestureRecognizer`](ui-navigation-controller/barhideonswipegesturerecognizer.md) <small>read-only</small> | The gesture used by `hidesBarsOnSwipe` |
| [`barHideOnTapGestureRecognizer`](ui-navigation-controller/barhideontapgesturerecognizer.md) <small>read-only</small> | The gesture used by `hidesBarsOnTap` |

## Instance methods

Also inherits the methods of [`UIViewController`](ui-view-controller.md).

The methods that change the stack all take `{ animated }` as their last parameter; without it, there is no animation:

| Method | Description |
| --- | --- |
| [`pushViewController()`](ui-navigation-controller/pushviewcontroller.md) | Pushes a view controller onto the top of the stack |
| [`popViewController()`](ui-navigation-controller/popviewcontroller.md) | Pops the top view controller |
| [`popToViewController()`](ui-navigation-controller/poptoviewcontroller.md) | Pops all view controllers above a given one |
| [`popToRootViewController()`](ui-navigation-controller/poptorootviewcontroller.md) | Pops all view controllers except the bottom one |
| [`setViewControllers()`](ui-navigation-controller/setviewcontrollers.md) | Replaces the whole stack |
| [`showViewController()`](ui-navigation-controller/showviewcontroller.md) | Shows a view controller; the same as an animated `pushViewController()` |

Navigation bar:

| Method | Description |
| --- | --- |
| [`setNavigationBarHidden()`](ui-navigation-controller/setnavigationbarhidden.md) | Hides or shows the navigation bar, optionally animated |
| [`setToolbarHidden()`](ui-navigation-controller/settoolbarhidden.md) | Hides or shows the bottom toolbar, optionally animated |

## Events

| Event | When it fires |
| --- | --- |
| [`beforeshow`](ui-navigation-controller/beforeshow-event.md) | The navigation controller is about to show a view controller |
| [`show`](ui-navigation-controller/show-event.md) | The navigation controller has shown a view controller and the transition animation has finished |
| [`beforeappear`](ui-view-controller/beforeappear-event.md), [`appear`](ui-view-controller/appear-event.md), [`beforedisappear`](ui-view-controller/beforedisappear-event.md), [`disappear`](ui-view-controller/disappear-event.md) | Inherited from [`UIViewController`](ui-view-controller.md): the navigation controller's own view appears and disappears |
| [`traitchange`](ui-view-controller/traitchange-event.md) | Inherited from [`UIViewController`](ui-view-controller.md): the traits changed |

Listening for other names doesn't throw: such a name is treated as a custom event and only fires when you dispatch it yourself with `dispatchEvent()`.

> **Note:** When the navigation controller is presented modally, listening for [`beforedismiss`](ui-view-controller/beforedismiss-event.md), [`dismiss`](ui-view-controller/dismiss-event.md), or [`dismissattempt`](ui-view-controller/dismissattempt-event.md) on it doesn't throw, but those events never arrive.

## The user can go back on their own

The stack isn't changed only by code. The user has two ways to go back that don't go through code:

- **Tapping the back button**, the button on the left side of the navigation bar.
- **Swiping back.** The finger slides right from the left edge of the view controller; the top view controller follows the finger and slides away, revealing the previous one. See [Swipe back](#swipe-back).

In both cases the system performs the pop directly; the code doesn't call any method. After the pop finishes, the navigation controller fires the `show` event; the event object's `viewController` is the view controller now shown, and `nav.viewControllers` is already the stack after the pop.

So `nav.viewControllers` is always the source of truth. If your code keeps its own record of "which level we're at" or "what the current path is", realign it with `nav.viewControllers` in the `show` callback.

## Who keeps the view controllers in the stack alive

**After a push, you don't need to keep the view controller yourself.** The navigation controller keeps every view controller in the stack, and the window keeps the navigation controller. While a view controller is in the stack it isn't collected, and data attached to it and event listeners added to it stay in effect. Verified by the acceptance tests: after a push, dropping the reference to the view controller and reading it back from `nav.topViewController` returns the same object, with its data still there.

**After a pop, the navigation controller no longer keeps that view controller.** Then:

- If nothing else in the code holds it, it is collected together with its views, the buttons on those views, and the listeners. The same goes for view controllers popped by the user tapping the back button or swiping back (measured: after tapping back, the popped view controller was collected within a few seconds).
- If the code holds it (for example, the return value of `popViewController()`), it stays in memory and can be pushed again.

Collection of a view controller needs nothing from your code and has no event. The same view controller object can't appear in the stack twice.

## Swipe back

Swipe back is a system-provided gesture: the finger presses on the left edge of the view controller and slides right, and the top view controller moves with the finger; release after sliding far enough and the view controller is popped. No code is needed.

The result is the same as tapping the back button: the view controller is popped, and the navigation controller fires `beforeshow` and `show`. Measured: with 2 view controllers in the stack, swiping right 144 pt from the left edge of the navigation controller's view gave a `show` whose `viewController` was the previous one, and the stack became 1 view controller.

The gesture works only when four conditions hold. These four are iOS's rules; except for the first and fourth, they are **not verified in the simulator**:

| Condition | Description |
| --- | --- |
| There is more than one view controller in the stack | The bottom view controller has no previous one to go back to |
| The top view controller uses the system back button | If it sets [`leftBarButtonItems`](ui-navigation-item/leftbarbuttonitems.md) or sets [`hidesBackButton`](ui-navigation-item/hidesbackbutton.md) to `true`, the gesture doesn't work |
| The gesture isn't disabled | `isEnabled` on [`interactivePopGestureRecognizer`](ui-navigation-controller/interactivepopgesturerecognizer.md) is `true`, which is the default |
| The swipe starts at the left edge of the navigation controller's own view | When the navigation controller doesn't fill the screen, the starting point is the left edge of its view, not of the screen |

If the finger slides halfway and then back before releasing, the view controller isn't popped. Whether events fire in that case is **not verified in the simulator**. Whether swipe back still works after the navigation bar is hidden is **not verified in the simulator**.

To keep the user from going back temporarily (for example, while an order is being submitted), set this gesture's `isEnabled` to `false`, and set it back to `true` when done. Starting with iOS 26 there is also a gesture for swiping right anywhere in the content area to go back, [`interactiveContentPopGestureRecognizer`](ui-navigation-controller/interactivecontentpopgesturerecognizer.md); to turn swipe back off completely, turn off both. The back button on the navigation bar isn't affected.

## Examples

### A home view controller and a detail view controller

Starting from a blank app: create a navigation controller, put a button on the home view controller, tap the button to go to a detail view controller, and print a line to the console each time a transition finishes.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = 'Home';
  home.view.backgroundColor = 'systemBackground';

  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('View details', { forState: ['normal'] });
  button.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);

  button.addEventListener('click', () => {
    const detail = new UIViewController();
    detail.title = 'Details';
    detail.view.backgroundColor = 'systemTeal';
    nav.pushViewController(detail, { animated: true });
  });

  nav.addEventListener('show', (ev) => {
    const event = /** @type {Event & { viewController: UIViewController }} */ (ev);
    console.log('Now showing', event.viewController.title, ', stack has', nav.viewControllers.length, 'view controllers');
  });
});
```

**Effect**

- A navigation bar runs across the top of the screen with "Home" in the middle. A blue "View details" is in the center of the view controller.
- Tap "View details" and an animation switches to the teal detail view controller. The navigation bar's title changes to "Details", and a back button labeled "Home" appears on the left. The console prints `Now showing Details , stack has 2 view controllers`.
- Tap the back button, or swipe right from the left edge of the view controller, to return to the home view controller. The console prints `Now showing Home , stack has 1 view controllers`.

The firing of `show` and the stack counts on push, back-button tap, and swipe back are measured. Whether a line is also printed when the home view controller is first shown after the app launches is **not verified in the simulator**. This code has not been run as a whole in the simulator; every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UINavigationController alloc] initWithRootViewController:home]` | `new UINavigationController(home)` |
| `[nav pushViewController:vc animated:YES]` | `nav.pushViewController(vc, { animated: true })` |
| `[nav popViewControllerAnimated:YES]` | `nav.popViewController({ animated: true })` |
| `[nav popToViewController:vc animated:YES]` | `nav.popToViewController(vc, { animated: true })` |
| `[nav popToRootViewControllerAnimated:YES]` | `nav.popToRootViewController({ animated: true })` |
| `[nav setViewControllers:@[a, b] animated:YES]` | `nav.setViewControllers([a, b], { animated: true })` |
| `nav.viewControllers = @[a, b]` | `nav.viewControllers = [a, b]` |
| `nav.navigationBarHidden = YES` | `nav.isNavigationBarHidden = true` |
| `[nav setNavigationBarHidden:YES animated:YES]` | `nav.setNavigationBarHidden(true, { animated: true })` |
| `vc.navigationController` | `vc.navigationController` |
| `- navigationController:willShowViewController:animated:` | `nav.addEventListener('beforeshow', …)` |
| `- navigationController:didShowViewController:animated:` | `nav.addEventListener('show', …)` |
| `nav.toolbarHidden = NO` | `nav.isToolbarHidden = false` |
| `[nav setToolbarHidden:NO animated:YES]` | `nav.setToolbarHidden(false, { animated: true })` |
| `nav.interactivePopGestureRecognizer.enabled = NO` | `nav.interactivePopGestureRecognizer.isEnabled = false` |
| `nav.hidesBarsOnSwipe = YES` | `nav.hidesBarsOnSwipe = true` |
| `[nav showViewController:vc sender:button]` | `nav.showViewController(vc, { sender: button })` |
| `nav.delegate` | Not exposed. Listen for events with `addEventListener()` |
| `nav.navigationBar` | Set the title and buttons on the navigation bar through the view controller's [`navigationItem`](ui-view-controller/navigationitem.md) |

## See also

- [Navigating between view controllers](../guides/navigation.md): pushing, going back, navigating by path, cleaning up on leaving the stack, hiding the navigation bar
- [Putting buttons and a title in the navigation bar](../guides/bar-buttons.md): the title on the navigation bar, the back button's label, left and right buttons
- [`UIViewController`](ui-view-controller.md): view controllers. Modal presentation is another way to show a view controller
- [`UITabBarController`](ui-tab-bar-controller.md): the bottom tab bar. Each tab often holds a navigation controller
- [`UIWindow`](ui-window.md): `rootViewController` is set here
- [How the runtime works](how-it-works.md): when events run, when objects are collected
