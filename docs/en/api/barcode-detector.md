---
type: reference
web: BarcodeDetector
---

# `BarcodeDetector`

**`BarcodeDetector`** represents a detector that finds barcodes in an image. Barcodes include over a dozen formats, such as QR codes and product barcodes. Give it a [`UIImage`](ui-image.md), or a [`Blob`](blob.md) holding the bytes of an image file, and it finds every barcode in the image: each code's content, its format, and its position in the image.

It's in the core, so it needs no package and no camera authorization. The image can come from anywhere: an image bundled with the app, a photo taken, an image picked from the photo library, or an image downloaded from the web. Recognition happens in the background, so recognizing a large image doesn't freeze the UI.

To recognize codes in the camera's live picture, use [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) from the `@nacrejs/av-capture` package.

**Inheritance**: `BarcodeDetector` doesn't inherit from any other class (verified by testing).

## Constructor

[`BarcodeDetector()`](barcode-detector/constructor.md)

Creates a detector. You can specify which formats to look for; if you don't, it looks for every format this device recognizes.

## Static methods

[`BarcodeDetector.getSupportedFormats()`](barcode-detector/getsupportedformats.md)

Which formats this device recognizes; fulfills with an array of format names.

## Instance methods

| Method | Description |
| --- | --- |
| [`detect()`](barcode-detector/detect.md) | Finds barcodes in an image; fulfills with all of them |

## Examples

### Recognize an image bundled with the app

Starting from a blank app. Put an image with a QR code, `qr.png`, in the project's `assets/`.

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const image = UIImage.imageNamed('JS/assets/qr');
  if (image === null) {
    console.log('Image not found');
    return;
  }
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const codes = await detector.detect(image);
  console.log('Found ' + codes.length);
  for (const code of codes) {
    const box = code.boundingBox;
    console.log(code.rawValue + ' at (' + box.x + ', ' + box.y + '), ' + box.width + ' × ' + box.height + ' pixels');
  }
}
main();
```

**Result**

- When the image has one QR code, it prints `Found 1`, followed by a line with the code's content and its position in the image. Verified by testing with a 400 × 400 pixel image whose code contains `https://example.com/a`: the box is at about (128, 28), 200 × 200 pixels.
- When the image has no QR code, it prints `Found 0`.

For how to write the path for `UIImage.imageNamed()`, see [Where bundled images go](ui-image.md#where-bundled-images-go).

## Differences from the web

- The parameter of `detect()` is a `UIImage` or a `Blob` holding the bytes of an image file.
- `getSupportedFormats()` gives 12 formats on an iPhone 14 (verified by testing), without `'upc_a'`. `'upc_a'` can be passed to the constructor, but it is never recognized.
- `boundingBox` in the results is a plain object with only the four fields `x`, `y`, `width`, and `height`.
- `format` in the results is never `'unknown'`.

## See also

- [`detect()`](barcode-detector/detect.md): every field of the results
- [Scanning codes](../guides/scanning.md#recognize-codes-in-an-image): recognizing codes in a photo taken or an image picked
- [`UIImage`](ui-image.md), [`Blob`](blob.md): where images come from
- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md): recognizing codes in the camera's live picture
