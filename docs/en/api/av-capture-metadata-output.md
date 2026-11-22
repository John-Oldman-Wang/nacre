---
type: reference
native: AVCaptureMetadataOutput
status: partial
---

# `AVCaptureMetadataOutput`

**`AVCaptureMetadataOutput`** represents an output that recognizes codes, faces, and similar things in the captured picture. It is added to an [`AVCaptureSession`](av-capture-session.md); while the session is running and a type it's looking for appears in the picture, it fires the [`detect`](av-capture-metadata-output/detect-event.md) event, which carries everything recognized in that frame.

Which types it can recognize depends on the camera connected to the session, so the order is: first add the camera's input to the session, then add this output, and finally pick the types you want from [`availableMetadataObjectTypes`](av-capture-metadata-output/availablemetadataobjecttypes.md) and write them to [`metadataObjectTypes`](av-capture-metadata-output/metadataobjecttypes.md). Before it's added to a session with a camera, the available types are empty, and writing `metadataObjectTypes` throws `TypeError` (verified by testing).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → [`AVCaptureOutput`](av-capture-output.md) → `AVCaptureMetadataOutput`

For how to recognize codes, recognize only codes inside a scanning frame, and draw boxes around recognized codes, see the guide [Scanning codes](../guides/scanning.md).

## Constructor

[`AVCaptureMetadataOutput()`](av-capture-metadata-output/constructor.md)

Creates a metadata output. A new output recognizes nothing, and its range is the whole picture.

## Instance properties

Also inherits properties from `NSObject`.

| Property | Description |
| --- | --- |
| [`availableMetadataObjectTypes`](av-capture-metadata-output/availablemetadataobjecttypes.md) <small>read-only</small> | Which types it can recognize right now |
| [`metadataObjectTypes`](av-capture-metadata-output/metadataobjecttypes.md) | Which types to recognize. Defaults to an empty array |
| [`rectOfInterest`](av-capture-metadata-output/rectofinterest.md) | Which part of the picture to search. Defaults to the whole picture |

## Instance methods

It has no methods of its own. Also inherits `addEventListener()`, `removeEventListener()`, and `dispatchEvent()` from [`EventTarget`](event-target.md).

## Events

| Event | When it fires |
| --- | --- |
| [`detect`](av-capture-metadata-output/detect-event.md) | Something it's looking for was recognized in this frame. As long as a code stays in front of the camera, it fires frame after frame. Not cancelable |

Listening for other names doesn't throw: they are treated as custom events and only fire when you dispatch them yourself with `dispatchEvent()` (verified by testing).

## Coordinates in the picture

[`rectOfInterest`](av-capture-metadata-output/rectofinterest.md), the [`bounds`](av-metadata-object/bounds.md) and [`corners`](av-metadata-machine-readable-code-object/corners.md) of objects recognized in the `detect` event, and the camera's [`focusPointOfInterest`](av-capture-device/focuspointofinterest.md) all use ratio coordinates within the picture:

- Values are ratios from 0 to 1, with no unit. (0, 0) is the top-left corner of the picture, and (1, 1) is the bottom-right.
- The orientation follows the camera's picture: when the phone is rotated 90 degrees counterclockwise into landscape, with its original bottom edge on the right, the top-left of the picture you see is (0, 0). So when the phone is held upright, (0, 0) is at the top-right of the picture.
- They aren't the same coordinate system as points on screen, and how the preview layer fills its picture ([`videoGravity`](av-capture-video-preview-layer/videogravity.md)) also affects the mapping.

**Don't convert them yourself.** Use the methods of the preview layer [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md), which account for the layer's size and `videoGravity`:

| What to do | Which method |
| --- | --- |
| A scanning frame on screen → `rectOfInterest` | [`metadataOutputRectOfInterestForRect()`](av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md) |
| An object recognized by `detect` → points in the layer, for drawing a box | [`transformedMetadataObjectForMetadataObject()`](av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) |
| Where the user tapped → `focusPointOfInterest` | [`captureDevicePointOfInterestForPoint()`](av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md) |
| Ratio coordinates → points in the layer | [`pointForCaptureDevicePointOfInterest()`](av-capture-video-preview-layer/pointforcapturedevicepointofinterest.md) |

Verified by testing: with a 180 × 240 pt preview layer and the session running, the center of the layer, (90, 120), converts to (0.5, 0.5), and (0.5, 0.5) converts back to the center of the layer.

## Examples

### Recognize QR codes and product barcodes

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));

  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode', 'ean13Code'];
  output.addEventListener('detect', (e) => {
    for (const found of e.objects) {
      if (found instanceof AVMetadataMachineReadableCodeObject) {
        console.log(found.type + ': ' + found.stringValue);
      }
    }
  });

  session.startRunning();
}
```

**Effect**: When the user has already allowed the app to use the camera, put a QR code or product barcode in front of the back camera, and the console prints `qrCode: ` or `ean13Code: ` followed by the code's content, frame after frame. Printing the content of a QR code was verified by testing; product barcodes are **not verified on a device**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[AVCaptureMetadataOutput alloc] init]` | `new AVCaptureMetadataOutput()` |
| `output.metadataObjectTypes = @[AVMetadataObjectTypeQRCode]` | `output.metadataObjectTypes = ['qrCode']` |
| `output.rectOfInterest = CGRectMake(0, 0, 1, 1)` | `output.rectOfInterest = { x: 0, y: 0, width: 1, height: 1 }` |
| `[output setMetadataObjectsDelegate:self queue:dispatch_get_main_queue()]` plus the delegate method `captureOutput:didOutputMetadataObjects:fromConnection:` | `output.addEventListener('detect', …)` |

## See also

- [Scanning codes](../guides/scanning.md): a complete scanning screen
- [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md): a recognized code
- [`AVMetadataObject`](av-metadata-object.md): a recognized face or similar thing
- [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md): converting coordinates
