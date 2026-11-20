---
type: reference
native: UIWindowScene
status: partial
---

# `UIWindowScene`

**`UIWindowScene`** represents one instance of the App's UI, called a scene. Every window of the App belongs to a scene, and the scene determines which screen those windows appear on and whether they are in the foreground or background right now.

A scene is the prerequisite for any UI. A window ([`UIWindow`](ui-window.md)) must be built on a scene to be shown, and view controllers and views must be put in a window to be shown. Without a scene, the App's code still runs, but nothing can be shown on screen.

Scenes are created and destroyed by the system; the App can't create one itself. When the system has created a scene, it fires the [`sceneconnect`](application/sceneconnect-event.md) event on [`application`](application.md), and the event object's `scene` property is that scene; when the scene is taken away, it fires [`scenedisconnect`](application/scenedisconnect-event.md). Once a scene is connected, it can also be read from [`application.scenes`](application/scenes.md).

Each scene has a session, a [`UISceneSession`](ui-scene-session.md), read from [`session`](ui-window-scene/session.md). A scene object may be destroyed and recreated by the system; the session lives longer than the scene object and can be used to store that scene's data.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → `UIScene` → `UIWindowScene`

`UIScene` is the base class of scenes. It has no usable members of its own and can't be constructed: `new UIScene()` throws `TypeError: Illegal constructor: UIScene cannot be constructed`.

For how to rebuild the UI after a scene is destroyed and where to store data, see the guide [Creating windows and handling scenes](../guides/scenes-and-windows.md).

## Constructor

Can't be created with `new`. `new UIWindowScene()` throws `TypeError: Illegal constructor: UIWindowScene is created by the runtime, not by new`. There are only two ways to get a scene: `e.scene` from the `sceneconnect` event, and `application.scenes`. Scenes can't be subclassed either; see [Native classes: no subclassing](native-classes.md#no-subclassing).

## Instance properties

| Property | Description |
| --- | --- |
| [`activationState`](ui-window-scene/activationstate.md) <small>read-only</small> | Whether this scene is shown and interactive right now |
| [`session`](ui-window-scene/session.md) <small>read-only</small> | This scene's session: the scene's persistent identity |
| [`traitCollection`](ui-window-scene/traitcollection.md) <small>read-only</small> | The appearance traits of the whole scene, such as whether Settings is set to dark or light |
| [`isFullScreen`](ui-window-scene/isfullscreen.md) <small>read-only</small> | Whether the scene fills the whole screen |
| [`screen`](ui-window-scene/screen.md) <small>read-only</small> | Which screen this scene appears on |
| [`effectiveGeometry`](ui-window-scene/effectivegeometry.md) <small>read-only</small> | The current geometry: the interface orientation and whether it is locked |
| [`statusBarManager`](ui-window-scene/statusbarmanager.md) <small>read-only</small> | What the status bar looks like right now |
| [`title`](ui-window-scene/title.md) | The title shown on the card in the app switcher |
| [`subtitle`](ui-window-scene/subtitle.md) | The subtitle shown on the card in the app switcher |

## Instance methods

| Method | Description |
| --- | --- |
| [`openURL()`](ui-window-scene/openurl.md) | Asks the system to open a URL: go to Safari, dial a number, go to another App |
| [`requestGeometryUpdateWithPreferences()`](ui-window-scene/requestgeometryupdatewithpreferences.md) | Asks to rotate the interface to a given orientation |

## Events

| Event | When it fires |
| --- | --- |
| [`inactive`](ui-window-scene/inactive-event.md) | This scene is about to stop being active: about to go to the background, or temporarily interrupted |
| [`background`](ui-window-scene/background-event.md) | This scene has entered the background |
| [`foreground`](ui-window-scene/foreground-event.md) | This scene is about to return to the foreground |
| [`active`](ui-window-scene/active-event.md) | This scene has become active and the user can interact |
| [`traitchange`](ui-window-scene/traitchange-event.md) | The scene's appearance traits changed |
| [`geometrychange`](ui-window-scene/geometrychange-event.md) | The interface rotated. Dispatched on the spot; listeners run inside the rotation animation |

- Events are not cancelable. Callbacks don't run synchronously at the moment the state changes; they run a little later. See [How the runtime works](how-it-works.md#events).
- You can also listen for and dispatch events with custom names on a scene, the same as with any `EventTarget`.
- Connecting and disconnecting scenes are not in this table: they are `sceneconnect` and `scenedisconnect` on `application`.

## Number of scenes

How many scenes an App has at the same time depends on the device:

| Device | Number of scenes |
| --- | --- |
| iPhone | One. There may be one more when an external display is connected |
| iPad | The user can open several windows of the same App, and each window is a scene. Each scene's UI and foreground/background state are independent |

To find out whether the App allows several scenes at once, read [`application.supportsMultipleScenes`](application/supportsmultiplescenes.md). Multiple scenes on iPad are **not verified in the simulator**.

## When there is no scene

In these cases the App's code is running, but no scene is available:

- **Right after the App launches, while the script's top level runs.** The system creates the scene only after the script finishes, so `application.scenes` is an empty array at that point. That's why code that builds the UI can't go at the top level; it goes in the `sceneconnect` callback.
- **After the system destroys the scene.** After the App goes to the background, the system can destroy the scene to reclaim memory; `scenedisconnect` fires on `application` then.
- **The user closed a window.** On iPad, the user can close one of the App's windows from the multitasking view, and the corresponding scene is destroyed.

The last two cases are **not verified in the simulator**: the system never destroyed a scene during the acceptance tests.

## After a scene is destroyed

A destroyed scene doesn't mean the App restarts. The App's process is still there, and so are the JS variables, data, and unfinished network requests. Only that scene and the UI on it are destroyed.

After destruction, these things happen in order:

1. The system fires `scenedisconnect` on `application`; the event object's `scene` is the destroyed scene.
2. The runtime stops keeping that scene. If the App's code doesn't keep it either, the scene is garbage-collected together with its windows, view controllers, and all views, and the memory goes back to the system.
3. When the user returns to the App, the system creates a **new** scene object and fires `sceneconnect` again.

The new scene and the old scene are two different objects. Their `session` represents the same UI: `session.persistentIdentifier` is the same, and the data stored in `session.userInfo` is still there. This process comes from the runtime's code and iOS's definition and is **not verified in the simulator**.

If the App's code stored the scene in a variable outside the callback, or attached it to a long-lived object such as `application`:

- **The old scene is not released.** Its windows, view controllers, and all views stay in memory too.
- **The old scene is no longer usable.** Its windows are no longer shown on screen. New windows built on it aren't shown either. Reading its `activationState` gives `'unattached'`.
- **No error is reported.** Reading and writing the old scene's properties doesn't throw, so this mistake is hard to notice.

Attaching it to `application` has the worst consequence: `application` exists for as long as the App runs, so a scene attached to it is never released. Every time the scene is destroyed and recreated, one more copy is left behind. These points are **not verified in the simulator**.

## Scene state and App state

There are two ways to read foreground/background state and two sets of events:

| | About what | Reading the state | Events |
| --- | --- | --- | --- |
| Scene level | This one scene | `scene.activationState` | `active` / `inactive` / `foreground` / `background` on `scene` |
| App level | All scenes combined | [`application.state`](application/state.md) | The events of the same names on `application` |

With only one scene, the two sets of events come in pairs. The two states update at different moments. For the same `inactive` event, the values read in the callback, as measured:

| Event | Read in the callback |
| --- | --- |
| `inactive` on `scene` | `scene.activationState` is `'foregroundInactive'`, already the new value |
| `inactive` on `application` | `application.state` is `'active'`, still the old value |

To determine "what the state is now" in an event callback, read `scene.activationState`.

## The same scene is always the same object

The same scene is the same object in JS no matter where you got it from, and can be compared with `===`. So event listeners attached to a scene are never lost. You can also attach custom properties to a scene, and reading it from elsewhere gives the same ones; see [Native classes: custom properties are allowed](native-classes.md#custom-properties-are-allowed).

## Examples

### Observing scene state changes

Starting from a blank App: get the scene, build a window and view controller on it, then listen for the scene's state changes and log a line to the console on each change.

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;

  const win = new UIWindow(scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  for (const type of ['active', 'inactive', 'foreground', 'background']) {
    scene.addEventListener(type, (ev) => {
      console.log('Scene event:', ev.type, '| State:', scene.activationState);
    });
  }
});
```

**Effect**

- A blank view controller appears on screen, with the system background color (white in light mode).
- When the user presses Home to go to the Home Screen, the console logs two lines: `inactive`, then `background`.
- When the user switches back to the App, the console logs two lines: `foreground`, then `active`.

The first line in full is `Scene event: inactive | State: foregroundInactive` (measured); the state values in the other three lines are **not verified in the simulator**. The order `inactive` → `background` → `foreground` → `active` was measured on the events of the same names on `application`; the order of the scene events is **not verified in the simulator**. Whether `foreground` and `active` are also logged after the scene connects at App launch is **not verified in the simulator**.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `scene:willConnectToSession:options:` / `UISceneWillConnectNotification` | `application.addEventListener('sceneconnect', (e) => { e.scene })` |
| `sceneDidDisconnect:` / `UISceneDidDisconnectNotification` | `application.addEventListener('scenedisconnect', …)` |
| `sceneDidBecomeActive:` / `UISceneDidActivateNotification` | `scene.addEventListener('active', …)` |
| `sceneWillResignActive:` / `UISceneWillDeactivateNotification` | `scene.addEventListener('inactive', …)` |
| `sceneWillEnterForeground:` / `UISceneWillEnterForegroundNotification` | `scene.addEventListener('foreground', …)` |
| `sceneDidEnterBackground:` / `UISceneDidEnterBackgroundNotification` | `scene.addEventListener('background', …)` |
| `UIApplication.sharedApplication.connectedScenes` | `application.scenes` |
| `scene.activationState == UISceneActivationStateForegroundActive` | `scene.activationState === 'foregroundActive'` |
| `[[UIWindow alloc] initWithWindowScene:scene]` | `new UIWindow(scene)` |
| `scene.fullScreen` | `scene.isFullScreen` |
| `scene.title = @"Inbox"` | `scene.title = 'Inbox'` |
| `[scene openURL:url options:nil completionHandler:^(BOOL ok){}]` | `await scene.openURL(url)` |
| `scene.session.persistentIdentifier` | `scene.session.persistentIdentifier` |
| `scene.session.userInfo = @{ @"kind": @"mailDetail" }` | `scene.session.userInfo = { kind: 'mailDetail' }` |

## See also

- [Creating windows and handling scenes](../guides/scenes-and-windows.md): the recommended approach, where to store data, foreground and background, sessions
- [`UISceneSession`](ui-scene-session.md): the scene's session
- [`application`](application.md): the `sceneconnect` / `scenedisconnect` events, the `scenes` property, and the App-level foreground/background events
- [`UIWindow`](ui-window.md): building a window on a scene to make the UI appear
- [Native classes](native-classes.md): which classes can be constructed, can't be subclassed, and accept custom properties
