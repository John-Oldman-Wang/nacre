---
type: reference
native: PHPhotoLibrary.sharedPhotoLibrary
---

# `PHPhotoLibrary.sharedPhotoLibrary` static property

The **`PHPhotoLibrary.sharedPhotoLibrary`** static property is the system photo library. There is only this one in the whole app.

## Value

`PHPhotoLibrary`.

- Read-only. Assigning to it throws `TypeError`.
- Reading it twice gives the same object.

## Examples

```js
const library = PHPhotoLibrary.sharedPhotoLibrary;
console.log(library === PHPhotoLibrary.sharedPhotoLibrary);
```

**Result**: Prints `true`.

## Corresponding iOS API

`PHPhotoLibrary.sharedPhotoLibrary`.

## See also

- [`performChanges()`](performchanges.md): saving images to the library
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
