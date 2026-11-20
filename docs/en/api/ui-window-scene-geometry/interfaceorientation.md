---
type: reference
native: UIWindowSceneGeometry.interfaceOrientation
---

# `UIWindowSceneGeometry`: `interfaceOrientation` property

The **`interfaceOrientation`** property is the interface orientation.

## Value

A string: `'portrait'`, `'portraitUpsideDown'`, `'landscapeLeft'`, or `'landscapeRight'`; `'unknown'` when it isn't available.

- Read-only.
- It is the orientation the interface is actually displayed in, not how the phone is physically held: when the interface is locked to portrait, it stays `'portrait'` even if the phone is turned sideways.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.interfaceOrientation);
});
```

**Result**: with the phone held upright, logs `portrait`.

## Corresponding iOS API

`UIWindowSceneGeometry.interfaceOrientation`.
