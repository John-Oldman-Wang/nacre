---
type: reference
native: UIViewController
status: partial
---

# `UIViewController`

**`UIViewController`** represents the manager of one screen of content, called a view controller. A view controller is not itself a view and is not displayed on screen. It owns a root view, [`view`](ui-view-controller/view.md), and all the interface content for that screen goes inside this view. The view controller is responsible for how that content enters the screen, how it leaves the screen, and how it relates to other view controllers.

The system organizes the interface by view controllers, so even an app with only one screen of content needs a view controller:

- A window does not accept views directly. The window's content entry point is [`rootViewController`](ui-window/rootviewcontroller.md), whose type is a view controller.
- Switching between screens happens one view controller at a time: the [navigation stack](ui-navigation-controller.md) pushes and pops view controllers, the [tab bar](ui-tab-bar-controller.md) switches between view controllers, and what [modal presentation](#modal-presentation) covers the screen with is also a view controller. The system provides the transition animations, the back button, the swipe-back gesture, and swipe-down-to-dismiss; you do not write them yourself.
- The safe area is calculated per view controller. The "safe area" is the region of the screen not covered by the notch, the status bar, or the home indicator at the bottom. A parent view controller can give a child view controller extra safe area insets ([`additionalSafeAreaInsets`](ui-view-controller/additionalsafeareainsets.md)).

The app's code creates view controllers with `new UIViewController()`; creating one needs no scene or window. A new view controller does not display itself. Put it on screen in one of the following ways:

| Way | Code | When to use it |
| --- | --- | --- |
| Root view controller of a window | `win.rootViewController = page` | Each window has one; it is the starting point of the interface. See [`UIWindow`](ui-window.md) |
| Push onto a navigation stack | `nav.pushViewController(page, …)` | The next level of the same task, such as "list → detail". See [`UINavigationController`](ui-navigation-controller.md) |
| One tab of a tab bar | `tabs.viewControllers = […]` | Several parallel main screens. See [`UITabBarController`](ui-tab-bar-controller.md) |
| Modal presentation | `page.presentViewController(other, …)` | Temporarily interrupt the current task, such as "Sign in" or "New". See [Modal presentation](#modal-presentation) |
| Embed in another view controller | `parent.addChildViewController(child)` and two more lines | Writing your own container. See [Parent and child view controllers](#parent-and-child-view-controllers) |

A view controller is not a view; you cannot `addSubview()` a view controller into another view. View controllers cannot be subclassed: `class MyPage extends UIViewController {}` throws on `new MyPage()`. To make your own view controller, write a function that calls `new UIViewController()`, puts content into its `view`, and returns it.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → `UIViewController`

For how to put content on a view controller and refresh it when it appears, see the guide [Building a view controller](../guides/pages.md); for how to present and dismiss a modal view controller, see the guide [Presenting a modal view controller](../guides/modal-pages.md).

## Constructor

[`UIViewController()`](ui-view-controller/constructor.md)

Creates an empty view controller. It does not display itself.

## Instance properties

Content and title:

| Property | Description |
| --- | --- |
| [`view`](ui-view-controller/view.md) <small>read-only</small> | The view controller's root view. All of its content goes inside it |
| [`title`](ui-view-controller/title.md) | The title. Shown in the center of the navigation bar and on the next view controller's back button |
| [`navigationItem`](ui-view-controller/navigationitem.md) <small>read-only</small> | This view controller's configuration for the navigation bar |
| [`tabBarItem`](ui-view-controller/tabbaritem.md) | This view controller's item in the bottom tab bar |

Modal presentation:

| Property | Description |
| --- | --- |
| [`presentedViewController`](ui-view-controller/presentedviewcontroller.md) <small>read-only</small> | The modal view controller this view controller presented |
| [`presentingViewController`](ui-view-controller/presentingviewcontroller.md) <small>read-only</small> | The view controller that presented this one |
| [`modalPresentationStyle`](ui-view-controller/modalpresentationstyle.md) | The style used when presented modally: sheet, full screen, … |
| [`modalTransitionStyle`](ui-view-controller/modaltransitionstyle.md) | The enter and exit animation used when presented modally |
| [`isModalInPresentation`](ui-view-controller/ismodalinpresentation.md) | Whether the user can swipe this modal view controller down to dismiss it |

Relationships with other view controllers:

| Property | Description |
| --- | --- |
| [`navigationController`](ui-view-controller/navigationcontroller.md) <small>read-only</small> | The navigation controller this view controller is in |
| [`tabBarController`](ui-view-controller/tabbarcontroller.md) <small>read-only</small> | The tab bar controller this view controller is in |
| [`parentViewController`](ui-view-controller/parentviewcontroller.md) <small>read-only</small> | The parent view controller that contains this one |
| [`childViewControllers`](ui-view-controller/childviewcontrollers.md) <small>read-only</small> | This view controller's child view controllers |
| [`additionalSafeAreaInsets`](ui-view-controller/additionalsafeareainsets.md) | Insets added on top of the system's safe area |

Appearance:

| Property | Description |
| --- | --- |
| [`traitCollection`](ui-view-controller/traitcollection.md) <small>read-only</small> | The appearance traits of the view controller's environment: dark or light, how large the text is |
| [`overrideUserInterfaceStyle`](ui-view-controller/overrideuserinterfacestyle.md) | Forces this view controller to use light or dark |

## Instance methods

Modal presentation:

| Method | Description |
| --- | --- |
| [`presentViewController()`](ui-view-controller/presentviewcontroller.md) | Presents another view controller modally, on top of the current one |
| [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md) | Dismisses a modal view controller |

Parent and child view controllers:

| Method | Description |
| --- | --- |
| [`addChildViewController()`](ui-view-controller/addchildviewcontroller.md) | Adds a view controller as a child |
| [`removeFromParentViewController()`](ui-view-controller/removefromparentviewcontroller.md) | Leaves the parent view controller |
| [`willMoveToParentViewController()`](ui-view-controller/willmovetoparentviewcontroller.md) | Notifies "about to change parent" |
| [`didMoveToParentViewController()`](ui-view-controller/didmovetoparentviewcontroller.md) | Notifies "finished changing parent" |

## Events

Appearing and disappearing, available on every kind of view controller, including navigation controllers and tab bar controllers:

| Event | When it fires |
| --- | --- |
| [`beforeappear`](ui-view-controller/beforeappear-event.md) | The view controller's view is about to appear on screen |
| [`appear`](ui-view-controller/appear-event.md) | The view controller's view has appeared and the transition animation has finished |
| [`beforedisappear`](ui-view-controller/beforedisappear-event.md) | The view controller's view is about to leave the screen |
| [`disappear`](ui-view-controller/disappear-event.md) | The view controller's view has left the screen |

Modal dismissal, fired on **the presented view controller**:

| Event | When it fires |
| --- | --- |
| [`beforedismiss`](ui-view-controller/beforedismiss-event.md) | The user is dragging the sheet down and it is about to close |
| [`dismiss`](ui-view-controller/dismiss-event.md) | The user dragged the sheet away and the dismissal is complete |
| [`dismissattempt`](ui-view-controller/dismissattempt-event.md) | The user tried to drag the sheet away, but `isModalInPresentation` is `true`, so it did not close |

Appearance:

| Event | When it fires |
| --- | --- |
| [`traitchange`](ui-view-controller/traitchange-event.md) | The view controller's appearance traits changed, for example on switching to dark mode |

- The system fires the eight event names above. Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`. A misspelled event name gives no warning; the listener simply never runs.
- None of the events can be canceled; `preventDefault()` has no effect.
- Callbacks do not run synchronously at the moment things happen; they run a little later. See [How the runtime works](how-it-works.md).

## Who keeps a view controller alive

**A view controller on screen does not need to be stored in a variable.** Once a view controller is put on screen in any of the ways above, the side that put it there keeps it: the window keeps its root view controller, the navigation stack keeps every view controller on it, the presenter keeps the modal view controller it presented, and a parent keeps its child view controllers. While kept, the view controller is not collected, and its view, the event listeners attached to it, and its custom properties are all retained.

Whether a view controller still exists after it leaves depends on whether the app's code stored it:

| How the view controller leaves | When no variable holds it |
| --- | --- |
| A modal view controller is dismissed by code (`dismissViewController()`) | Collected after the dismiss animation ends (verified by testing) |
| A modal view controller is swiped down by the user | Collected (verified by testing) |
| Popped off the navigation stack (by code, or by the user tapping the back button) | Collected (verified by testing) |
| A child view controller calls `removeFromParentViewController()` | Collected (verified by testing) |
| The root view controller is replaced by another one | Collected. **Not verified in the simulator.** |

When a view controller is collected, its view and the event listeners on the view are collected with it; you do not need to remove the listeners one by one first.

## View controllers and views

View controllers and views are two kinds of objects with different jobs:

| | View controller (`UIViewController`) | View ([`UIView`](ui-view.md)) |
| --- | --- | --- |
| What it is | The manager of one screen of content | A rectangle on screen |
| Can it be drawn on screen | No; it has no position or size | Yes |
| How it is organized | Root view controller of a window, navigation stack, modal presentation | View hierarchy (`addSubview`) |

Every view controller has exactly one root view, `view`. Interface content goes on `page.view`; relationships between view controllers are set on the view controllers. The two do not mix: a view cannot be used as a view controller, and a view controller cannot be added to the view hierarchy as a view. For when `view` is created, its size, and its safe area, see [`view`](ui-view-controller/view.md).

## Appearing and disappearing

The four appear and disappear events say whether "the view is on screen", not whether "the view controller still exists". "Appearing" does not only happen the first time a view controller is shown; all of the following fire events (verified by testing):

| What happened | Fired |
| --- | --- |
| The view controller is presented modally | This view controller: `beforeappear` → `appear` |
| A modal view controller is dismissed | This view controller: `beforedisappear` → `disappear` |
| The navigation stack pushes the next view controller | The old one fires both disappear events, the new one fires both appear events |
| The navigation stack pops back | The popped view controller fires both disappear events, the previous one fires both appear events again |
| The tab bar switches to another tab | The old one fires both disappear events, the new one fires both appear events |
| Covered by a full-screen modal view controller | The one underneath fires both disappear events; after the full-screen one is dismissed it fires both appear events again |
| Covered by a sheet-style modal view controller | The one underneath fires nothing. Its view is still on screen |
| A child's view is added to a parent that is on screen | The child fires both appear events; when the parent disappears, the child disappears with it |

When a view controller is covered by the next one, it fires `disappear`, but it is still on the navigation stack and appears again when the user goes back.

- On the same view controller, "will" comes before "did". The order between two view controllers was measured: when pushing, it is old will-disappear → new will-appear → old did-disappear → new did-appear; when switching tabs, it is new will-appear → old will-disappear → old did-disappear → new did-appear. Do not depend on the order between two view controllers.
- A view controller that has never been shown on screen fires nothing.
- What fires when the user swipes back halfway and then lets go is **not verified in the simulator**.
- These four events cannot be listened for on system alerts ([`UIAlertController`](ui-alert-controller.md)) or the share sheet.

`viewDidLoad` has no corresponding event. The view controller and its view are both created by the app, so just keep writing after creating them.

## Parent and child view controllers

A view controller can contain other view controllers. The one that contains is the parent view controller; the contained ones are child view controllers. The navigation stack and the bottom tab bar are two parent view controllers the system already provides. You only write your own for containers the system does not provide (such as a custom-drawn tab strip or a split layout).

The parent-child relationship and the view hierarchy are separate things, each handled on its own:

| | Parent and child view controllers | View hierarchy |
| --- | --- | --- |
| Set up | `parent.addChildViewController(child)` | `parent.view.addSubview(child.view)` |
| Purpose | The child knows whom it belongs to; the safe area, `navigationController`, and the like are passed down from the parent | The child's content is shown on screen |
| Torn down | `child.removeFromParentViewController()` | `child.view.removeFromSuperview()` |

You must do both; the system does not keep them in sync. A parent keeps its child view controllers: after adding, you do not need to keep the `child` variable; after removal, if no variable holds it, it is collected (verified by testing). Parent-child relationships cannot form a cycle.

Adding and removing each come with two notifications sent to the child. The system sends half of them; your code must call the other half:

| When | Notification | Who calls it |
| --- | --- | --- |
| Before adding | `child.willMoveToParentViewController(parent)` | Called automatically by `addChildViewController` |
| After adding | `child.didMoveToParentViewController(parent)` | **You** |
| Before removing | `child.willMoveToParentViewController(null)` | **You** |
| After removing | `child.didMoveToParentViewController(null)` | Called automatically by `removeFromParentViewController` |

These two notifications are sent to the system; JS cannot receive them, and the child has no corresponding events. The consequences of leaving out the two calls you must make yourself are **not verified in the simulator**.

## Modal presentation

Modal presentation (present) covers the current view controller with a new one. Closing it is called dismiss. There are two ways to show a new view controller, with different meanings:

| | Push onto the navigation stack (push) | Modal presentation (present) |
| --- | --- | --- |
| Where it comes from | Slides in from the right | Slides in from the bottom |
| Meaning | The next level of the same task, such as "list → detail" | Interrupts the current task, such as "Sign in" or "New" |
| How the user leaves | Taps the back button, or swipes right from the left edge of the screen | Drags down (for sheets), or taps a close button on the view controller |
| Does the system provide a back button | Yes | No; add your own close button |
| Code | [`nav.pushViewController()`](ui-navigation-controller/pushviewcontroller.md) | [`page.presentViewController()`](ui-view-controller/presentviewcontroller.md) |

In modal presentation the new view controller covers the one underneath, which cannot be interacted with; after dismissal the user is back where they were. The view controller underneath is not removed; its content and state are preserved. While shown, a modal view controller is kept by the view controller that presented it; after dismissal, if no variable holds it, it is collected.

### Who presented whom

After `a.presentViewController(b)`, `a.presentedViewController` is `b`, and `b.presentingViewController` is the view controller that presented `b`. `b.presentingViewController` is not necessarily `a`: when `a` is on a navigation stack, it is the `UINavigationController` that `a` is in. The system hands the presentation to the nearest container. See [`presentingViewController`](ui-view-controller/presentingviewcontroller.md).

### Dismissal events

A modal view controller can be dismissed in two ways, and only one of them fires events:

| Way | Events fired |
| --- | --- |
| The user drags the sheet down | Fires `beforedismiss`, then `dismiss` |
| Code calls `dismissViewController()` | **Fires no events** (verified by testing: none of the three events was received) |

When code dismisses, the code already knows the moment: the Promise returned by `dismissViewController()` fulfills after the dismiss animation ends, so put the cleanup after it. The events fire on **the presented view controller**.

> **Note:** When the presented view controller is a `UINavigationController`, it does not receive these three events: listening for the three names on it does not throw, but they do not fire when the system dismisses it. The four appear and disappear events are not affected.

## Examples

### Present a sheet

Starting from a blank app, make two view controllers. The first has an "Open" button; tapping it slides the second up from the bottom. The second has a "Close" button.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const sheet = new UIViewController();
  sheet.view.backgroundColor = 'systemBackground';
  sheet.modalPresentationStyle = 'pageSheet';

  const close = UIButton.buttonWithType('system');
  close.setTitle('Close', { forState: ['normal'] });
  close.translatesAutoresizingMaskIntoConstraints = false;
  sheet.view.addSubview(close);
  NSLayoutConstraint.activateConstraints([
    close.centerXAnchor.constraintEqualToAnchor(sheet.view.centerXAnchor),
    close.centerYAnchor.constraintEqualToAnchor(sheet.view.centerYAnchor),
  ]);
  close.addEventListener('click', () => {
    sheet.dismissViewController({ animated: true });
  });

  const open = UIButton.buttonWithType('system');
  open.setTitle('Open', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
  open.addEventListener('click', async () => {
    await page.presentViewController(sheet, { animated: true });
    console.log('The second view controller is fully shown');
  });
});
```

**Effect**

- After launch, a blue "Open" appears in the center of the screen.
- Tapping "Open" slides the second view controller up from the bottom of the screen; it covers the first one as a sheet.
- When the slide-in animation ends, the console prints `The second view controller is fully shown`.
- Tapping "Close" slides the sheet down and returns to the first view controller.
- Without tapping "Close", you can also hold the sheet and drag it down to dismiss it.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

This example creates `sheet` up front and keeps referring to it in both buttons' callbacks, so it is not collected after dismissal, and tapping "Open" again presents the same view controller. For creating a new modal view controller each time, see the guide [Presenting a modal view controller](../guides/modal-pages.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIViewController alloc] init]` | `new UIViewController()` |
| `vc.view` | `vc.view` |
| `vc.title = @"Settings"` | `vc.title = 'Settings'` |
| `vc.navigationItem` | `vc.navigationItem` |
| `vc.navigationController` | `vc.navigationController` |
| `[host presentViewController:m animated:YES completion:^{…}]` | `await host.presentViewController(m, { animated: true })` |
| `[vc dismissViewControllerAnimated:YES completion:^{…}]` | `await vc.dismissViewController({ animated: true })` |
| `vc.modalPresentationStyle = UIModalPresentationPageSheet` | `vc.modalPresentationStyle = 'pageSheet'` |
| `vc.modalTransitionStyle = UIModalTransitionStyleCrossDissolve` | `vc.modalTransitionStyle = 'crossDissolve'` |
| `vc.modalInPresentation = YES` | `vc.isModalInPresentation = true` |
| `- presentationControllerWillDismiss:` | `vc.addEventListener('beforedismiss', …)` |
| `- presentationControllerDidDismiss:` | `vc.addEventListener('dismiss', …)` |
| `- presentationControllerDidAttemptToDismiss:` | `vc.addEventListener('dismissattempt', …)` |
| `- presentationControllerShouldDismiss:` | Use `vc.isModalInPresentation` instead |
| Override `- viewWillAppear:`, `- viewDidAppear:` | `vc.addEventListener('beforeappear', …)`, `vc.addEventListener('appear', …)` |
| Override `- viewWillDisappear:`, `- viewDidDisappear:` | `vc.addEventListener('beforedisappear', …)`, `vc.addEventListener('disappear', …)` |
| Override `- viewDidLoad` | No corresponding event. Keep writing after creating the view controller |
| `[parent addChildViewController:child]` | `parent.addChildViewController(child)` |
| `[child didMoveToParentViewController:parent]` | `child.didMoveToParentViewController(parent)` |
| `[child willMoveToParentViewController:nil]` | `child.willMoveToParentViewController(null)` |
| `[child removeFromParentViewController]` | `child.removeFromParentViewController()` |
| `parent.childViewControllers` | `parent.childViewControllers` |
| `vc.additionalSafeAreaInsets = UIEdgeInsetsMake(0, 0, 44, 0)` | `vc.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0)` |
| `vc.tabBarItem`, `vc.tabBarController` | `vc.tabBarItem`, `vc.tabBarController` |

There are four differences from native:

- The native `completion` callback is a Promise in JS.
- Adding a view controller as a child of itself or of one of its descendants is not checked natively and crashes later. In JS it throws `TypeError` immediately.
- Natively, you learn about appearing and disappearing by overriding the `viewWillAppear:` family of methods. Native classes cannot be subclassed in JS, so these four moments are events on the view controller, and the callbacks run a little later.
- The three native dismissal notifications are on `vc.presentationController.delegate`. In JS they are events on the presented view controller itself.

## See also

- [Building a view controller](../guides/pages.md): add content, set the title, refresh on appear, embed child view controllers
- [Presenting a modal view controller](../guides/modal-pages.md): present, dismiss, prevent swipe-down, clean up
- [`UINavigationController`](ui-navigation-controller.md): push onto and pop off the navigation stack
- [`UITabBarController`](ui-tab-bar-controller.md): the bottom tab bar the system provides
- [`UINavigationItem`](ui-navigation-item.md): the type of `navigationItem`; the navigation bar's title and buttons
- [`UIWindow`](ui-window.md): where `rootViewController` is set
- [`UIView`](ui-view.md): the type of `view`
- [Native classes](native-classes.md): why they cannot be subclassed, and what to write instead
- [`UIWindowScene`](ui-window-scene.md): how view controllers are collected after a scene is destroyed
- [Appearance traits](ui-trait-collection.md): `traitCollection`, `overrideUserInterfaceStyle`, and the `traitchange` event
