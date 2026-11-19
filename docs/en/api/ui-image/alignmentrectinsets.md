---
type: reference
native: UIImage.alignmentRectInsets
---

# `UIImage`: `alignmentRectInsets` property

The **`alignmentRectInsets`** property is the width subtracted from each of the image's four edges for Auto Layout alignment. It is for images with decorations such as shadows around them: alignment uses the area left after subtracting.

## Value

A [`UIEdgeInsets`](../structs.md), with all four values in [pt](../units.md).

The values are **not verified in the simulator**.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  const insets = dot.alignmentRectInsets;
  console.log(insets.top, insets.left, insets.bottom, insets.right);
}
```

**Result**: The console prints four numbers, in pt. **Not verified in the simulator.**

## Corresponding iOS API

`UIImage.alignmentRectInsets`.

## See also

- [Auto Layout](../auto-layout.md)
