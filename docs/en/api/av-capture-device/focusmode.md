---
type: reference
native: AVCaptureDevice.focusMode
---

# `AVCaptureDevice`: `focusMode` property

The **`focusMode`** property indicates how the camera focuses.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'continuousAutoFocus'` | Keeps focusing automatically: when things in the picture move nearer or farther, the camera refocuses |
| `'autoFocus'` | Focuses once, then locks |
| `'locked'` | The focus is locked and doesn't move |

- Readable and writable.
- Default: measured as `'continuousAutoFocus'` on the rear camera of an iPhone 14. That's fine for scanning; no need to change it.
- Call [`lockForConfiguration()`](lockforconfiguration.md) before writing it, and [`unlockForConfiguration()`](unlockforconfiguration.md) afterwards.
- Ask which modes a camera supports with [`isFocusModeSupported()`](isfocusmodesupported.md).
- After writing, it reads back as the written value (verified by testing). The effect of focusing on the picture is **not verified on a device**.
- After changing [`focusPointOfInterest`](focuspointofinterest.md), write `focusMode` once more for the new focus point to take effect. This is **not verified on a device**.
- Whether the value reads `'locked'` after `'autoFocus'` finishes focusing is **not verified on a device**.
- There is no event when it changes.

### Invalid values

- Writing without the lock: throws `TypeError`, and the value doesn't change (verified by testing). The message is `focusMode: the system refused (…)`; the parentheses hold the reason the system gave, which says to lock first (`-lockForConfiguration:`).
- The camera doesn't support this mode: the system refuses, and it throws `TypeError` with the reason the system gave. **Not verified on a device.**
- Writing a value not in the table doesn't throw: a warning listing all valid values is printed to the console, and `focusMode` keeps its previous value (verified by testing).

## Examples

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (device !== null && device.isFocusModeSupported('locked')) {
  device.lockForConfiguration();
  try {
    device.focusMode = 'locked';
  } finally {
    device.unlockForConfiguration();
  }
  console.log(device.focusMode);
}
```

**Effect**: the focus is locked, and `locked` is printed.

## Corresponding iOS API

`AVCaptureDevice.focusMode`. `AVCaptureFocusModeContinuousAutoFocus` is written as `'continuousAutoFocus'`, and so on. In ObjC, writing without the lock throws `NSGenericException`; here it's `TypeError`.

## See also

- [`isFocusModeSupported()`](isfocusmodesupported.md): whether a mode is supported
- [`focusPointOfInterest`](focuspointofinterest.md): the focus point
- [`autoFocusRangeRestriction`](autofocusrangerestriction.md): which distance autofocus searches
