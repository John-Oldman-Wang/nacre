---
type: reference
native: "-[UIImage prepareForDisplayWithCompletionHandler:]"
---

# `UIImage`: `prepareForDisplay()` method

The **`prepareForDisplay()`** method decodes the image into pixels in the background and, when done, gives an image ready to display directly.

An image object isn't decoded when you get it. Without this method, decoding happens the first time the image is displayed, on the same thread as interface updates. For images downloaded from the network, calling it before displaying is recommended; small icons don't need it.

## Syntax

```
prepareForDisplay()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with an already decoded `UIImage` of the same size as the original. When the system fails to decode, it fulfills with `null`, so check for `null` before using it and fall back to the original. The original is unchanged.

For an animated image, all frames are decoded and the result is still an animated image, with the same frame count, frame durations, and loop count as the original.

### Exceptions

None.

## Examples

```js
async function decode() {
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot === null) return;

  const ready = await dot.prepareForDisplay();
  if (ready) {
    console.log(ready.size.width === dot.size.width);
  }
}

decode();
```

**Result**: The console prints `true`.

## Corresponding iOS API

`-[UIImage prepareForDisplayWithCompletionHandler:]`. The completion handler is replaced by a Promise.

## See also

- [Large images and network images](../ui-image.md#large-images-and-network-images)
- [`prepareThumbnail()`](preparethumbnail.md)
