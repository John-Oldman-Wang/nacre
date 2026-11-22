---
type: reference
native: "-[UIWindowSceneDelegate windowScene:didUpdateEffectiveGeometry:]"
---

# `UIWindowScene`: `geometrychange` event

The **`geometrychange`** event fires when the scene's geometry changes, most commonly when the interface rotates.

## Syntax

```
scene.addEventListener('geometrychange', (event) => { })
```

## Event object

[`UIWindowSceneGeometryChangeEvent`](../ui-window-scene-geometry-change-event.md). Besides `type` and `target` (this scene), it carries one read-only field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`previousInterfaceOrientation`](../ui-window-scene-geometry-change-event/previousinterfaceorientation.md) | string | The orientation before the change. Read the current orientation from `scene.effectiveGeometry` |

Not cancelable.

## When it fires

- Fires when the interface rotates: the user turned the phone, or code called [`requestGeometryUpdateWithPreferences()`](requestgeometryupdatewithpreferences.md).
- **Dispatched on the spot**: listeners run inside the rotation animation. If a listener changes a view's `frame`, or changes constraints and then calls `layoutIfNeeded()`, those changes rotate along with the screen (tested). Make the changes in the listener itself; changes put into a `setTimeout` jump into place after the rotation finishes.
- When the listener runs, views already have their new size and `scene.effectiveGeometry` already reports the new orientation (tested).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('geometrychange', (change) => {
    console.log(change.previousInterfaceOrientation, '→', scene.effectiveGeometry.interfaceOrientation);
  });
});
```

**Effect**: rotating from portrait to landscape logs `portrait → landscapeRight`.

## Corresponding iOS API

`windowScene:didUpdateEffectiveGeometry:` of the scene delegate (iOS 26).

## See also

- [`effectiveGeometry`](effectivegeometry.md)
- [`requestGeometryUpdateWithPreferences()`](requestgeometryupdatewithpreferences.md)
