---
type: reference
native: AVCaptureSession.isRunning
---

# `AVCaptureSession`: `isRunning` property

The **`isRunning`** property indicates whether the session is capturing right now.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Capturing: the camera is on and the metadata output is recognizing |
| `false` | Not capturing |

- Read-only. Assigning to it throws `TypeError` (verified by testing).
- `false` for a new session.
- `true` after [`startRunning()`](startrunning.md) fulfills, and `false` after [`stopRunning()`](stoprunning.md) fulfills (verified by testing).
- [`start`](start-event.md) fires when it becomes `true`, and [`stop`](stop-event.md) fires when it becomes `false`.
- Whether it changes when the session is interrupted (an incoming call, the app going to the background) is **not verified on a device**. For interruptions, check [`isInterrupted`](isinterrupted.md).

## Examples

```js
const session = new AVCaptureSession();
console.log(session.isRunning);
session.addEventListener('start', () => console.log('Now', session.isRunning));
```

**Effect**: first prints `false`. Later, when the session starts capturing, prints `Now true`.

## Corresponding iOS API

`AVCaptureSession.running` (the getter is `isRunning`). In ObjC you learn that it changed through key-value observing; here, listen for the `start` and `stop` events.

## See also

- [`start`](start-event.md), [`stop`](stop-event.md)
- [`isInterrupted`](isinterrupted.md): whether the session is interrupted
