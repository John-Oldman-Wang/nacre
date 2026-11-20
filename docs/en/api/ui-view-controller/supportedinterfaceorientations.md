---
type: reference
native: UIViewController.supportedInterfaceOrientations
---

# `UIViewController`: `supportedInterfaceOrientations` property

The **`supportedInterfaceOrientations`** property lists the orientations this view controller allows the interface to rotate to.

## Value

An array of orientation names.

| Name | Orientation |
| --- | --- |
| `'portrait'` | Upright, with the home indicator at the bottom |
| `'portraitUpsideDown'` | Upside down |
| `'landscapeLeft'` | Sideways, with the top of the phone pointing right |
| `'landscapeRight'` | Sideways, with the top of the phone pointing left |
| `'landscape'` | Both landscape orientations |
| `'all'` | All four orientations |
| `'allButUpsideDown'` | The three orientations other than upside down |

- Readable and writable. Reading returns the names of individual orientations; combined names are expanded.
- When not set, it has the system default. In the iPhone Air simulator (iOS 27.2), all four orientations are allowed by default.
- After a write, the runtime immediately tells the system to ask again, and the system decides from the new value whether to rotate.
- The most orientations the app can allow are set by [`ios.orientations`](../../guides/project-config.md#declaring-the-orientations-the-app-allows) in `nacre.config.json`; this property narrows that set further. If the two have nothing in common, the system reports an error.
- When the view controller is inside a navigation controller, the system asks the navigation controller, so set it on the navigation controller (tested: when the window's root view controller is a navigation controller and this is set on it, rotation requests are allowed or rejected according to its value). The tab bar controller case is **not verified in the simulator**.

Only view controllers created with `new UIViewController()`, `new UINavigationController()`, or `new UITabBarController()` can be written. System view controllers (alerts, the share sheet, the photo picker, the camera) cannot; writing it on them throws `TypeError`: in native development this setting cannot be changed on them either.

### Invalid values

If the array contains a name that is not recognized, or is empty, the whole write has no effect, a warning is printed, and the value stays unchanged:

```
supportedInterfaceOrientations has no value "sideways"; expected one of: portrait / portraitUpsideDown / landscapeLeft / landscapeRight / landscape / all / allButUpsideDown
```

Writing something that is not an array throws `TypeError`: `supportedInterfaceOrientations needs an array of orientation names`.

## Examples

```js
const page = new UIViewController();
page.supportedInterfaceOrientations = ['portrait', 'landscape'];
console.log(page.supportedInterfaceOrientations.join(','));
```

**Result**: prints `portrait,landscapeLeft,landscapeRight`.

## Corresponding iOS API

`UIViewController.supportedInterfaceOrientations`. In native code it is read-only and must be overridden in a subclass; here you write it directly.

## See also

- [`requestGeometryUpdateWithPreferences()`](../ui-window-scene/requestgeometryupdatewithpreferences.md): rotate to an orientation on request
- [`geometrychange`](../ui-window-scene/geometrychange-event.md): the orientation changed
