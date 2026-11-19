---
type: reference
native: UIImage.frameDurations
---

# `UIImage`: `frameDurations` property

The **`frameDurations`** property is how long each frame of an animated image is shown.

## Value

An array of numbers, in seconds, or `null`.

- It has the same length as [`images`](images.md).
- Durations that are too short in the file read as 0.1: measured, frames written as 0.01 seconds and 0.005 seconds in the file both read as 0.1.
- `null` for a static image.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading && loading.frameDurations) {
  console.log(loading.frameDurations.join(','));
}
```

**Result**: When `anim.gif` has 4 frames of 0.1 seconds each, the console prints `0.1,0.1,0.1,0.1`.

## Corresponding iOS API

`UIImage.frameDurations`.

## See also

- [`images`](images.md), [`duration`](duration.md)
