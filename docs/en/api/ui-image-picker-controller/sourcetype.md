---
type: reference
native: UIImagePickerController.sourceType
---

# `UIImagePickerController`: `sourceType` property

The **`sourceType`** property is where the camera interface's images come from. This package only supports the camera, so it can only be written as `'camera'`.

## Value

Read: one of these three strings. Write: only `'camera'`.

| Value | Meaning | Can it be written |
| --- | --- | --- |
| `'camera'` | The camera | Yes |
| `'photoLibrary'`, `'savedPhotosAlbum'` | The photo library, in two listings | No; throws `TypeError` |

- Readable and writable.
- The default is `'photoLibrary'`, the system default. After creating it you must write it as `'camera'` for it to be a camera interface. If you present it without doing so, the system's photo picking interface appears (**not verified**).
- Writing `'camera'` repeatedly does not throw.
- Only the app itself can change it, so there is no change notification.

### Invalid values

Two cases throw `TypeError`; after throwing, the previous value is unchanged:

- Writing either of the two photo library values:

  ```
  sourceType "photoLibrary" is not supported: @nacrejs/camera only takes photos with the camera (sourceType "camera"). Picking from the photo library is a separate package, @nacrejs/photos
  ```

- The camera source is unavailable on this device ([`isSourceTypeAvailable('camera')`](issourcetypeavailable.md) is `false`):

  ```
  sourceType "camera" is not available on this device. Check UIImagePickerController.isSourceTypeAvailable("camera") first
  ```

  This case is **not verified in the simulator**: in the simulator this source is available, and writing `'camera'` does not throw.

Writing any other value (neither `'camera'` nor the two photo library values, including numbers and `null`) does not throw. The console prints a warning, and the property keeps its previous value.

```
[Nacre] sourceType has no value "video"; expected one of: camera, ignored
```

## Examples

```js
const picker = new UIImagePickerController();
if (UIImagePickerController.isSourceTypeAvailable('camera')) {
  picker.sourceType = 'camera';
}
console.log(picker.sourceType);
```

**Result**: Prints `camera` when the camera source is available (including in the simulator), and `photoLibrary` when it is not.

## Corresponding iOS API

`UIImagePickerController.sourceType`. `UIImagePickerControllerSourceTypeCamera` is written `'camera'`. In ObjC, writing it when the source is unavailable throws an exception and the app terminates (according to Apple's documentation, **not verified**); here it is a `TypeError` you can `catch`.

## See also

- [Sources](../ui-image-picker-controller.md#sources)
- [`isSourceTypeAvailable()`](issourcetypeavailable.md)
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
