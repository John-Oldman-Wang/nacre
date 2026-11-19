---
type: reference
native: UIImagePickerController.cameraFlashMode
---

# `UIImagePickerController`: `cameraFlashMode` property

The **`cameraFlashMode`** property is the flash mode when the camera interface opens. The user can still change it in the camera interface.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'off'` | Never flashes |
| `'on'` | Flashes every time |
| `'auto'` | The system decides whether to flash based on the ambient brightness |

- Readable and writable. Can only be read and written when [`sourceType`](sourcetype.md) is `'camera'`. All three values read back unchanged after writing.
- The default is `'auto'`.
- The effect of each value when taking a photo is **not verified**.
- Whether it follows along when the user changes the flash after opening is **not verified**. There is no change notification.

### Invalid values

- When `sourceType` is not `'camera'`, both reading and writing throw `TypeError`:

  ```
  cameraFlashMode is only available when sourceType is "camera"; set sourceType first
  ```

- Writing a value not in the table does not throw. The console prints a warning, and the property keeps its previous value:

  ```
  [Nacre] cameraFlashMode has no value "torch"; expected one of: off / auto / on, ignored
  ```

- The system itself rejects the read or write: throws `TypeError`, with a `message` that starts with the property name followed by the reason given by the system. When this happens is **not verified**.

## Examples

```js
const picker = new UIImagePickerController();
if (UIImagePickerController.isSourceTypeAvailable('camera')) {
  picker.sourceType = 'camera';
  picker.cameraFlashMode = 'off';
  console.log(picker.cameraFlashMode);
}
```

**Result**: Prints `off`. The flash is off when the camera interface opens (**not verified**).

## Corresponding iOS API

`UIImagePickerController.cameraFlashMode`. `UIImagePickerControllerCameraFlashModeOff` is written `'off'`, and likewise for the rest.

## See also

- [`isFlashAvailableForCameraDevice()`](isflashavailableforcameradevice.md): whether there is a flash
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
