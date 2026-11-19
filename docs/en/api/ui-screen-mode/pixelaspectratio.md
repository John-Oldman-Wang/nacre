---
type: reference
native: UIScreenMode.pixelAspectRatio
---

# `UIScreenMode`: `pixelAspectRatio` property

The **`pixelAspectRatio`** property is the width-to-height ratio of one pixel in this display mode.

## Value

A number with no unit: the width of a pixel divided by its height.

- Read-only; assigning to it throws `TypeError`.
- `1` means the pixels are square. It's `1` in the iPhone Air simulator (iOS 27.2).
- The value doesn't change for a given display mode object.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentMode !== null && screen.currentMode.pixelAspectRatio);
});
```

**Result**: In the iPhone Air simulator (iOS 27.2), prints `1`.

## Corresponding iOS API

`UIScreenMode.pixelAspectRatio`.

## See also

- [`UIScreenMode`](../ui-screen-mode.md)
