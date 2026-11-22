---
type: reference
native: AVCaptureSessionDidStartRunningNotification
---

# `AVCaptureSession`: `start` event

The **`start`** event fires when the session starts capturing.

## Syntax

```
session.addEventListener('start', (event) => { })
```

## Event object

`Event`, with no extra fields. `target` is the session. Not cancelable; `preventDefault()` has no effect.

## When it fires

- Once, after [`startRunning()`](startrunning.md) has started the session (verified by testing). At that point [`isRunning`](isrunning.md) is `true`.
- The callback runs on the turn after the session has started. Whether it comes before or after the Promise returned by `startRunning()` is **not verified on a device**; don't rely on the order.
- Whether calling `startRunning()` again while the session is already capturing fires it again is **not verified on a device**.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('start', () => {
  console.log('Capturing started');
});
```

**Effect**: prints `Capturing started` each time the session starts capturing.

## Corresponding iOS API

The notification `AVCaptureSessionDidStartRunningNotification`, with `object` set to the session. There's no need to register with the notification center; use `addEventListener`.

## See also

- [`stop`](stop-event.md): capturing stopped
- [`startRunning()`](startrunning.md)
