---
type: reference
native: UIImagePickerControllerMediaEvent.editedImage
---

# `UIImagePickerControllerMediaEvent`: `editedImage` property

The **`editedImage`** property is the photo after the user cropped it.

## Value

A [`UIImage`](../ui-image.md) or `null`. It is `null` when [`allowsEditing`](../ui-image-picker-controller/allowsediting.md) is off.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const picker = new UIImagePickerController();
picker.allowsEditing = true;
picker.addEventListener('pick', (e) => {
  const photo = e.editedImage ?? e.originalImage;
  console.log(photo.size.width);
  picker.dismissViewController({ animated: true });
});
```

**Effect**: after taking and cropping a photo, prints the cropped photo's width. **Not verified.**

## Corresponding iOS API

`info[UIImagePickerControllerEditedImage]`.

## See also

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
