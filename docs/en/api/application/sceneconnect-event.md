---
type: reference
native: UISceneWillConnectNotification
---

# `Application`: `sceneconnect` event

The **`sceneconnect`** event fires when the system has created a scene and hands it to the app. Put the code that builds the UI in its callback.

## Syntax

```
application.addEventListener('sceneconnect', (event) => { })
```

## Event object

`Event`, with one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| `scene` | [`UIWindowScene`](../ui-window-scene.md) | The scene the system just created |

`target` is `application`. Not cancelable; `cancelable` is `false`.

## When it fires

- **After `main.js` finishes running.** After the app launches, the runtime first runs all of `main.js`, and only then does the system create the scene. So while the top level of `main.js` is running there's no scene, and no window that can be displayed can be created.
- **Register the listener at the top level of `main.js`.** The runtime guarantees that this event fires only after `main.js` finishes, so a listener registered at the top level always receives it. The event isn't replayed: if you register only after some `Promise` fulfills, the event may already have fired and the listener won't receive it.
- **It may fire more than once.** It fires once when the app launches; if the system later destroys the scene, it creates a new scene when the user returns to the app and fires again. So write the callback so it can run repeatedly: build the UI from scratch with `e.scene` each time, without relying on the window and view controllers built last time. Multiple connections are **not verified in the simulator**.
- When it fires, `e.scene` is already in [`application.scenes`](scenes.md) and is the same object as the element there.
- The system also creates scenes for its own internal use when the keyboard appears. Such scenes don't cause `sceneconnect`.
- When the app is launched by a link, [`openurl`](openurl-event.md) comes after the `sceneconnect` of the same scene.
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
  console.log(e.scene instanceof UIWindowScene);
});
```

**Effect**: after the app launches, the screen shows a blank view controller with the system background color. The console prints `true`.

You don't need to store `win` and `page` outside the callback: once the window is created on the scene and the view controller is handed to the window, the runtime keeps them alive.

## Corresponding iOS API

`UISceneWillConnectNotification`, i.e. `scene:willConnectToSession:options:` of `SceneDelegate`.

## See also

- [Creating windows and handling scenes](../../guides/scenes-and-windows.md): how to organize startup code and where to keep data
- [`scenedisconnect`](scenedisconnect-event.md)
