---
type: reference
native: UIImagePickerControllerMediaEvent.cropRect
---

# `UIImagePickerControllerMediaEvent`: `cropRect` property

The **`cropRect`** property is the part of the original photo the user cropped to.

## Value

A [`CGRect`](../cg-rect.md) or `null`. It is `null` when [`allowsEditing`](../ui-image-picker-controller/allowsediting.md) is off. The unit of the values is **not verified**.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const picker = new UIImagePickerController();
picker.allowsEditing = true;
picker.addEventListener('pick', (e) => {
  if (e.cropRect !== null) console.log(e.cropRect.width, e.cropRect.height);
  picker.dismissViewController({ animated: true });
});
```

**Effect**: after taking and cropping a photo, prints the width and height of the crop rectangle. **Not verified.**

## Corresponding iOS API

`info[UIImagePickerControllerCropRect]`.

## See also

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
