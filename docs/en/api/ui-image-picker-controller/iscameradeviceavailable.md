---
type: reference
native: "+[UIImagePickerController isCameraDeviceAvailable:]"
---

# `UIImagePickerController.isCameraDeviceAvailable()` static method

The **`UIImagePickerController.isCameraDeviceAvailable()`** static method queries whether this device has a given camera.

## Syntax

```
UIImagePickerController.isCameraDeviceAvailable(cameraDevice)
```

### Parameters

**`cameraDevice`**

The camera, one of these two strings:

| Value | Meaning |
| --- | --- |
| `'rear'` | The camera on the back |
| `'front'` | The camera on the screen side |

### Return value

A boolean. `true`: this camera exists. `false`: it does not.

In the simulator, both are `false`. The results on a device with cameras are **not verified**.

### Exceptions

**`TypeError`**

`cameraDevice` is not a value in the table above. The error lists the values that can be written:

```
isCameraDeviceAvailable has no value "back"; expected one of: rear / front
```

## Examples

```js
const hasCamera = UIImagePickerController.isCameraDeviceAvailable('rear') ||
                  UIImagePickerController.isCameraDeviceAvailable('front');
console.log(hasCamera);
```

**Result**: Prints `false` in the simulator.

## Corresponding iOS API

`+[UIImagePickerController isCameraDeviceAvailable:]`. `UIImagePickerControllerCameraDeviceRear` is written `'rear'`, and `UIImagePickerControllerCameraDeviceFront` is written `'front'`.

## See also

- [`isSourceTypeAvailable()`](issourcetypeavailable.md): whether the camera source is available
- [`cameraDevice`](cameradevice.md): which camera to use when it opens
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
