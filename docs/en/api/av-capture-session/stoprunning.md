---
type: reference
native: "-[AVCaptureSession stopRunning]"
---

# `AVCaptureSession`: `stopRunning()` method

The **`stopRunning()`** method makes the session stop capturing: the camera turns off, and the metadata output stops recognizing.

## Syntax

```
stopRunning()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with `undefined` once the session has stopped.

- Stopping a session takes a while. During that time the interface keeps responding; it doesn't freeze.
- After it fulfills, [`isRunning`](isrunning.md) is `false` (verified by testing).
- The session also fires a [`stop`](stop-event.md) event once (verified by testing).
- What happens when you call it while the session isn't capturing is **not verified on a device**.
- After stopping, the inputs, outputs, and preview layer are all still there; call [`startRunning()`](startrunning.md) again to resume capturing.

What the preview layer shows after stopping (the last frame or nothing) is **not verified on a device**.

### Exceptions

None.

## Examples

```js
/** @param {AVCaptureSession} session a session that is capturing */
function stopScanning(session) {
  session.stopRunning().then(() => {
    console.log('Stopped', session.isRunning);
  });
}
```

**Effect**: a moment after `stopScanning()` is called, `Stopped false` is printed.

## Corresponding iOS API

`-[AVCaptureSession stopRunning]`. In ObjC it blocks until the session has stopped and has to be called on a background queue; here you call it directly, and it returns a Promise that is fulfilled once the session has stopped.

## See also

- [`startRunning()`](startrunning.md): start capturing
- [`stop`](stop-event.md): capturing stopped
- [Stop after a scan](../../guides/scanning.md#stop-after-a-scan)
