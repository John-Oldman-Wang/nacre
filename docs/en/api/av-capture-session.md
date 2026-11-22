---
type: reference
native: AVCaptureSession
status: partial
---

# `AVCaptureSession`

**`AVCaptureSession`** represents a capture: it delivers the picture from a camera to the outputs and preview layers attached to it. A camera is connected to the session through an input, [`AVCaptureDeviceInput`](av-capture-device-input.md); the output [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) recognizes codes and faces in the picture; the preview layer [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md) shows the picture on screen. These only start working once the session starts running.

A code-scanning screen is usually this set: one session, one input for the back camera, one metadata output, and one preview layer. The session holds the inputs and outputs added to it, so the app doesn't need to keep its own references to them.

It belongs to the `@nacrejs/av-capture` package. Before using the camera, the app needs the user's authorization; see [`AVCaptureDevice`](av-capture-device.md#authorization).

**Inheritance**: `EventTarget` → `NSObject` → `AVCaptureSession`

For how to build a code-scanning screen, recognize only codes inside a scanning frame, and turn on the flashlight, see the guide [Scanning codes](../guides/scanning.md). Recognizing codes in an existing image doesn't need this package; use [`BarcodeDetector`](barcode-detector.md) from the core.

## Installation

Capture and live recognition are not in the core; you need to install the `@nacrejs/av-capture` package first. Without it, there are no global `AVCaptureSession`, `AVCaptureDevice`, `AVCaptureDeviceInput`, `AVCaptureMetadataOutput`, or `AVCaptureVideoPreviewLayer` classes, and type checking reports that these names cannot be found.

**1. Install the package.**

```bash
npm install @nacrejs/av-capture
```

**Effect**: The next time `ios/` is generated, the project embeds an extra `NacreAVCapture.framework`. Projects that do not install it have no such framework in their output.

**2. Write a sentence for the user.** In `nacre.config.json`, write a sentence explaining why this app uses the camera. The key name `NSCameraUsageDescription` is defined by the system:

```json
{
  "name": "Shop",
  "bundleId": "com.example.app",
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Scan the QR code on your order"
    }
  }
}
```

**Effect**: The first time the app requests camera access, the system shows an alert asking the user whether to allow it, and the alert shows this sentence. To write one per language, see [Configuring an app](../guides/project-config.md#writing-usage-descriptions).

If the package is installed but this sentence is missing, generating `ios/` reports an error and stops:

```
nacre: @nacrejs/av-capture needs NSCameraUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

**3. Bring in the types.** Add a line at the top of the entry file:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />
```

**Effect**: `AVCaptureSession` and the other classes get completion and checking in the editor.

## Constructor

[`AVCaptureSession()`](av-capture-session/constructor.md)

Creates an empty session: no inputs, no outputs, the quality preset `'high'`, and not running yet.

## Instance properties

| Property | Description |
| --- | --- |
| [`inputs`](av-capture-session/inputs.md) <small>read-only</small> | The inputs currently on the session |
| [`outputs`](av-capture-session/outputs.md) <small>read-only</small> | The outputs currently on the session |
| [`sessionPreset`](av-capture-session/sessionpreset.md) | The quality preset. Defaults to `'high'` |
| [`isRunning`](av-capture-session/isrunning.md) <small>read-only</small> | Whether the session is running |
| [`isInterrupted`](av-capture-session/isinterrupted.md) <small>read-only</small> | Whether the system is interrupting it, for example by a phone call or the app going to the background |

## Instance methods

Also inherits `addEventListener()`, `removeEventListener()`, and `dispatchEvent()` from [`EventTarget`](event-target.md), used to listen for the events below.

Adding and removing inputs and outputs:

| Method | Description |
| --- | --- |
| [`canAddInput()`](av-capture-session/canaddinput.md) | Whether this input can be added |
| [`addInput()`](av-capture-session/addinput.md) | Adds an input. Throws `TypeError` if it can't be added |
| [`removeInput()`](av-capture-session/removeinput.md) | Removes an input |
| [`canAddOutput()`](av-capture-session/canaddoutput.md) | Whether this output can be added |
| [`addOutput()`](av-capture-session/addoutput.md) | Adds an output. Throws `TypeError` if it can't be added |
| [`removeOutput()`](av-capture-session/removeoutput.md) | Removes an output |

Quality and grouped changes:

| Method | Description |
| --- | --- |
| [`canSetSessionPreset()`](av-capture-session/cansetsessionpreset.md) | Whether a quality preset can be set right now |
| [`beginConfiguration()`](av-capture-session/beginconfiguration.md) | Starts a group of changes |
| [`commitConfiguration()`](av-capture-session/commitconfiguration.md) | Applies the group of changes all at once |

Starting and stopping:

| Method | Description |
| --- | --- |
| [`startRunning()`](av-capture-session/startrunning.md) | Starts running; fulfills once it has started |
| [`stopRunning()`](av-capture-session/stoprunning.md) | Stops running; fulfills once it has stopped |

## Events

Listen with `addEventListener()`. All five events fire on the turn after the system's notification, and none can be canceled.

| Event | When it fires |
| --- | --- |
| [`start`](av-capture-session/start-event.md) | The session started running |
| [`stop`](av-capture-session/stop-event.md) | The session stopped running, including when the system stopped it |
| [`interrupt`](av-capture-session/interrupt-event.md) | The system interrupted the session. The event carries the reason |
| [`interruptend`](av-capture-session/interruptend-event.md) | The interruption ended |
| [`runtimeerror`](av-capture-session/runtimeerror-event.md) | An error occurred while running. The event object is an [`AVCaptureSessionRuntimeErrorEvent`](av-capture-session-runtime-error-event.md), and `error` is the error the system gave |

Listening for other names doesn't throw: they are treated as custom events and only fire when you dispatch them yourself with `dispatchEvent()`.

## Examples

### Scan one QR code

Starting from a blank app, an area near the top of the screen shows the back camera's picture. When a QR code is recognized, its content is printed to the console and the session stops.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // The area that shows the picture
  const box = new UIView();
  box.frame = new CGRect(20, 120, 320, 320);
  page.view.addSubview(box);

  scan(box);
});

/** @param {UIView} box The view that shows the picture */
async function scan(box) {
  // 1. Request authorization
  const granted = await AVCaptureDevice.requestAccessForMediaType('video');
  const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
  if (!granted || camera === null) {
    console.log('Camera not available');
    return;
  }

  // 2. Connect the camera and add an output that recognizes codes
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];

  // 3. Fill the view with the picture
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.videoGravity = 'resizeAspectFill';
  preview.frame = box.bounds;
  box.layer.addSublayer(preview);

  // 4. Stop after recognizing one code
  output.addEventListener('detect', (event) => {
    const code = event.objects[0];
    if (code instanceof AVMetadataMachineReadableCodeObject) {
      console.log('Scanned: ' + code.stringValue);
      session.stopRunning();
    }
  }, { once: true });

  // 5. Start running
  await session.startRunning();
}
```

**Effect**

- On the first run, the system first shows an alert asking the user whether to allow camera access. If the user declines, the console prints `Camera not available`.
- After the user allows it, a 320 × 320 pt area near the top of the screen shows the back camera's picture. What the picture looks like in the area is **not verified on a device**.
- Put a QR code in front of the camera, and the console prints `Scanned: ` followed by the code's content, and the session stops running.

This code hasn't been run as a whole. Every API it uses has been run in the acceptance tests on a device.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[AVCaptureSession alloc] init]` | `new AVCaptureSession()` |
| `[session addInput:input]` | `session.addInput(input)`. Throws `TypeError` if it can't be added |
| `[session addOutput:output]` | `session.addOutput(output)` |
| `session.sessionPreset = AVCaptureSessionPreset1280x720` | `session.sessionPreset = '1280x720'` |
| Calling `[session startRunning]` on a background queue | `await session.startRunning()` |
| Calling `[session stopRunning]` on a background queue | `await session.stopRunning()` |
| Observing `AVCaptureSessionDidStartRunningNotification` | `session.addEventListener('start', …)` |
| Observing `AVCaptureSessionWasInterruptedNotification`, with the reason in `userInfo[AVCaptureSessionInterruptionReasonKey]` | The `interrupt` event, with the reason in `event.reason` |
| Observing `AVCaptureSessionRuntimeErrorNotification`, with the error in `userInfo[AVCaptureSessionErrorKey]` | The `runtimeerror` event, with `event.error` |

## See also

- [Scanning codes](../guides/scanning.md): the full steps from requesting authorization to drawing a scanning frame
- [`AVCaptureDevice`](av-capture-device.md): authorization, finding cameras, the flashlight, zoom, focus
- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md): recognizing codes, the `detect` event
- [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md): showing the picture, converting coordinates
- [`BarcodeDetector`](barcode-detector.md): recognizing codes in an image
- [Core and capability packages](capabilities.md): which capabilities need a separate install
