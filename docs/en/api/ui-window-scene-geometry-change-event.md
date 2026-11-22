---
type: reference
native: UIWindowSceneGeometryChangeEvent
---

# `UIWindowSceneGeometryChangeEvent`

**`UIWindowSceneGeometryChangeEvent`** represents a change in a scene's geometry, for example the phone being rotated.

The [`geometrychange`](ui-window-scene/geometrychange-event.md) event of [`UIWindowScene`](ui-window-scene.md) is this class. It carries the interface orientation from before the change; read the current one from the scene's `effectiveGeometry`.

**Inheritance**: [`Event`](event.md) → `UIWindowSceneGeometryChangeEvent`

## Constructor

[`UIWindowSceneGeometryChangeEvent()`](ui-window-scene-geometry-change-event/constructor.md)

Creates a `UIWindowSceneGeometryChangeEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`previousInterfaceOrientation`](ui-window-scene-geometry-change-event/previousinterfaceorientation.md) <small>read-only</small> | The interface orientation before the change |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIWindowScene`](ui-window-scene.md) | [`geometrychange`](ui-window-scene/geometrychange-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('geometrychange', (change) => {
    console.log(change instanceof UIWindowSceneGeometryChangeEvent, change.previousInterfaceOrientation);
  });
});
```

**Effect**: when the phone rotates, prints `true` and the orientation from before.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `windowScene:didUpdateEffectiveGeometry:` | The `geometrychange` event |
| `previousEffectiveGeometry.interfaceOrientation` | `event.previousInterfaceOrientation` |

## See also

- [`geometrychange`](ui-window-scene/geometrychange-event.md): when it is fired
- [`UIWindowSceneGeometry`](ui-window-scene-geometry.md): the current geometry
