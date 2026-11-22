---
type: reference
native: UIImagePickerController.allowsEditing
---

# `UIImagePickerController`: `allowsEditing` property

The **`allowsEditing`** property determines whether the user can crop the photo after taking it.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | After the user presses the shutter there is an extra step in which they can move and zoom the photo to choose a region. The [`pick`](pick-event.md) event gains `editedImage` and `cropRect` |
| `false` | There is no cropping step. In the `pick` event, `editedImage` and `cropRect` are `null` |

- Readable and writable.
- The default is `false`.
- Values of other types are converted to a boolean by JS truthiness: `0` is `false`, and a non-empty string is `true` (`'false'` is also `true`).
- Only the app itself can change it, so there is no change notification.
- What the cropping interface looks like on screen is **not verified**.

## Examples

```js
const picker = new UIImagePickerController();
picker.allowsEditing = true;
picker.addEventListener('pick', (shot) => {
  const image = shot.editedImage ?? shot.originalImage;
  console.log(image.size.width + ' × ' + image.size.height);
});
```

**Effect** (**not verified**): After the user crops and taps "Use Photo", prints the width and height of the cropped region.

## Corresponding iOS API

`UIImagePickerController.allowsEditing`.

## See also

- [`pick`](pick-event.md): `editedImage` and `cropRect`
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
