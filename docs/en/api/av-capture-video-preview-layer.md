---
type: reference
native: AVCaptureVideoPreviewLayer
status: partial
---

# `AVCaptureVideoPreviewLayer`

**`AVCaptureVideoPreviewLayer`** represents a layer that shows the camera's captured picture, called a preview layer. It shows the picture of an [`AVCaptureSession`](av-capture-session.md); while the session is running, the layer shows the camera's live picture.

It is a [`CALayer`](ca-layer.md): its position and size are set with `frame`, and it's placed in a view's layer with `addSublayer()`. Like other sublayers, its size doesn't follow the view; see [Sublayer sizes don't follow the view](ca-layer.md#sublayer-sizes-dont-follow-the-view).

Besides showing the picture, it converts between points in the layer and ratio coordinates in the picture: it turns a scanning frame on screen into a range so that only codes inside the frame are recognized, moves recognized codes onto the layer for drawing boxes, and turns where the user tapped into a focus point. See [Converting coordinates](#converting-coordinates).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → [`CALayer`](ca-layer.md) → `AVCaptureVideoPreviewLayer`

## Constructor

[`AVCaptureVideoPreviewLayer()`](av-capture-video-preview-layer/constructor.md)

Creates a layer that shows a session's picture. Right after creation, its size is 0 × 0 pt.

## Instance properties

Also inherits properties from [`CALayer`](ca-layer.md); the most commonly used are `frame`, `bounds`, and `cornerRadius`.

| Property | Description |
| --- | --- |
| [`session`](av-capture-video-preview-layer/session.md) | Which session's picture it shows. Can be `null` |
| [`videoGravity`](av-capture-video-preview-layer/videogravity.md) | How the picture fills the layer when their aspect ratios differ. Defaults to `'resizeAspect'` |

## Instance methods

Also inherits methods from [`CALayer`](ca-layer.md), such as `addSublayer()` and `removeFromSuperlayer()`.

| Method | Description |
| --- | --- |
| [`transformedMetadataObjectForMetadataObject()`](av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) | Converts an object recognized in the `detect` event onto this layer |
| [`metadataOutputRectOfInterestForRect()`](av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md) | Converts a rectangle in the layer to the ratios used by `rectOfInterest` |
| [`captureDevicePointOfInterestForPoint()`](av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md) | Converts a point in the layer to the ratios used by the focus point |
| [`pointForCaptureDevicePointOfInterest()`](av-capture-video-preview-layer/pointforcapturedevicepointofinterest.md) | Converts ratio coordinates to a point in the layer |

## Converting coordinates

Positions in the picture are expressed as ratios from 0 to 1, with the orientation following the camera's picture; see [Coordinates in the picture](av-capture-metadata-output.md#coordinates-in-the-picture). Positions on screen are points (pt) in the layer. The mapping between the two depends on the layer's size and `videoGravity`, so leave the conversion to this layer:

- Convert after the layer's `frame` is set and the session has started running. That's when the measurements were taken: with a 180 × 240 pt layer, the center (90, 120) converts to (0.5, 0.5), and `metadataOutputRectOfInterestForRect(layer.bounds)` gives a rectangle within 0 to 1. Results of converting before the session starts running are **not verified on a device**.
- After the layer's size or `videoGravity` changes, values converted earlier no longer match and need to be computed again.

## Examples

### Fill a view

```js
const session = new AVCaptureSession();
const box = new UIView();
box.frame = new CGRect(0, 100, 300, 400);

const preview = new AVCaptureVideoPreviewLayer(session);
preview.videoGravity = 'resizeAspectFill';
preview.frame = box.bounds;
box.layer.addSublayer(preview);
```

**Effect**: Once the session has a camera connected and is running, the picture fills the 300 × 400 pt `box`, with the parts outside its aspect ratio cropped. What the picture looks like on screen is **not verified on a device**.

### Tap to focus

```js
/**
 * @param {AVCaptureVideoPreviewLayer} preview
 * @param {AVCaptureDevice} camera
 * @param {CGPoint} tap Where the user tapped, as a point in the layer
 */
function focusAt(preview, camera, tap) {
  if (!camera.isFocusPointOfInterestSupported) return;
  const point = preview.captureDevicePointOfInterestForPoint(tap);
  camera.lockForConfiguration();
  try {
    camera.focusPointOfInterest = point;
    camera.focusMode = 'autoFocus';
  } finally {
    camera.unlockForConfiguration();
  }
}
```

**Effect**: The camera focuses once on the spot the user tapped. The focusing effect is **not verified on a device**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[AVCaptureVideoPreviewLayer layerWithSession:session]` | `new AVCaptureVideoPreviewLayer(session)` |
| `layer.videoGravity = AVLayerVideoGravityResizeAspectFill` | `layer.videoGravity = 'resizeAspectFill'` |
| `[layer metadataOutputRectOfInterestForRect:rect]` | `layer.metadataOutputRectOfInterestForRect(rect)` |
| `[layer transformedMetadataObjectForMetadataObject:object]` | `layer.transformedMetadataObjectForMetadataObject(object)` |

## See also

- [Scanning codes](../guides/scanning.md): laying out the picture, drawing a scanning frame, drawing boxes around recognized codes
- [`CALayer`](ca-layer.md): position, size, rounded corners
- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md): coordinates in the picture
- [`AVCaptureSession`](av-capture-session.md)
