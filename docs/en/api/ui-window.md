---
type: reference
native: UIWindow
status: partial
---

# `UIWindow`

**`UIWindow`** represents a window: the outermost view that hosts the interface in a scene. View controllers and views must be placed in a window to be displayed; if the window isn't shown, nothing in it is shown.

A window is created on a scene. A scene ([`UIWindowScene`](ui-window-scene.md)) represents one instance of the app's interface and is created by the system: without a scene, you can't create a window that can be displayed. Once the system has created a scene, it fires the [`sceneconnect`](application/sceneconnect-event.md) event on [`application`](application.md); the code that creates the window goes in that event's callback.

Windows are created by the app's code; the system doesn't create one for the app. After the app launches there are no windows at all and the screen is black until code creates a window and shows it. A new window is hidden; it is shown only after you call [`makeKeyAndVisible()`](ui-window/makekeyandvisible.md).

The window doesn't lay out content itself. Its position and size are set by the system according to the scene, so you don't need to set `frame`. Interface content isn't added to the window directly; it goes in the root view controller's view: the window displays the root view of the view controller in [`rootViewController`](ui-window/rootviewcontroller.md); see [`UIViewController`](ui-view-controller.md). Views added directly to the window with `addSubview()` don't belong to any view controller.

One window per scene is enough. An iPhone usually has only one scene, so the whole app usually has only one window. Switching between screens isn't done by switching windows but by switching the root view controller, the [navigation stack](ui-navigation-controller.md), the [tab bar](ui-tab-bar-controller.md), and [modal presentation](ui-view-controller.md#modal-presentation).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIWindow`

For creating the first window and handling scene re-creation, see the guide [Creating windows and handling scenes](../guides/scenes-and-windows.md).

## Constructor

[`UIWindow()`](ui-window/constructor.md)

Creates a window. If a scene is passed, the window is placed in the scene right away; if not, only the JS object exists at first, and the window is created when `windowScene` is assigned.

## Instance properties

Also inherits the properties of [`UIView`](ui-view.md). The inherited property most often used on a window is `isHidden`, which decides whether the window is shown: **a window's `isHidden` defaults to `true`**, while an ordinary view's defaults to `false`. `overrideUserInterfaceStyle` set on a window applies to everything in the window; see [traits](ui-trait-collection.md). The window's `frame` is set by the system; don't write it.

| Property | Description |
| --- | --- |
| [`windowScene`](ui-window/windowscene.md) | The scene the window is in |
| [`rootViewController`](ui-window/rootviewcontroller.md) | The root view controller. The window displays its `view` |
| [`windowLevel`](ui-window/windowlevel.md) | The stacking order of multiple windows in the same scene |
| [`isKeyWindow`](ui-window/iskeywindow.md) <small>read-only</small> | Whether this window is the key window |
| [`canBecomeKeyWindow`](ui-window/canbecomekeywindow.md) <small>read-only</small> | Whether this window can become the key window |

## Instance methods

Also inherits the methods of [`UIView`](ui-view.md).

| Method | Description |
| --- | --- |
| [`makeKeyAndVisible()`](ui-window/makekeyandvisible.md) | Shows the window and makes it the key window |
| [`makeKeyWindow()`](ui-window/makekeywindow.md) | Only makes it the key window, without changing whether it is shown |

## Events

| Event | When it fires |
| --- | --- |
| [`becomevisible`](ui-window/becomevisible-event.md) | The window goes from hidden to shown |
| [`becomehidden`](ui-window/becomehidden-event.md) | The window goes from shown to hidden |
| [`becomekey`](ui-window/becomekey-event.md) | The window becomes the key window |
| [`resignkey`](ui-window/resignkey-event.md) | The window stops being the key window |
| `traitchange` | Inherited from [`UIView`](ui-view.md): the traits changed; see [traits](ui-trait-collection.md) |

- **Register listeners before `makeKeyAndVisible()`.** Listeners registered afterward don't receive events that have already fired.
- The events are not cancelable. Callbacks don't run synchronously at the moment of the change; they run a little later. See [How the runtime works](how-it-works.md).
- An event is fired only to the window that changed and isn't passed to any other object.

## Who keeps the window alive

Once a window is created on a scene, the scene keeps it. Ownership forms a chain: the scene keeps the window, the window keeps the root view controller, the view controller keeps its root view, and views keep their subviews. Objects on this chain aren't collected, and the event listeners and custom properties attached to them are kept too. When the `sceneconnect` callback ends and the local variable `win` goes away, the window stays on screen as usual.

The chain starts at the scene, so these objects live as long as the scene:

- While the scene exists, no variable is needed to hold them.
- When the system destroys the scene, the whole chain is collected, provided the app's code hasn't stored one of these objects outside the callback.
- When a new scene arrives, the `sceneconnect` callback runs again and builds a new set.

To get this window again later, read `view.window` from any view inside it. It returns the same object that was originally created.

## key window

At any moment, at most one window in a scene is the key window: input events without a location, such as keyboard input, go to it. Touch events have a location and go to the window under the finger, regardless of the key window.

These are iOS's rules. The acceptance tests have only one window, so how input is distributed among multiple windows is **not verified in the simulator**.

- An app with only one window needs to call `makeKeyAndVisible()` once and never deal with it again.
- With multiple windows, use `makeKeyWindow()` to choose which one is the key window.
- Read `isKeyWindow` to know whether a window currently is. When it changes, `becomekey` or `resignkey` fires.

## Examples

### The first window

Starting from a blank app, make a window and a view controller with a background color appear on screen. Every app starts with these lines.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**Effect**

- The screen changes from black to the system background color: white in light mode, black in dark mode.
- There is nothing else on screen. Everything else in the interface is added to `page.view`.

For what each step does and what happens if one is missing, see the guide [Creating windows and handling scenes](../guides/scenes-and-windows.md#the-first-window).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIWindow alloc] initWithWindowScene:scene]` | `new UIWindow(scene)` |
| `win.windowScene = scene` | `win.windowScene = scene` |
| `win.rootViewController = vc` | `win.rootViewController = vc` |
| `win.windowLevel = UIWindowLevelNormal` | `win.windowLevel = 0` |
| `[win makeKeyAndVisible]` | `win.makeKeyAndVisible()` |
| `[win makeKeyWindow]` | `win.makeKeyWindow()` |
| `win.isKeyWindow` | `win.isKeyWindow` |
| `win.hidden = NO` | `win.isHidden = false` |
| `UIWindowDidBecomeKeyNotification` | `win.addEventListener('becomekey', …)` |
| `UIWindowDidResignKeyNotification` | `win.addEventListener('resignkey', …)` |
| `UIWindowDidBecomeVisibleNotification` | `win.addEventListener('becomevisible', …)` |
| `UIWindowDidBecomeHiddenNotification` | `win.addEventListener('becomehidden', …)` |
| `- (void)scene:willConnectToSession:options:` (creating the window in `SceneDelegate`) | `application.addEventListener('sceneconnect', …)` |

Three differences from native:

- `init` and `initWithFrame:` have no counterpart. They are deprecated in iOS 26; a window can only be created through a scene.
- `becomeKeyWindow` and `resignKeyWindow` have no corresponding methods. In ObjC they are what the system uses to notify the window, not for the app to call. To make a window the key window, use `makeKeyWindow()`; to learn about the change, use the `becomekey` / `resignkey` events.
- Native code has to hold the window in a property, or the window is released. In JS that isn't needed and isn't recommended.

## See also

- [Creating windows and handling scenes](../guides/scenes-and-windows.md): the first window, switching the root view controller, hiding a window, overlay windows, scene re-creation
- [`UIWindowScene`](ui-window-scene.md): the scene the window is placed in
- [`application`](application.md): the `sceneconnect` event fires on it
- [`UIViewController`](ui-view-controller.md): the type of `rootViewController`
- [`UIView`](ui-view.md): the window's superclass, with inherited members such as `isHidden`
- [Native classes](native-classes.md): no subclassing, and the errors for "no native object exists"
