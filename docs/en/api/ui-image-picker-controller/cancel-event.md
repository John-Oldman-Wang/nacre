---
type: reference
native: "-[UIImagePickerControllerDelegate imagePickerControllerDidCancel:]"
---

# `UIImagePickerController`: `cancel` event

The **`cancel`** event fires when the user taps "Cancel" in the camera interface.

## Syntax

```
picker.addEventListener('cancel', (event) => { })
```

## Event object

`Event`, with no extra fields. `target` is this camera interface. Not cancelable; `preventDefault()` has no effect.

## When it fires

- After the user taps "Cancel". Each presentation receives only one of [`pick`](pick-event.md) and `cancel`.
- After it fires, the camera interface is still on screen. The system does not dismiss it by itself; call `dismissViewController()` in the listener. If you only listen for `pick`, the interface cannot be closed after the user taps "Cancel".
- When you dispatch it yourself with `dispatchEvent(new Event('cancel'))`, only the JS listeners receive it; the camera interface is not affected.

The actual firing when the user taps "Cancel" is **not verified**: the simulator cannot take photos, and it has not yet been verified on a device.

## Examples

```js
const picker = new UIImagePickerController();
picker.addEventListener('cancel', () => {
  console.log('No photo taken');
  picker.dismissViewController({ animated: true });
});
```

**Effect** (**not verified**): After the user taps "Cancel", the console prints `No photo taken`, and the camera interface lowers.

## Corresponding iOS API

The delegate method `imagePickerControllerDidCancel:`.

## See also

- [`pick`](pick-event.md): the user finished taking a photo
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
