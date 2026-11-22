---
type: reference
native: UIWindowSceneGeometryChangeEvent.previousInterfaceOrientation
---

# `UIWindowSceneGeometryChangeEvent`: `previousInterfaceOrientation` property

The **`previousInterfaceOrientation`** property is the interface orientation from before the change.

## Value

A string, one of:

- Read-only. Assigning to it throws `TypeError`.
- `'portrait'`: upright, home area at the bottom.
- `'portraitUpsideDown'`: upright, upside down.
- `'landscapeLeft'`, `'landscapeRight'`: the two landscape orientations.
- `'unknown'`: the orientation is unknown.
- Read the current orientation from `interfaceOrientation` of [`effectiveGeometry`](../ui-window-scene/effectivegeometry.md).
- When the event is created with [`new`](constructor.md) without it, it is `'unknown'`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('geometrychange', (change) => {
    console.log(change.previousInterfaceOrientation, '→', scene.effectiveGeometry.interfaceOrientation);
  });
});
```

**Effect**: rotating the phone from portrait to landscape prints a line such as `portrait → landscapeRight`.

## Corresponding iOS API

`interfaceOrientation` of the `previousEffectiveGeometry` parameter of `windowScene:didUpdateEffectiveGeometry:`.

## See also

- [`UIWindowSceneGeometryChangeEvent`](../ui-window-scene-geometry-change-event.md)
