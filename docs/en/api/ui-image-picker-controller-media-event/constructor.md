---
type: reference
native: UIImagePickerControllerMediaEvent()
---

# `UIImagePickerControllerMediaEvent()` constructor

The **`UIImagePickerControllerMediaEvent()`** constructor creates a `UIImagePickerControllerMediaEvent`.

## Syntax

```
new UIImagePickerControllerMediaEvent(type)
new UIImagePickerControllerMediaEvent(type, { originalImage, editedImage, cropRect, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.originalImage`**

Optional. Corresponds to the [`originalImage`](originalimage.md) property. Must be a `UIImage` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.editedImage`**

Optional. Corresponds to the [`editedImage`](editedimage.md) property. Must be a `UIImage` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cropRect`**

Optional. Corresponds to the [`cropRect`](croprect.md) property. A `CGRect`, or a plain object with `x`, `y`, `width`, `height` (converted to a `CGRect` the same way the struct converts its fields); it may also be `null`. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `UIImagePickerControllerMediaEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'UIImagePickerControllerMediaEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new UIImagePickerControllerMediaEvent('pick');
console.log(event.originalImage, event.editedImage, event.cropRect);
```

**Result**: the console prints `null null null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
