---
type: reference
native: AVCaptureSessionRuntimeErrorEvent.error
---

# `AVCaptureSessionRuntimeErrorEvent`: `error` property

The **`error`** property is the error the system gave.

## Value

An [`NSError`](../ns-error.md). `message` is the system's description, in the system language; `domain` and `code` are the system's error domain and code.

- Read-only. Assigning to it throws `TypeError`.
- Use `domain` and `code` to tell what went wrong, not `message`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const session = new AVCaptureSession();
session.addEventListener('runtimeerror', (e) => {
  console.log('取景出错', e.error.domain, e.error.code, e.error.message);
});
```

**Effect**: when capture fails, prints the error domain, code, and description. **Not verified on a device**: this event couldn't be triggered.

## Corresponding iOS API

`userInfo[AVCaptureSessionErrorKey]` of `AVCaptureSessionRuntimeErrorNotification`.

## See also

- [`AVCaptureSessionRuntimeErrorEvent`](../av-capture-session-runtime-error-event.md)
