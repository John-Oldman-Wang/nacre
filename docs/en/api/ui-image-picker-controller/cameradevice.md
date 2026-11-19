---
type: reference
native: UIImagePickerController.cameraDevice
---

# `UIImagePickerController`: `cameraDevice` property

The **`cameraDevice`** property is which camera the camera interface uses when it opens. The user can still switch it in the camera interface.

## Value

A string, one of:

| Value | Effect |
| --- | --- |
| `'rear'` | Uses the camera on the back when it opens |
| `'front'` | Uses the camera on the screen side when it opens |

- Readable and writable. Can only be read and written when [`sourceType`](sourcetype.md) is `'camera'`.
- The default is `'rear'`. The simulator has no camera, and it still reads `'rear'`.
- Reading it back after writing a camera that exists is **not verified**.
- Whether it follows along when the user switches cameras after opening is **not verified**. There is no change notification.

### Invalid values

- When `sourceType` is not `'camera'`, both reading and writing throw `TypeError`:

  ```
  cameraDevice is only available when sourceType is "camera"; set sourceType first
  ```

- Writing a camera this device does not have throws `TypeError`, and the previous value is unchanged. Writing `'front'` in the simulator does this:

  ```
  cameraDevice "front" is not available on this device. Check UIImagePickerController.isCameraDeviceAvailable("front") first
  ```

- Writing a value not in the table does not throw. The console prints a warning, and the property keeps its previous value. The warning ends with `expected one of: rear / front, ignored`.
- The system itself rejects the read or write: throws `TypeError`, with a `message` that starts with the property name followed by the reason given by the system. When this happens is **not verified**.

## Examples

```js
const picker = new UIImagePickerController();
if (UIImagePickerController.isSourceTypeAvailable('camera')) {
  picker.sourceType = 'camera';
  if (UIImagePickerController.isCameraDeviceAvailable('front')) {
    picker.cameraDevice = 'front';
  }
}
```

**Effect** (**not verified**): On devices with a front camera, the camera interface opens showing the view from the screen-side camera.

## Corresponding iOS API

`UIImagePickerController.cameraDevice`. `UIImagePickerControllerCameraDeviceRear` is written `'rear'`, and `UIImagePickerControllerCameraDeviceFront` is written `'front'`.

## See also

- [`isCameraDeviceAvailable()`](iscameradeviceavailable.md): first ask whether the camera exists
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
