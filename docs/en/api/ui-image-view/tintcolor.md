---
type: reference
native: UIImageView.tintColor
---

# `UIImageView`: `tintColor` property

The **`tintColor`** property is the color the image view uses to tint template images. A template image is an image that uses only its shape, not its own colors: every non-transparent part of the image is shown in this color.

## Value

A [color](../ui-color.md) string.

- Readable and writable.
- The default value is the system's default accent color. The string read for the default value is **not verified in the simulator**.
- Writing accepts a color string or a `UIColor` object. Writing `null` restores the default value.
- The string read back is the same as the one written: writing `'systemPink'` reads back `'systemPink'`.
- It affects only template images. SF Symbols icons are treated as template images in an image view; your own images show their original colors by default and must first be converted to template images with [`imageWithRenderingMode('alwaysTemplate')`](../ui-image/imagewithrenderingmode.md). This color has no effect when the image's `renderingMode` is `'alwaysOriginal'`. See [Rendering mode and `tintColor`](../ui-image.md#rendering-mode-and-tintcolor).

### Invalid values

Writing an invalid color doesn't throw. The console logs a warning and the color keeps its previous value:

```
[Nacre] tintColor: "#GGG" is not a valid color, ignored
```

## Examples

```js
const iv = new UIImageView();
iv.image = UIImage.systemImageNamed('star.fill');
iv.tintColor = '#FF3B30';
console.log(iv.tintColor);
```

**Effect**

- The star appears red. **Not verified in the simulator.**
- The console logs `#FF3B30`.

## Corresponding iOS API

`UIView.tintColor`. Natively it is a property of every view; here it is provided only on image views.

## See also

- [`UIColor`](../ui-color.md): all the ways to write a color string
- [`renderingMode`](../ui-image/renderingmode.md)
