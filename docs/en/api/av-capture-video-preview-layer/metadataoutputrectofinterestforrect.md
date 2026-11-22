---
type: reference
native: "-[AVCaptureVideoPreviewLayer metadataOutputRectOfInterestForRect:]"
---

# `AVCaptureVideoPreviewLayer`: `metadataOutputRectOfInterestForRect()` method

The **`metadataOutputRectOfInterestForRect()`** method converts a rectangle in this layer into the fractions used by a metadata output's [`rectOfInterest`](../av-capture-metadata-output/rectofinterest.md). Use it to make the output recognize only codes inside the scanning frame on screen.

## Syntax

```
metadataOutputRectOfInterestForRect(rect)
```

### Parameters

**`rect`**

A rectangle in the layer, in pt, with the origin at the layer's top-left corner. It can be a [`CGRect`](../cg-rect.md) or a plain object with the four numbers `x`, `y`, `width`, `height`.

### Return value

A [`CGRect`](../cg-rect.md) whose numbers are fractions from 0 to 1; see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture). Write it directly to `rectOfInterest`.

Verified by testing: while the session is capturing and the picture fills a 180 × 240 pt layer, passing the layer's whole `bounds` gives a rectangle within 0 to 1.

The result depends on the session's current picture, so **compute it after the session has started capturing** (after [`startRunning()`](../av-capture-session/startrunning.md) is fulfilled). Values computed before capturing starts are **not verified on a device**. Compute it again after the layer's `frame` or `videoGravity` changes.

### Exceptions

**`TypeError`**

- `rect` isn't an object: `metadataOutputRectOfInterestForRect needs an object with all of: x, y, width, height`.
- A field is missing or isn't a finite number: `metadataOutputRectOfInterestForRect is missing …, or it is not a finite number`.

## Examples

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.frame = new CGRect(0, 0, 300, 400);

  session.startRunning().then(() => {
    // Scanning frame: 200 × 200 pt in the middle of the layer
    output.rectOfInterest = preview.metadataOutputRectOfInterestForRect(new CGRect(50, 100, 200, 200));
    console.log(String(output.rectOfInterest));
  });
}
```

**Effect**: When access is granted, after the session starts capturing, the console prints the converted rectangle, with all four numbers between 0 and 1. From then on the output recognizes only codes inside the 200 × 200 pt area in the middle of the layer (**not verified on a device**).

## Corresponding iOS API

`-[AVCaptureVideoPreviewLayer metadataOutputRectOfInterestForRect:]`.

## See also

- [`rectOfInterest`](../av-capture-metadata-output/rectofinterest.md)
- [Only recognize codes inside a frame](../../guides/scanning.md#only-recognize-codes-inside-a-frame)
