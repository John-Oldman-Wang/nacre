---
type: reference
native: UIWindowSceneGeometry.isInteractivelyResizing
---

# `UIWindowSceneGeometry`: `isInteractivelyResizing` property

The **`isInteractivelyResizing`** property indicates whether the user is currently resizing the scene by dragging (iOS 26 and later).

## Value

A boolean.

- Read-only.
- On iPhone the scene fills the screen, so it is normally `false` (tested).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.isInteractivelyResizing);
});
```

**Result**: logs `false`.

## Corresponding iOS API

`UIWindowSceneGeometry.isInteractivelyResizing`.
