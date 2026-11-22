---
type: reference
native: UISceneDidDisconnectNotification
---

# `Application`: `scenedisconnect` event

The **`scenedisconnect`** event fires when the system destroys a scene.

## Syntax

```
application.addEventListener('scenedisconnect', (event) => { })
```

## Event object

[`SceneEvent`](../scene-event.md), with one extra read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`scene`](../scene-event/scene.md) | [`UIWindowScene`](../ui-window-scene.md) | The scene being destroyed |

`target` is `application`. Not cancelable.

## When it fires

- After the app enters the background, the system can destroy scenes to reclaim memory; on iPad, the user can also close one of the app's windows from the multitasking interface.
- When it fires, the scene has already been removed from [`application.scenes`](scenes.md).
- After destruction, windows, view controllers, and views the app hasn't kept are reclaimed along with it. When the user returns to the app, the system creates a new scene and fires [`sceneconnect`](sceneconnect-event.md) again.
- Firing of this event is **not verified in the simulator**: the system never destroyed a scene during acceptance testing.

## Examples

```js
/** @type {Map<UIWindowScene, UINavigationController>} */
const navigators = new Map();

application.addEventListener('sceneconnect', (e) => {
  const nav = new UINavigationController(new UIViewController());
  const win = new UIWindow(e.scene);
  win.rootViewController = nav;
  win.makeKeyAndVisible();
  navigators.set(e.scene, nav);
});

application.addEventListener('scenedisconnect', (e) => {
  navigators.delete(e.scene);
});
```

**Effect**: when a scene connects, its navigation controller is recorded in the map; when the scene is destroyed, the entry is deleted, so the map never keeps destroyed scenes. **Not verified in the simulator.**

## Corresponding iOS API

`UISceneDidDisconnectNotification`, i.e. `sceneDidDisconnect:`.

## See also

- [After a scene is destroyed](../ui-window-scene.md#after-a-scene-is-destroyed)
