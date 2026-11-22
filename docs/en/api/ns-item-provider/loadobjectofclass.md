---
type: reference
native: "-[NSItemProvider loadObjectOfClass:completionHandler:]"
---

# `NSItemProvider`: `loadObjectOfClass()` method

The **`loadObjectOfClass()`** method retrieves an object of a certain class from this item. Currently it can only retrieve `UIImage`.

## Syntax

```
loadObjectOfClass(aClass)
```

### Parameters

**`aClass`**

A class itself, not a string. Currently it can only be `UIImage`.

### Return value

A `Promise` that fulfills with the retrieved [`UIImage`](../ui-image.md).

- **It may take a while.** When the photo is stored in iCloud and only a thumbnail is on the phone, the system downloads the original first. How long it takes is **not verified in the simulator**.
- **The retrieved image isn't decoded.** It's decoded only when first displayed, and a large image occupies the UI thread at that moment. Call [`prepareForDisplay()`](../ui-image/preparefordisplay.md) once before displaying it.
- The same provider can be loaded twice at the same time; both fulfill.

When the Promise is rejected, the error's `name` is:

| `name` | When |
| --- | --- |
| `NotSupportedError` | The item can't provide an image (the selected item is a video). This is the case when `canLoadObjectOfClass(UIImage)` is `false` |
| `NotReadableError` | An error occurred while reading. `code` and `domain` on the error object are the raw values from the system |

### Exceptions

**`TypeError`**

`aClass` isn't `UIImage`; thrown synchronously rather than rejecting the Promise: `loadObjectOfClass supports only UIImage for now, got UIColor`.

## Examples

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
const imageView = new UIImageView();
picker.addEventListener('pick', async (event) => {
  const { results } = event;
  picker.dismissViewController({ animated: true });
  if (results.length === 0) return;
  try {
    const image = await results[0].itemProvider.loadObjectOfClass(UIImage);
    imageView.image = await image.prepareForDisplay();
  } catch (err) {
    console.log('Could not get the image: ' + /** @type {Error} */ (err).name);
  }
});
```

**Effect**: after an image is selected, it's shown in `imageView` once decoded, and the UI doesn't stall at the moment it appears. When the selected item is a video, prints `Could not get the image: NotSupportedError`. Retrieving an image from a real selected item is **not verified in the simulator**.

## Corresponding iOS API

`-[NSItemProvider loadObjectOfClass:completionHandler:]`. The completion handler is replaced with a Promise.

## See also

- [`canLoadObjectOfClass()`](canloadobjectofclass.md): check first whether it can be retrieved
- [Picking photos and saving images to the photo library](../../guides/pick-photos.md#loading-an-image-from-a-picked-item)
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
