---
type: reference
native: LAContext.biometryType
---

# `LAContext`: `biometryType` property

The **`biometryType`** property indicates which kind of biometric authentication the device supports. It only says which kind the device has, not whether it can be used right now; to find out whether it can be used right now, ask [`canEvaluatePolicy()`](canevaluatepolicy.md).

## Value

A string, one of these four:

| Value | Meaning |
| --- | --- |
| `'none'` | The device does not support biometric authentication |
| `'faceID'` | The device supports Face ID |
| `'touchID'` | The device supports Touch ID |
| `'opticID'` | The device supports Optic ID (iris recognition). Appears only on Apple Vision Pro; never read on iPhone |

- Read-only; assigning to it throws `TypeError`.
- There is no default value; it depends on the device.
- **It can be read only after calling [`canEvaluatePolicy()`](canevaluatepolicy.md) once.** Reading it before that gives `'none'`. After one call, whether that call returned `true` or `false`, it reads as the kind the device supports. **Not verified in the simulator.**
- It does not change while the app is running, so there is no change notification.
- It can still be read on an object that has had [`invalidate()`](invalidate.md) called.

## Examples

```js
const context = new LAContext();
context.canEvaluatePolicy('deviceOwnerAuthentication');
const name = context.biometryType === 'faceID' ? 'Face ID'
  : context.biometryType === 'touchID' ? 'Touch ID'
  : 'passcode';
console.log('Confirm with ' + name);
```

**Effect**: Calls `canEvaluatePolicy()` first, then reads `biometryType`. A device with Face ID prints `Confirm with Face ID`, a device with Touch ID prints `Confirm with Touch ID`, and a device with neither prints `Confirm with passcode`. The value on each device is **not verified in the simulator**.

## Corresponding iOS API

`LAContext.biometryType`. `LABiometryTypeFaceID` is written `'faceID'`, and likewise for the rest.

## See also

- [`canEvaluatePolicy()`](canevaluatepolicy.md): whether biometrics can be used right now
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
