---
type: reference
web: BarcodeDetector.detect()
---

# `BarcodeDetector`: `detect()` method

The **`detect()`** method looks for barcodes in an image and fulfills with all it finds.

## Syntax

```
detect(image)
```

### Parameters

**`image`**

The image to search, one of these two:

- A [`UIImage`](../ui-image.md): an image bundled in the app, a photo taken with the camera, an image picked from the photo library.
- A [`Blob`](../blob.md) holding the bytes of an image file (PNG, JPEG, and the like).

The image's orientation information is taken into account: the coordinates refer to the image after it's turned upright.

### Return value

A `Promise` that fulfills with an array of the barcodes found. When none are found, it's an empty array (verified by testing).

Recognition runs in the background, so the interface doesn't freeze while a large image is being recognized. Several `detect()` calls can run at the same time (verified by testing with three images at once, each with the correct result). The same detector can be used again and again.

Each item in the array is a plain object (type name `DetectedBarcode`) with four fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `rawValue` | string | The content of the barcode. An empty string when the content isn't text |
| `format` | string | The barcode's format, one of the names in the table in [`BarcodeDetector()`](constructor.md#parameters) |
| `boundingBox` | `{ x, y, width, height }` | The rectangle enclosing the barcode |
| `cornerPoints` | array of `{ x, y }` | The barcode's four corners, in the order top-left, top-right, bottom-right, bottom-left (verified by testing) |

Coordinates are in **pixels of the image**, with the origin at the image's top-left corner and `y` increasing downward:

- Verified by testing: in a 400 × 400 pixel image with a QR code drawn 200 pixels square starting at (128, 28), `boundingBox` is about `(128, 28, 200, 200)`, and the four corners are about (128, 28), (328, 28), (328, 228), (128, 228).
- They are pixels, not points (pt). When a `UIImage` has a `scale` of 2, the coordinates are twice its `size`; divide by `scale` to get points. See [`size` is in points, not pixels](../ui-image.md#size-is-in-points-not-pixels).
- Recognizing the same image as a `UIImage` and as a `Blob` holding the same file gives the same box (verified by testing).

When an image contains several codes, all of them are in the array. Verified by testing: in a 640 × 400 pixel image with two QR codes side by side, both are found with the right content. The order of the array isn't fixed; to sort by position, sort by `boundingBox.x` yourself.

**Rejection**: in these cases the Promise is rejected instead of throwing synchronously.

- `TypeError`: `image` is neither a `UIImage` nor a `Blob` (a number, `null`, another native object): `detect needs a UIImage or a Blob, got …` (verified by testing).
- `TypeError`: the bytes in the `Blob` can't be decoded as an image: `detect could not decode the Blob as an image` (verified by testing).
- `TypeError`: the `UIImage` has no bitmap behind it: `detect needs a UIImage backed by a bitmap`. Which `UIImage`s are like this is **not verified on a device**.
- `Error`: recognition itself failed; the message is the reason the system gives. When this happens is **not verified on a device**.

### Exceptions

None. Every error rejects the returned Promise.

## Examples

### Recognize an image bundled in the app

```js
async function scanBundledImage() {
  const image = UIImage.imageNamed('JS/assets/qr');
  if (image === null) return;
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const codes = await detector.detect(image);
  for (const code of codes) {
    console.log(code.rawValue, code.boundingBox.x, code.boundingBox.y);
  }
}
scanBundledImage();
```

**Effect**: When the project's `assets/qr.png` contains a QR code, the console prints one line: the content of the code, and the pixel coordinates of the code's top-left corner in the image. When the image has no QR code, nothing is printed.

### Recognize an image from a file

```js
async function scanFile() {
  const fs = application.fileSystem;
  const bytes = await fs.readBytes(fs.assets + '/qr.png');
  const detector = new BarcodeDetector();
  const codes = await detector.detect(new Blob([bytes], { type: 'image/png' }));
  console.log(codes.map((code) => code.format + ' ' + code.rawValue).join('\n'));
}
scanFile().catch((err) => console.log(err instanceof Error ? err.message : String(err)));
```

**Effect**: Prints the format and content of each code in the image, one code per line, such as `qr_code https://example.com/a`. When the file isn't an image, it prints `detect could not decode the Blob as an image`.

## Differences from the web

- `image` only accepts a `UIImage` or a `Blob` holding the bytes of an image file.
- `boundingBox` is a plain object with only the four fields `x`, `y`, `width`, `height`.
- The `'unknown'` format never appears in the results.
- `'upc_a'` can be written in the constructor options but is never recognized.

## See also

- [`BarcodeDetector()`](constructor.md): look only for certain formats
- [Recognize codes in an image](../../guides/scanning.md#recognize-codes-in-an-image): recognize codes after taking or picking a photo
- [`UIImage`](../ui-image.md), [`Blob`](../blob.md)
