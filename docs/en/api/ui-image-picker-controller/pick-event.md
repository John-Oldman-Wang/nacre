---
type: reference
native: "-[UIImagePickerControllerDelegate imagePickerController:didFinishPickingMediaWithInfo:]"
---

# `UIImagePickerController`: `pick` event

The **`pick`** event fires when the user has taken a photo and tapped "Use Photo". The event carries the photo.

## Syntax

```
picker.addEventListener('pick', (event) => { })
```

## Event object

[`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md), with three extra fields:

| Field | Type | Meaning |
| --- | --- | --- |
| [`originalImage`](../ui-image-picker-controller-media-event/originalimage.md) | [`UIImage`](../ui-image.md) | The photo taken, uncropped |
| [`editedImage`](../ui-image-picker-controller-media-event/editedimage.md) | `UIImage` or `null` | The photo after the user cropped it. `null` when [`allowsEditing`](allowsediting.md) is off |
| [`cropRect`](../ui-image-picker-controller-media-event/croprect.md) | [`CGRect`](../structs.md) or `null` | Which region of the original the user cropped. `null` when `allowsEditing` is off. The unit of the values is **not verified** |

- `target` is this camera interface.
- Not cancelable; `preventDefault()` has no effect.

## When it fires

- After the user presses the shutter and taps "Use Photo". Each presentation receives only one of `pick` and [`cancel`](cancel-event.md).
- Whether it fires while the user goes back and forth between "Retake" and the viewfinder is **not verified**; according to the system headers, the event comes only when the user confirms.
- After it fires, the camera interface is still on screen. The system does not dismiss it by itself; call `dismissViewController()` in the listener.
- The photo taken is at the camera's full resolution; the exact size is **not verified**.

The actual firing of this event is **not verified**: the simulator cannot take photos, and it has not yet been verified on a device.

## Examples

```js
const picker = new UIImagePickerController();
picker.addEventListener('pick', (event) => {
  const { originalImage } = event;
  console.log('Took ' + originalImage.size.width + ' × ' + originalImage.size.height);
  picker.dismissViewController({ animated: true });
});
```

**Effect** (**not verified**): After the user taps "Use Photo", the console prints the photo's width and height, and the camera interface lowers.

## Corresponding iOS API

The delegate method `imagePickerController:didFinishPickingMediaWithInfo:`. `info[UIImagePickerControllerOriginalImage]`, `info[UIImagePickerControllerEditedImage]`, and `info[UIImagePickerControllerCropRect]` are `e.originalImage`, `e.editedImage`, and `e.cropRect`.

## See also

- [`cancel`](cancel-event.md): the user cancels
- [The app dismisses the camera interface](../ui-image-picker-controller.md#the-app-dismisses-the-camera-interface)
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
