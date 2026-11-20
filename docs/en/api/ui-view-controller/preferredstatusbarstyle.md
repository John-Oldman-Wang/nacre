---
type: reference
native: UIViewController.preferredStatusBarStyle
---

# `UIViewController`: `preferredStatusBarStyle` property

The **`preferredStatusBarStyle`** property is the status bar style while this view controller is on screen: dark text or light text.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'default'` | Follows the system's dark or light appearance: dark text in light mode, light text in dark mode |
| `'darkContent'` | Dark text. Use it when the top of the view controller has a light background |
| `'lightContent'` | Light text. Use it when the top of the view controller has a dark background |

- Readable and writable. The default is `'default'`.
- After a view controller presented full screen sets it to `'lightContent'`, the status bar style changes accordingly (tested: [`statusBarManager.statusBarStyle`](../ui-status-bar-manager/statusbarstyle.md) becomes `'lightContent'`).
- After a write, the runtime immediately tells the system to ask again. Which view controller the system asks is the same as for [`prefersStatusBarHidden`](prefersstatusbarhidden.md); the case inside a navigation controller is **not verified in the simulator**.

Only view controllers created with `new UIViewController()`, `new UINavigationController()`, or `new UITabBarController()` can be written. System view controllers (alerts, the share sheet, the photo picker, the camera) cannot; writing it on them throws `TypeError`: in native development this setting cannot be changed on them either.

### Invalid values

An unrecognized value has no effect; a warning is printed listing the three valid values.

## Examples

```js
const page = new UIViewController();
page.preferredStatusBarStyle = 'lightContent';
console.log(page.preferredStatusBarStyle);
```

**Result**: prints `lightContent`. When this view controller is the window's root view controller, the status bar text turns white.

## Corresponding iOS API

`UIViewController.preferredStatusBarStyle`. In native code it is read-only and must be overridden in a subclass; here you write it directly.

## See also

- [`prefersStatusBarHidden`](prefersstatusbarhidden.md)
- [`UIStatusBarManager`](../ui-status-bar-manager.md)
