---
type: reference
native: "-[AVCaptureMetadataOutputObjectsDelegate captureOutput:didOutputMetadataObjects:fromConnection:]"
---

# `AVCaptureMetadataOutput`: `detect` event

The **`detect`** event fires when the output recognizes something it's looking for in the picture. The event carries everything recognized in that frame.

## Syntax

```
output.addEventListener('detect', (event) => { })
```

## Event object

[`AVCaptureMetadataOutputDetectEvent`](../av-capture-metadata-output-detect-event.md), with one extra field:

**[`objects`](../av-capture-metadata-output-detect-event/objects.md)**

Everything recognized in this frame, as an array with at least one item. The array and the objects in it are read-only.

- When a code is recognized, the item is an [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md), with `stringValue` (the text in the code) and `corners` (its four corners).
- When something like a face is recognized, the item is an [`AVMetadataObject`](../av-metadata-object.md), with only `type` and `bounds`.
- The array's element type is declared as `AVMetadataObject`. Before reading `stringValue`, check with `instanceof AVMetadataMachineReadableCodeObject`, as in the example.
- `bounds` and `corners` are fractions from 0 to 1; see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture). To draw them on screen, convert them to points in the layer with the preview layer's [`transformedMetadataObjectForMetadataObject()`](../av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md).

Scanning an image showing two QR codes on a screen, testing found 2 codes in one frame, both with the right content.

Not cancelable. `target` is this output.

## When it fires

When all of the following hold, it fires once for each frame in which something it's looking for is recognized:

- There is a `detect` listener.
- [`metadataObjectTypes`](metadataobjecttypes.md) isn't an empty array.
- The output is on a session that is capturing (after [`startRunning()`](../av-capture-session/startrunning.md)).
- A type it's looking for is in the picture, inside [`rectOfInterest`](rectofinterest.md).

As long as a code stays in front of the camera, the events keep coming frame after frame, and the same code is reported many times. To get it only once, add the listener with `{ once: true }`, and stop capturing after a scan; see [Stop after a scan](../../guides/scanning.md#stop-after-a-scan).

The callback runs on the turn after the system reports.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.addEventListener('detect', (e) => {
  for (const found of e.objects) {
    if (found instanceof AVMetadataMachineReadableCodeObject) {
      console.log(found.type, found.stringValue);
    }
  }
});
```

**Effect**: While the session is capturing and a QR code is in front of the camera, one line is printed per frame, such as `qrCode https://example.com/a`. With two codes in the picture, two lines are printed for the same frame.

## Corresponding iOS API

The delegate method `captureOutput:didOutputMetadataObjects:fromConnection:`. The `metadataObjects` parameter is `e.objects`. There is no delegate to set and no queue to specify; use `addEventListener`.

## See also

- [`metadataObjectTypes`](metadataobjecttypes.md): what to look for
- [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md): a recognized code
- [Several codes in one frame](../../guides/scanning.md#several-codes-in-one-frame)
- [Draw a box around each code](../../guides/scanning.md#draw-a-box-around-each-code)
