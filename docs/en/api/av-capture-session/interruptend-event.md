---
type: reference
native: AVCaptureSessionInterruptionEndedNotification
---

# `AVCaptureSession`: `interruptend` event

The **`interruptend`** event fires when the session's interruption ends.

## Syntax

```
session.addEventListener('interruptend', (event) => { })
```

## Event object

`Event`, with no extra fields. `target` is the session. Not cancelable; `preventDefault()` has no effect.

## When it fires

- On the turn after the interruption ends, for example when a call hangs up, the app comes back to the foreground, or another app releases the camera. At that point [`isInterrupted`](isinterrupted.md) is `false`.
- Whether the session resumes capturing by itself after the interruption ends, or needs another call to [`startRunning()`](startrunning.md), is **not verified on a device**. In this event, read [`isRunning`](isrunning.md), and call `startRunning()` if it's `false`.

Whether this event actually fires is **not verified on a device**.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('interruptend', () => {
  if (!session.isRunning) {
    session.startRunning();
  }
});
```

**Effect** (**not verified on a device**): when the interruption ends, if the session isn't capturing, it starts capturing again.

## Corresponding iOS API

The notification `AVCaptureSessionInterruptionEndedNotification`, with `object` set to the session.

## See also

- [`interrupt`](interrupt-event.md): the session was interrupted
- [When the session is interrupted](../../guides/scanning.md#when-the-session-is-interrupted)
