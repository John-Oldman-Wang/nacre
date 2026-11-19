---
type: reference
native: UIImage.imageOrientation
---

# `UIImage`: `imageOrientation` property

The **`imageOrientation`** property is the orientation tag stored with the image. Photos taken by the camera are often stored sideways, and this tag says how to rotate them upright for display.

## Value

A string, one of:

| Value | Meaning |
| --- | --- |
| `'up'` | No rotation needed. PNGs from the app bundle in the acceptance tests have this value |
| `'down'` | The stored pixels are rotated 180° |
| `'left'` | The stored pixels are rotated 90° counterclockwise |
| `'right'` | The stored pixels are rotated 90° clockwise |
| `'upMirrored'`, `'downMirrored'`, `'leftMirrored'`, `'rightMirrored'` | The corresponding orientation, plus a mirror flip |

Values other than `'up'` are **not verified in the simulator**. The system rotates the image upright automatically by this tag when displaying it, so you usually don't need to read it.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.imageOrientation);
}
```

**Result**: The console prints `up`.

## Corresponding iOS API

`UIImage.imageOrientation`.

## See also

- [`size`](size.md): the width and height after rotating upright
