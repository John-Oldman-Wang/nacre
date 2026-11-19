---
type: reference
native: "-[PHPhotoLibrary performChanges:completionHandler:]"
---

# `PHPhotoLibrary`: `performChanges()` method

The **`performChanges()`** method modifies the library: it saves an image as a new photo in the library.

## Syntax

```
performChanges({ creationRequestForAssetFromImage })
```

### Parameters

**`changes.creationRequestForAssetFromImage`**

The image to save, a [`UIImage`](../ui-image.md), required. A `UIImage` from any source can be saved: bundled, downloaded, or loaded from the photo picker.

### Return value

A `Promise` that resolves to `undefined` once saved.

- When the user hasn't been asked yet, it first shows the permission prompt and saves after the user allows it.
- After the user has denied it, no prompt is shown and the Promise is rejected directly.

When the Promise is rejected, you get an `Error` whose `name` is `NotAllowedError`, `InvalidStateError`, or `PhotosError`, with `code` and `domain`; see [Errors](../ph-photo-library.md#errors).

The result of saving is **not verified in the simulator**.

### Exceptions

**`TypeError`**

Thrown synchronously when the arguments are wrong, rather than rejecting the Promise:

| Call | Error |
| --- | --- |
| `performChanges()` | `performChanges needs { creationRequestForAssetFromImage: image }, got undefined` |
| `performChanges({})` | `performChanges needs { creationRequestForAssetFromImage: image }` |
| The image isn't a `UIImage` | `creationRequestForAssetFromImage must be a UIImage, got "dot.png"` |
| The object has other keys | `performChanges does not support "deleteAssets" yet; the only supported change is creationRequestForAssetFromImage` |

## Examples

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  try {
    await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
      creationRequestForAssetFromImage: photo,
    });
    console.log('Saved');
  } catch (err) {
    const error = /** @type {PHPhotoLibraryError} */ (err);
    console.log(error.name === 'NotAllowedError' ? 'Allow adding photos in Settings' : error.message);
  }
}
```

**Effect** (**not verified in the simulator**): On the first call, the system shows a permission prompt. After the user allows it, the library has a new photo and the console prints `Saved`. If the user denies it, it prints the line telling them to go to Settings.

## Corresponding iOS API

`-[PHPhotoLibrary performChanges:completionHandler:]` calling `+[PHAssetChangeRequest creationRequestForAssetFromImage:]`. In ObjC the first argument is a block of code; here in JS it is an object whose keys name the kind of change to make. The completion handler is replaced by a Promise.

## See also

- [`sharedPhotoLibrary`](sharedphotolibrary.md): getting the library
- [Picking photos from and saving photos to the library](../../guides/pick-photos.md#saving-an-image-to-the-photo-library)
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
