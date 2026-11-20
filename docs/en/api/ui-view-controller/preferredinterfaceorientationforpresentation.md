---
type: reference
native: UIViewController.preferredInterfaceOrientationForPresentation
---

# `UIViewController`: `preferredInterfaceOrientationForPresentation` property

The **`preferredInterfaceOrientationForPresentation`** property is the orientation this view controller starts in when it is presented full screen.

## Value

An orientation name: `'portrait'`, `'portraitUpsideDown'`, `'landscapeLeft'`, or `'landscapeRight'`.

- Readable and writable. In the iPhone Air simulator (iOS 27.2), the default is `'portrait'`.
- Takes effect only when this view controller is presented full screen (`modalPresentationStyle` is `'fullScreen'`). The effect after presentation is **not verified in the simulator**.
- Must be consistent with this view controller's [`supportedInterfaceOrientations`](supportedinterfaceorientations.md); otherwise the system goes by the allowed orientations.

Only view controllers created with `new UIViewController()`, `new UINavigationController()`, or `new UITabBarController()` can be written. System view controllers (alerts, the share sheet, the photo picker, the camera) cannot; writing it on them throws `TypeError`: in native development this setting cannot be changed on them either.

### Invalid values

An unrecognized name has no effect; a warning is printed listing the four valid names.

## Examples

```js
const page = new UIViewController();
page.preferredInterfaceOrientationForPresentation = 'landscapeRight';
console.log(page.preferredInterfaceOrientationForPresentation);
```

**Result**: prints `landscapeRight`.

## Corresponding iOS API

`UIViewController.preferredInterfaceOrientationForPresentation`. In native code it is read-only and must be overridden in a subclass; here you write it directly.

## See also

- [`supportedInterfaceOrientations`](supportedinterfaceorientations.md)
- [`presentViewController()`](presentviewcontroller.md)
