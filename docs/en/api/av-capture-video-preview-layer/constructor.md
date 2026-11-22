---
type: reference
native: "-[AVCaptureVideoPreviewLayer initWithSession:]"
---

# `AVCaptureVideoPreviewLayer()` constructor

The **`AVCaptureVideoPreviewLayer()`** constructor creates a layer that shows a session's camera picture.

## Syntax

```
new AVCaptureVideoPreviewLayer(session)
```

### Parameters

**`session`**

The session whose picture to show, an [`AVCaptureSession`](../av-capture-session.md). Required. You can replace or clear it later with the [`session`](session.md) property.

### Return value

A new `AVCaptureVideoPreviewLayer`. It's a [`CALayer`](../ca-layer.md), and right after creation it is 0 × 0 pt:

- It becomes visible only after you set its `frame` and put it in a view's layer (`view.layer.addSublayer(preview)`).
- [`videoGravity`](videogravity.md) defaults to `'resizeAspect'` (verified by testing).
- The layer shows a picture only after the session starts capturing ([`startRunning()`](../av-capture-session/startrunning.md)). What the picture looks like in the layer is **not verified on a device**.

### Exceptions

**`TypeError`**

- `session` is not an `AVCaptureSession` (nothing passed, a string passed): `AVCaptureVideoPreviewLayer needs an AVCaptureSession, got …` (verified by testing).
- Subclassing it: `class Mine extends AVCaptureVideoPreviewLayer {}` throws on `new Mine()`, with a message starting with `Illegal constructor`.

## Examples

```js
const view = new UIView();
view.frame = new CGRect(20, 120, 300, 400);
const session = new AVCaptureSession();
const preview = new AVCaptureVideoPreviewLayer(session);
preview.videoGravity = 'resizeAspectFill';
preview.frame = view.bounds;
view.layer.addSublayer(preview);
```

**Effect**: The layer fills the 300 × 400 pt view. After the session is connected to a camera and starts capturing, the view shows the camera picture, scaled to fill while keeping its proportions, with the excess cropped (**not verified on a device**).

## Corresponding iOS API

`-[AVCaptureVideoPreviewLayer initWithSession:]`.

## See also

- [`session`](session.md): replace or clear the session
- [`videoGravity`](videogravity.md): how the picture fills the layer
- [`CALayer`](../ca-layer.md): inherited members such as `frame` and `addSublayer()`
- [Installing `@nacrejs/av-capture`](../av-capture-session.md#installation)
