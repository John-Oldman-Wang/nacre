---
type: reference
native: UIWindowSceneGeometry
---

# `UIWindowSceneGeometry`

**`UIWindowSceneGeometry`** represents a scene's geometry at a given moment: the interface orientation, whether the orientation is locked, and whether the scene is being resized interactively. It holds the values from the moment it was read and doesn't change afterward.

**Inheritance**: `EventTarget` → `NSObject` → `UIWindowSceneGeometry`

## Constructor

Can't be created with `new`; doing so throws `TypeError`. Read it from the scene's [`effectiveGeometry`](ui-window-scene/effectivegeometry.md).

## Instance properties

All read-only.

| Property | Description |
| --- | --- |
| [`interfaceOrientation`](ui-window-scene-geometry/interfaceorientation.md) <small>read-only</small> | The interface orientation |
| [`isInterfaceOrientationLocked`](ui-window-scene-geometry/isinterfaceorientationlocked.md) <small>read-only</small> | Whether the orientation is locked |
| [`isInteractivelyResizing`](ui-window-scene-geometry/isinteractivelyresizing.md) <small>read-only</small> | Whether the scene is being resized by dragging |

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const geometry = e.scene.effectiveGeometry;
  console.log(geometry.interfaceOrientation, geometry.isInteractivelyResizing);
});
```

**Result**: with the phone held upright, logs `portrait false`.

## Corresponding iOS API

`UIWindowSceneGeometry`.

## See also

- [`UIWindowScene`](ui-window-scene.md)
- [`geometrychange`](ui-window-scene/geometrychange-event.md)
