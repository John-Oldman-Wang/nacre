---
type: reference
native: SceneEvent
---

# `SceneEvent`

**`SceneEvent`** represents a scene connecting or disconnecting.

The [`sceneconnect`](application/sceneconnect-event.md) and [`scenedisconnect`](application/scenedisconnect-event.md) events of [`application`](application.md) are this class, and [`scene`](scene-event/scene.md) is that scene. A scene is one instance of the app's UI; see [`UIWindowScene`](ui-window-scene.md).

**Inheritance**: [`Event`](event.md) → `SceneEvent`

## Constructor

[`SceneEvent()`](scene-event/constructor.md)

Creates a `SceneEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`scene`](scene-event/scene.md) <small>read-only</small> | The scene that connected or disconnected |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`application`](application.md) | [`sceneconnect`](application/sceneconnect-event.md), [`scenedisconnect`](application/scenedisconnect-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e instanceof SceneEvent, e.scene instanceof UIWindowScene);
  const window = new UIWindow(e.scene);
  window.rootViewController = new UIViewController();
  window.makeKeyAndVisible();
});
```

**Effect**: when the app launches and the scene connects, it prints `true true`, and the screen shows a blank page.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| The `scene` parameter of `scene:willConnectToSession:options:` | `event.scene` of `sceneconnect` |
| The `scene` parameter of `sceneDidDisconnect:` | `event.scene` of `scenedisconnect` |

## See also

- [`UIWindowScene`](ui-window-scene.md): the scene
- [`application`](application.md): the object that fires these events
