---
type: reference
native: "+[UIImagePickerController isFlashAvailableForCameraDevice:]"
---

# `UIImagePickerController.isFlashAvailableForCameraDevice()` static method

The **`UIImagePickerController.isFlashAvailableForCameraDevice()`** static method queries whether a given camera has a flash.

## Syntax

```
UIImagePickerController.isFlashAvailableForCameraDevice(cameraDevice)
```

### Parameters

**`cameraDevice`**

The camera, `'rear'` (on the back) or `'front'` (on the screen side).

### Return value

A boolean. `true`: this camera has a flash. `false`: it does not.

In the simulator, both are `false`. The results on a device with cameras are **not verified**.

### Exceptions

**`TypeError`**

`cameraDevice` is not `'rear'` or `'front'`. The error lists the values that can be written.

## Examples

```js
if (UIImagePickerController.isFlashAvailableForCameraDevice('rear')) {
  console.log('The rear camera has a flash');
}
```

**Effect**: Prints one line when the rear camera has a flash. Prints nothing in the simulator.

## Corresponding iOS API

`+[UIImagePickerController isFlashAvailableForCameraDevice:]`.

## See also

- [`cameraFlashMode`](cameraflashmode.md): the flash mode
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
