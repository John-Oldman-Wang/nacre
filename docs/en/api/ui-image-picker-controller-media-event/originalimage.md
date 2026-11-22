---
type: reference
native: UIImagePickerControllerMediaEvent.originalImage
---

# `UIImagePickerControllerMediaEvent`: `originalImage` property

The **`originalImage`** property is the photo taken, uncropped.

## Value

A [`UIImage`](../ui-image.md).

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const picker = new UIImagePickerController();
picker.addEventListener('pick', (e) => {
  console.log('拍到了 ' + e.originalImage.size.width + ' × ' + e.originalImage.size.height);
  picker.dismissViewController({ animated: true });
});
```

**Effect**: after taking a photo, prints its width and height, then closes the camera screen. **Not verified**: the simulator can't take photos.

## Corresponding iOS API

`info[UIImagePickerControllerOriginalImage]` of `imagePickerController:didFinishPickingMediaWithInfo:`.

## See also

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
