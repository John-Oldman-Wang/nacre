---
type: reference
native: UIWindowScene.screen
---

# `UIWindowScene`: `screen` property

The **`screen`** property is the screen this scene appears on.

## Value

A [`UIScreen`](../ui-screen.md).

- Read-only. Assigning to it throws `TypeError`.
- Every read on the same scene returns the same object.
- It is the only way for JS to get a screen.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen === e.scene.screen, screen.scale);
});
```

**Result**: logs `true 3` on the iPhone Air simulator (iOS 27.2).

## Corresponding iOS API

`UIWindowScene.screen`. ObjC's `UIScreen.mainScreen` is deprecated in iOS 26 and isn't provided here; read the screen from the scene.

## See also

- [`UIScreen`](../ui-screen.md)
