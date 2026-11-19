---
type: reference
native: UIDevice.currentDevice
---

# `UIDevice.currentDevice` static property

The **`UIDevice.currentDevice`** static property is the device the app is running on.

## Value

`UIDevice`.

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object.
- `UIDevice` can't be created with `new`; this is the only way to get the instance. `new UIDevice()` throws `TypeError: Illegal constructor: UIDevice is created by the runtime, not by new`.

## Examples

```js
const current = UIDevice.currentDevice;
console.log(current === UIDevice.currentDevice);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UIDevice.currentDevice`.

## See also

- [`UIDevice`](../ui-device.md)
