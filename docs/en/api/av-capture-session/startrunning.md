---
type: reference
native: "-[AVCaptureSession startRunning]"
---

# `AVCaptureSession`: `startRunning()` method

The **`startRunning()`** method makes the session start capturing: the camera starts delivering pictures, the preview layer shows them, and the metadata output starts recognizing.

## Syntax

```
startRunning()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with `undefined` once the session has started.

- Starting a session takes a while. During that time the interface keeps responding; it doesn't freeze.
- After it fulfills, [`isRunning`](isrunning.md) is `true` (verified by testing).
- The session also fires a [`start`](start-event.md) event once (verified by testing).
- Calling it again while the session is already capturing also fulfills (verified by testing).
- When the session can't start, the Promise doesn't reject; it still fulfills: the system reports the reason through the [`runtimeerror`](runtimeerror-event.md) event, and `isRunning` stays `false`. This is **not verified on a device**. So to confirm the session actually started, read `isRunning` after it fulfills.

### Exceptions

None.

## Description

- Get camera authorization before calling it; see [Authorization](../av-capture-device.md#authorization).
- Keeping the camera on drains the battery. After a code is scanned, or when leaving the scanning screen, call [`stopRunning()`](stoprunning.md).

## Examples

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  session.startRunning().then(() => {
    console.log(session.isRunning ? 'Capturing' : 'Did not start');
  });
}
```

**Effect**: when the user has already allowed the app to use the camera, prints `Capturing` after a moment.

## Corresponding iOS API

`-[AVCaptureSession startRunning]`. In ObjC it blocks until the session has started and has to be called on a background queue; here you call it directly, and it returns a Promise that is fulfilled once the session has started.

## See also

- [`stopRunning()`](stoprunning.md): stop capturing
- [`start`](start-event.md): capturing started
- [`runtimeerror`](runtimeerror-event.md): an error while capturing
- [Stop after a scan](../../guides/scanning.md#stop-after-a-scan)
