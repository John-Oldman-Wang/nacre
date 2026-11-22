---
type: reference
native: AVCaptureDeviceInput
status: partial
---

# `AVCaptureDeviceInput`

**`AVCaptureDeviceInput`** represents an input that connects a camera to an [`AVCaptureSession`](av-capture-session.md). It is created from an [`AVCaptureDevice`](av-capture-device.md); once added with the session's [`addInput()`](av-capture-session/addinput.md), the session takes its picture from this camera.

Creating it uses the camera: if the user hasn't been asked yet, the system shows the authorization alert at that moment; if the user hasn't granted authorization, it can't be created. See [`AVCaptureDevice`](av-capture-device.md#authorization).

It belongs to the `@nacrejs/av-capture` package; for installation, see [`AVCaptureSession`](av-capture-session.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → [`AVCaptureInput`](av-capture-input.md) → `AVCaptureDeviceInput`

## Constructor

[`AVCaptureDeviceInput()`](av-capture-device-input/constructor.md)

Wraps a camera as a session input. Throws [`NSError`](ns-error.md) without authorization.

## Instance properties

Also inherits properties from `NSObject`.

| Property | Description |
| --- | --- |
| [`device`](av-capture-device-input/device.md) <small>read-only</small> | Which camera it connects |

## Instance methods

It has no methods of its own.

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  try {
    const input = new AVCaptureDeviceInput(camera);
    if (session.canAddInput(input)) session.addInput(input);
    console.log('Connected ' + input.device.localizedName);
  } catch (err) {
    console.log('Could not connect the camera: ' + (err instanceof Error ? err.message : String(err)));
  }
}
```

**Effect**

- When the user has already agreed, the console prints `Connected Back Camera` (the name on an iPhone 14).
- When the user hasn't been asked yet, `new AVCaptureDeviceInput(camera)` shows the authorization alert at that moment.
- When the user has declined, the console prints `Could not connect the camera: ` followed by the system's reason.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[AVCaptureDeviceInput deviceInputWithDevice:device error:&error]`, which returns `nil` on failure | `new AVCaptureDeviceInput(device)`, which throws an `NSError` on failure, whose `domain` is an empty string and `code` is 0, with the system's reason in `message` |
| `input.device` | `input.device` |

## See also

- [`AVCaptureDevice`](av-capture-device.md): finding cameras, authorization
- [`AVCaptureSession`](av-capture-session.md): adding the input to a session
- [Scanning codes](../guides/scanning.md)
