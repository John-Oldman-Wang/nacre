---
type: reference
native: "+[UIImagePickerController isSourceTypeAvailable:]"
---

# `UIImagePickerController.isSourceTypeAvailable()` static method

The **`UIImagePickerController.isSourceTypeAvailable()`** static method queries whether a source is available on this device.

## Syntax

```
UIImagePickerController.isSourceTypeAvailable(sourceType)
```

### Parameters

**`sourceType`**

The source, one of these three strings:

| Value | Meaning |
| --- | --- |
| `'camera'` | The camera |
| `'photoLibrary'`, `'savedPhotosAlbum'` | The photo library, in two listings |

### Return value

A boolean. `true`: this source is available. `false`: it is not.

`'camera'` being available does not mean there is a camera. Measured in the simulator (iPhone Air, iOS 27.2): `isSourceTypeAvailable('camera')` is `true`, while [`isCameraDeviceAvailable()`](iscameradeviceavailable.md) is `false` for both cameras. Ask both before taking a photo.

### Exceptions

**`TypeError`**

`sourceType` is not a value in the table above. The error lists the values that can be written:

```
isSourceTypeAvailable has no value "video"; expected one of: photoLibrary / camera / savedPhotosAlbum
```

## Examples

```js
console.log(UIImagePickerController.isSourceTypeAvailable('camera'));
```

**Result**: Prints `true` in the simulator.

## Corresponding iOS API

`+[UIImagePickerController isSourceTypeAvailable:]`. `UIImagePickerControllerSourceTypeCamera` is written `'camera'`, and likewise for the rest.

## See also

- [`isCameraDeviceAvailable()`](iscameradeviceavailable.md): whether there is a camera
- [Taking a photo](../../guides/take-photo.md#first-ask-whether-this-device-can-take-photos): asking both together
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
