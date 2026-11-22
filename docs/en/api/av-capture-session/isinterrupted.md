---
type: reference
native: AVCaptureSession.isInterrupted
---

# `AVCaptureSession`: `isInterrupted` property

The **`isInterrupted`** property indicates whether the session is currently interrupted by the system. When a call comes in, the app goes to the background, or another app uses the camera, the system interrupts the session and the session temporarily stops capturing.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Interrupted; temporarily not capturing |
| `false` | Not interrupted |

- Read-only. Assigning to it throws `TypeError`.
- `false` for a new session (verified by testing).
- [`interrupt`](interrupt-event.md) fires when it becomes `true`, and [`interruptend`](interruptend-event.md) fires when it goes back to `false`.
- Situations where it actually becomes `true` are **not verified on a device**.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('interruptend', () => {
  console.log('Interruption ended', session.isInterrupted);
});
```

**Effect** (**not verified on a device**): after the session has been interrupted, prints `Interruption ended false` when the interruption ends.

## Corresponding iOS API

`AVCaptureSession.interrupted` (the getter is `isInterrupted`). In ObjC you learn that it changed through key-value observing or notifications; here, listen for the `interrupt` and `interruptend` events.

## See also

- [`interrupt`](interrupt-event.md): the session was interrupted, with the reason
- [`interruptend`](interruptend-event.md): the interruption ended
- [When the session is interrupted](../../guides/scanning.md#when-the-session-is-interrupted)
