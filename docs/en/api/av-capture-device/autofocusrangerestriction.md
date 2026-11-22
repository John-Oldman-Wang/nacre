---
type: reference
native: AVCaptureDevice.autoFocusRangeRestriction
---

# `AVCaptureDevice`: `autoFocusRangeRestriction` property

The **`autoFocusRangeRestriction`** property indicates which distance range autofocus searches for focus in.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'none'` | No limit; searches near and far |
| `'near'` | Searches only up close. Focuses faster when scanning a code held nearby |
| `'far'` | Searches only far away |

- Readable and writable.
- Defaults to `'none'` (verified by testing).
- Call [`lockForConfiguration()`](lockforconfiguration.md) before writing it, and [`unlockForConfiguration()`](unlockforconfiguration.md) afterwards.
- After writing, it reads back as the written value (verified by testing). How much faster focusing gets is **not verified on a device**.
- The app writes it itself, and there is no event when it changes.

### Invalid values

- Writing without the lock: throws a [`DOMException`](../dom-exception.md) whose `name` is `'InvalidStateError'`, and the value doesn't change (verified by testing). The message is `autoFocusRangeRestriction: the system refused (…)`; the parentheses hold the reason the system gave, which says to lock first (`-lockForConfiguration:`).
- The camera doesn't support restricting the range: the system refuses, and it throws a `DOMException` whose `name` is `'InvalidStateError'`, with the reason the system gave in the message. **Not verified on a device.** The rear camera of an iPhone 14 supports it (verified by testing).
- Writing a value not in the table doesn't throw: a warning listing all valid values is printed to the console, and the value doesn't change (verified by testing).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null) {
  device.lockForConfiguration();
  try {
    device.autoFocusRangeRestriction = 'near';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.autoFocusRangeRestriction);
}
```

**Effect**: prints `near`. From then on, autofocus searches only up close.

## Corresponding iOS API

`AVCaptureDevice.autoFocusRangeRestriction`. `AVCaptureAutoFocusRangeRestrictionNear` is written as `'near'`, and so on. In ObjC you ask `autoFocusRangeRestrictionSupported` before writing; here, writing throws a `DOMException` whose `name` is `'InvalidStateError'` when the camera doesn't support it.

## See also

- [`focusMode`](focusmode.md): the focus mode
- [Focus faster on nearby codes](../../guides/scanning.md#focus-faster-on-nearby-codes)
