---
type: reference
native: UIScreen.nativeScale
---

# `UIScreen`: `nativeScale` property

The **`nativeScale`** property is how many pixels one pt corresponds to on the physical screen.

## Value

A number with no unit: physical pixels per pt.

- Read-only. Assigning to it throws `TypeError`.
- On the iPhone Air simulator (iOS 27.2) it is `3`, the same as [`scale`](scale.md).
- When the user turns on Display Zoom in system settings, it differs from `scale`. This case is **not verified in the simulator**.
- No change notification.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.nativeScale);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `3`.

## Corresponding iOS API

`UIScreen.nativeScale`.

## See also

- [`scale`](scale.md)
- [`nativeBounds`](nativebounds.md)
