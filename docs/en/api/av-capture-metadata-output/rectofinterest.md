---
type: reference
native: AVCaptureMetadataOutput.rectOfInterest
---

# `AVCaptureMetadataOutput`: `rectOfInterest` property

The **`rectOfInterest`** property is the part of the picture the output looks in. Codes outside it don't fire [`detect`](detect-event.md).

## Value

A [`CGRect`](../cg-rect.md) whose numbers are fractions from 0 to 1, not pt. For how the coordinates are defined, see [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture).

- Readable and writable. It reads as a `CGRect` (verified by testing). When writing, you can give a `CGRect` or a plain object with the four numbers `x`, `y`, `width`, `height`.
- The default is the whole picture, `(0, 0, 1, 1)` (verified by testing).
- Writing `{ x: 0.1, y: 0.2, width: 0.5, height: 0.6 }` reads back as the same four numbers (verified by testing).
- That only codes inside it are recognized after writing it is **not verified on a device**.
- Only your own code changes it, so there is no change notification.

Don't compute the four numbers yourself. The scanning frame on screen is a rectangle in the preview layer; convert it with the preview layer's [`metadataOutputRectOfInterestForRect()`](../av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md), after the session has started capturing.

### Invalid values

**`TypeError`**

- The value isn't an object: `rectOfInterest needs an object with all of: x, y, width, height` (verified by testing with a number).
- A field is missing or isn't a finite number: `rectOfInterest is missing …, or it is not a finite number`.

## Examples

```js
const output = new AVCaptureMetadataOutput();
output.rectOfInterest = { x: 0.25, y: 0.25, width: 0.5, height: 0.5 };
const area = output.rectOfInterest;
console.log(area.x, area.y, area.width, area.height);
```

**Effect**: The console prints `0.25 0.25 0.5 0.5`. The output looks only in the middle part of the picture that is half as wide and half as tall (**not verified on a device**).

## Corresponding iOS API

`AVCaptureMetadataOutput.rectOfInterest`.

## See also

- [`metadataOutputRectOfInterestForRect()`](../av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md): convert from layer coordinates
- [Only recognize codes inside a frame](../../guides/scanning.md#only-recognize-codes-inside-a-frame)
- [Coordinates in the picture](../av-capture-metadata-output.md#coordinates-in-the-picture)
