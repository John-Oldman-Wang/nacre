---
type: reference
native: SceneEvent.scene
---

# `SceneEvent`: `scene` property

The **`scene`** property is the scene that connected or disconnected.

## Value

A [`UIWindowScene`](../ui-window-scene.md).

- Read-only. Assigning to it throws `TypeError`.
- In `sceneconnect`, it is the scene the system just created; build the window on it.
- In `scenedisconnect`, it is the scene being destroyed.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const window = new UIWindow(e.scene);
  window.rootViewController = new UIViewController();
  window.makeKeyAndVisible();
});
```

**Effect**: when the scene connects, a window is built and the screen shows a blank page.

## Corresponding iOS API

The `scene` parameter of `scene:willConnectToSession:options:` and `sceneDidDisconnect:`.

## See also

- [`SceneEvent`](../scene-event.md)
- [`sceneconnect`](../application/sceneconnect-event.md)
- [`scenedisconnect`](../application/scenedisconnect-event.md)
