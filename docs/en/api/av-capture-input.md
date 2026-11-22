---
type: reference
native: AVCaptureInput
status: partial
---

# `AVCaptureInput`

**`AVCaptureInput`** represents an input of an [`AVCaptureSession`](av-capture-session.md): where the picture comes from. It is the common base class of inputs; apps use its subclass [`AVCaptureDeviceInput`](av-capture-device-input.md) to connect a camera to the session.

It is the parameter type of the session's [`addInput()`](av-capture-session/addinput.md), [`canAddInput()`](av-capture-session/canaddinput.md), and [`removeInput()`](av-capture-session/removeinput.md), and the element type of [`inputs`](av-capture-session/inputs.md).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → `AVCaptureInput`

## Constructor

Can't be created with `new`: `new AVCaptureInput()` throws `TypeError` with the message `Illegal constructor: AVCaptureInput cannot be constructed` (verified by testing). To connect a camera, use [`new AVCaptureDeviceInput(device)`](av-capture-device-input/constructor.md).

## Instance properties

It has no properties of its own. Also inherits properties from `NSObject`.

## Instance methods

It has no methods of its own.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
}
for (const input of session.inputs) {
  if (input instanceof AVCaptureDeviceInput) {
    console.log('Connected camera: ' + input.device.localizedName);
  }
}
```

**Effect**: When the user has already allowed the app to use the camera, the console prints `Connected camera: ` followed by the camera's name, which is `Back Camera` on an iPhone 14.

The element type of `inputs` is `AVCaptureInput`. To read `device`, check with `instanceof AVCaptureDeviceInput` first.

## Corresponding iOS API

`AVCaptureInput`. `[session.inputs firstObject]` is written `session.inputs[0]`.

## See also

- [`AVCaptureDeviceInput`](av-capture-device-input.md): connecting a camera to a session
- [`AVCaptureSession`](av-capture-session.md): adding and removing inputs
