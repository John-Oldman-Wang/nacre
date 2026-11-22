---
type: reference
native: AVCaptureMetadataOutputDetectEvent.objects
---

# `AVCaptureMetadataOutputDetectEvent`: `objects` property

The **`objects`** property is everything recognized in this frame.

## Value

An array with at least one element. The array is frozen, and the objects in it are read-only.

- Read-only. Assigning to it throws `TypeError`.
- When a code is recognized, the element is an [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md), with `stringValue` (the text in the code) and `corners` (the four corners). Check with `instanceof` before reading `stringValue`.
- When something like a face is recognized, the element is an [`AVMetadataObject`](../av-metadata-object.md), with only `type` and `bounds`.
- `bounds` and `corners` are fractions from 0 to 1; see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture).
- When the event is created with [`new`](constructor.md) without it, it is a frozen empty array.

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

**Effect**: while a code is in the camera feed, each frame prints the code type and its text.

## Corresponding iOS API

The `metadataObjects` parameter of `captureOutput:didOutputMetadataObjects:fromConnection:`.

## See also

- [`AVCaptureMetadataOutputDetectEvent`](../av-capture-metadata-output-detect-event.md)
