---
type: reference
native: UIImage.scale
---

# `UIImage`: `scale` property

The **`scale`** property is the image's scale: how many pixels one point corresponds to.

## Value

A number, with no unit.

- For an image from `imageNamed()`, it depends on the file the system selected: 3 if it selected the `@3x` file.
- For an image from `imageWithData()`, it is 1 when `scale` isn't passed.
- The pixel count equals [`size`](size.md) times `scale`.

- Read-only; assigning to it throws `TypeError`.
- Images are immutable and this value never changes, so there are no change notifications.

## Examples

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.scale);
  console.log(dot.size.width * dot.scale);
}
```

**Result**: On a device with a @3x screen it prints `3`, then `30`. `3` means the system selected `dot@3x.png`.

## Corresponding iOS API

`UIImage.scale`.

## See also

- [`size`](size.md)
