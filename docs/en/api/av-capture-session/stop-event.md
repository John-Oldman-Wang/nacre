---
type: reference
native: AVCaptureSessionDidStopRunningNotification
---

# `AVCaptureSession`: `stop` event

The **`stop`** event fires when the session stops capturing, both when the app calls [`stopRunning()`](stoprunning.md) and when the system stops the session itself.

## Syntax

```
session.addEventListener('stop', (event) => { })
```

## Event object

`Event`, with no extra fields. `target` is the session. Not cancelable; `preventDefault()` has no effect.

## When it fires

- Once, after `stopRunning()` has stopped the session (verified by testing). At that point [`isRunning`](isrunning.md) is `false`.
- When the system stops the session itself, for example after an error while capturing (with [`runtimeerror`](runtimeerror-event.md) fired first). This is **not verified on a device**.
- The callback runs on the turn after the session has stopped. Whether it comes before or after the Promise returned by `stopRunning()` is **not verified on a device**; don't rely on the order.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('stop', () => {
  console.log('Capturing stopped');
});
```

**Effect**: prints `Capturing stopped` each time the session stops capturing.

## Corresponding iOS API

The notification `AVCaptureSessionDidStopRunningNotification`, with `object` set to the session. There's no need to register with the notification center; use `addEventListener`.

## See also

- [`start`](start-event.md): capturing started
- [`stopRunning()`](stoprunning.md)
