---
type: reference
native: AVCaptureSessionRuntimeErrorNotification
---

# `AVCaptureSession`: `runtimeerror` event

The **`runtimeerror`** event fires when an error occurs as the session starts capturing or while it's capturing.

## Syntax

```
session.addEventListener('runtimeerror', (event) => { })
```

## Event object

[`AVCaptureSessionRuntimeErrorEvent`](../av-capture-session-runtime-error-event.md), with one extra field:

**[`error`](../av-capture-session-runtime-error-event/error.md)**

The error the system gave, an [`NSError`](../ns-error.md): `message` is the system's description, in the system language; `domain` and `code` are the system's error domain and code.

`target` is the session. Not cancelable; `preventDefault()` has no effect.

## When it fires

- When [`startRunning()`](startrunning.md) fails to start the session. The Promise from `startRunning()` still fulfills, and [`isRunning`](isrunning.md) is `false`.
- When an error occurs while capturing and the system stops the session. [`stop`](stop-event.md) fires afterward.
- The callback runs on the turn after the error.

Whether this event actually fires, and in which situations errors occur, are **not verified on a device**.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('runtimeerror', (e) => {
  console.log('Capture error', e.error.domain, e.error.code, e.error.message);
});
```

**Effect** (**not verified on a device**): on an error, prints the error domain, the error code, and the system's description.

## Corresponding iOS API

The notification `AVCaptureSessionRuntimeErrorNotification`. `userInfo[AVCaptureSessionErrorKey]` is `e.error`.

## See also

- [`startRunning()`](startrunning.md)
- [`stop`](stop-event.md): capturing stopped
