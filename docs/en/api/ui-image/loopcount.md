---
type: reference
native: UIImage.loopCount
---

# `UIImage`: `loopCount` property

The **`loopCount`** property is how many times an animated image plays in total.

## Value

A number, a count with no unit, or `null`.

- `Infinity` when it loops forever.
- `null` for a static image.
- It can be assigned directly to a layer animation's `repeatCount`; see [`CAAnimation`](../ca-animation.md).

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading) {
  console.log(loading.loopCount);
}
```

**Result**: When `anim.gif` loops forever, the console prints `Infinity`.

## Corresponding iOS API

`UIImage.loopCount`.

## See also

- [`duration`](duration.md)
- [Animated images](../ui-image.md#animated-images)
