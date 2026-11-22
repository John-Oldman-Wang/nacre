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

`AVCaptureSessionRuntimeErrorEvent`, with two extra fields:

**`message`**

A string: the system's description of the error, in the system language.

**`code`**

A number: the error code the system gave.

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
  console.log('Capture error', e.code, e.message);
});
```

**Effect** (**not verified on a device**): on an error, prints the error code and the system's description.

## Corresponding iOS API

The notification `AVCaptureSessionRuntimeErrorNotification`. `userInfo[AVCaptureSessionErrorKey]` is an `NSError`; its `localizedDescription` is `e.message` and its `code` is `e.code`.

## See also

- [`startRunning()`](startrunning.md)
- [`stop`](stop-event.md): capturing stopped
