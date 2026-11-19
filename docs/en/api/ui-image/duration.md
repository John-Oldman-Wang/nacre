---
type: reference
native: UIImage.duration
---

# `UIImage`: `duration` property

The **`duration`** property is how long one loop of an animated image takes.

## Value

A number, in seconds. 0 for a static image.

It equals the sum of all the durations in [`frameDurations`](framedurations.md). **"Equals the sum" is not verified in the simulator.**

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading) {
  console.log(loading.duration.toFixed(1));
}
```

**Result**: When `anim.gif` has 4 frames of 0.1 seconds each, the console prints `0.4`.

## Corresponding iOS API

`UIImage.duration`.

## See also

- [`frameDurations`](framedurations.md), [`loopCount`](loopcount.md)
- [Animated images](../ui-image.md#animated-images)
