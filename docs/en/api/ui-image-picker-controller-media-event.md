---
type: reference
native: UIImagePickerControllerMediaEvent
---

# `UIImagePickerControllerMediaEvent`

**`UIImagePickerControllerMediaEvent`** represents the user taking a photo in the system camera screen.

The [`pick`](ui-image-picker-controller/pick-event.md) event of [`UIImagePickerController`](ui-image-picker-controller.md) is this class. It carries the photo taken, and the user's crop when [`allowsEditing`](ui-image-picker-controller/allowsediting.md) is on.

It belongs to the `@nacrejs/camera` package; for installation, see [`UIImagePickerController`](ui-image-picker-controller.md#installation).

**Inheritance**: [`Event`](event.md) → `UIImagePickerControllerMediaEvent`

## Constructor

[`UIImagePickerControllerMediaEvent()`](ui-image-picker-controller-media-event/constructor.md)

Creates a `UIImagePickerControllerMediaEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`originalImage`](ui-image-picker-controller-media-event/originalimage.md) <small>read-only</small> | The photo taken, uncropped |
| [`editedImage`](ui-image-picker-controller-media-event/editedimage.md) <small>read-only</small> | The photo after the user cropped it |
| [`cropRect`](ui-image-picker-controller-media-event/croprect.md) <small>read-only</small> | The part of the original photo the user cropped to |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIImagePickerController`](ui-image-picker-controller.md) | [`pick`](ui-image-picker-controller/pick-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. After it is fired, the camera screen is still on screen; close it in the listener.

## Examples

```js
const picker = new UIImagePickerController();
picker.addEventListener('pick', (e) => {
  console.log(e instanceof UIImagePickerControllerMediaEvent, e.editedImage);
  picker.dismissViewController({ animated: true });
});
```

**Effect**: after taking a photo, prints `true null`, then closes the camera screen. **Not verified**: the simulator can't take photos.

## Corresponding iOS API

Three entries of the `info` dictionary of the delegate method `imagePickerController:didFinishPickingMediaWithInfo:` are the three fields of the event object.

| ObjC | JS |
| --- | --- |
| `info[UIImagePickerControllerOriginalImage]` | `event.originalImage` |
| `info[UIImagePickerControllerEditedImage]` | `event.editedImage` |
| `info[UIImagePickerControllerCropRect]` | `event.cropRect` |

## See also

- [`UIImagePickerController`](ui-image-picker-controller.md): the object that fires this event
- [Taking a photo](../guides/take-photo.md)
