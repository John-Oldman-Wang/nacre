---
type: reference
native: "+[UIImage imageWithData:scale:]"
---

# `UIImage.imageWithData()` static method

The **`UIImage.imageWithData()`** static method decodes the bytes in a `Blob` into an image. Use it for images downloaded from the network.

## Syntax

```
UIImage.imageWithData(blob, [{ scale }])
```

### Parameters

**`blob`**

A [`Blob`](../fetch.md). Usually from `fetch`'s `res.blob()`. `ArrayBuffer` isn't accepted.

**`options.scale`**

Optional. A number for the image's scale: how many pixels one point corresponds to, with no unit. Defaults to 1. When given, [`size`](size.md) equals the pixel count divided by `scale`. A value not greater than 0 is treated as 1.

### Return value

A `UIImage`. Returns `null` when the bytes aren't in an image format the system supports, rather than throwing — for example, when the server returned an error page, or the content is SVG.

Each call creates a new image object from the bytes. If the bytes are an animated image, you get an animated image.

Without `scale`, a 200 × 200 pixel image has a `size` of 200 × 200 pt and is shown enlarged on a @3x screen.

### Exceptions

**`TypeError`**

- `blob` isn't a `Blob`: `imageWithData needs a Blob`.
- `options.scale` doesn't convert to a number: `scale must be a finite number, got "big"`.

## Examples

```js
const bytes = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2,
  0, 0, 0, 2, 8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 17, 73, 68, 65, 84,
  120, 218, 99, 248, 127, 144, 253, 63, 8, 51, 192, 24, 0, 101, 94, 11, 25,
  206, 178, 233, 129, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);
const blob = new Blob([bytes], { type: 'image/png' });   // A 2 × 2 pixel PNG

const a = UIImage.imageWithData(blob);
const b = UIImage.imageWithData(blob, { scale: 2 });
if (a && b) {
  console.log(a.size.width, a.scale);
  console.log(b.size.width, b.scale);
}
```

**Result**: The console prints `2 1` and `1 2`. That `scale` reads back as `2` on the second line is **not verified in the simulator**; that `size.width` is `1` is verified.

## Corresponding iOS API

`+[UIImage imageWithData:]`, `+[UIImage imageWithData:scale:]`. ObjC's `NSData` is a `Blob` here. The native method gives only the first frame of an animated image; here you get an animated image.

## See also

- [`fetch`](../fetch.md)
- [`prepareForDisplay()`](preparefordisplay.md): decode downloaded images in the background before displaying them
- [Displaying images](../../guides/images.md): the standard pattern for displaying network images
