---
type: reference
native: UIWindowSceneGeometry.isInterfaceOrientationLocked
---

# `UIWindowSceneGeometry`: `isInterfaceOrientationLocked` property

The **`isInterfaceOrientationLocked`** property indicates whether the interface orientation is locked right now (iOS 26 and later).

## Value

A boolean.

- Read-only.
- `true` when the view controller's [`prefersInterfaceOrientationLocked`](../ui-view-controller/prefersinterfaceorientationlocked.md) is `true` and the system agrees. The locked case is **not verified in the simulator**.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.isInterfaceOrientationLocked);
});
```

**Result**: logs `false`.

## Corresponding iOS API

`UIWindowSceneGeometry.isInterfaceOrientationLocked`.
