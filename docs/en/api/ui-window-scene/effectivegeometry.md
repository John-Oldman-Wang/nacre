---
type: reference
native: UIWindowScene.effectiveGeometry
---

# `UIWindowScene`: `effectiveGeometry` property

The **`effectiveGeometry`** property is this scene's current geometry: the interface orientation and whether the orientation is locked.

## Value

A [`UIWindowSceneGeometry`](../ui-window-scene-geometry.md).

- Read-only. Assigning to it throws `TypeError`.
- Each read returns a new object holding the values from the moment it was read; it doesn't change afterward. When the orientation changes, [`geometrychange`](geometrychange-event.md) fires; read it again there.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.interfaceOrientation);
});
```

**Result**: with the phone held upright, logs `portrait`.

## Corresponding iOS API

`UIWindowScene.effectiveGeometry`. As of iOS 26 the older `UIWindowScene.interfaceOrientation` is deprecated; read the orientation here instead.

## See also

- [`UIWindowSceneGeometry`](../ui-window-scene-geometry.md)
- [`geometrychange`](geometrychange-event.md)
