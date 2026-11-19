---
type: reference
native: "-[UIImage prepareThumbnailOfSize:completionHandler:]"
---

# `UIImage`: `prepareThumbnail()` method

The **`prepareThumbnail()`** method makes a scaled-down image in the background and decodes it. Use it when the display size is much smaller than the original (such as avatars in a list).

## Syntax

```
prepareThumbnail(size)
```

### Parameters

**`size`**

The thumbnail's target size, in [pt](../units.md). A [`CGSize`](../structs.md) object, or a plain object with `width` and `height`.

### Return value

A `Promise` that fulfills with an already decoded thumbnail. When the system fails to decode, it fulfills with `null`. The original is unchanged.

The thumbnail's actual size is **not verified in the simulator**. Called on an animated image, the result is a static image: a thumbnail of the first frame.

### Exceptions

**`TypeError`**, thrown synchronously rather than as a rejected Promise:

- `size` isn't an object: `prepareThumbnail needs an object with all of: width, height`.
- A field is missing: `prepareThumbnail is missing width, or it is not a finite number`.

## Examples

```js
async function showThumbnail() {
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot === null) return;

  const thumbnail = await dot.prepareThumbnail(new CGSize(5, 5));
  if (thumbnail) {
    const iv = new UIImageView();
    iv.image = thumbnail;
  }
}

showThumbnail();
```

**Effect**: The image view gets a scaled-down image.

## Corresponding iOS API

`-[UIImage prepareThumbnailOfSize:completionHandler:]`. The completion handler is replaced by a Promise.

## See also

- [`prepareForDisplay()`](preparefordisplay.md)
