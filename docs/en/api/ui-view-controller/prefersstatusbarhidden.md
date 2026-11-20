---
type: reference
native: UIViewController.prefersStatusBarHidden
---

# `UIViewController`: `prefersStatusBarHidden` property

The **`prefersStatusBarHidden`** property indicates whether the status bar is hidden while this view controller is on screen. The status bar is the strip at the very top of the screen that shows the time, signal, and battery.

## Value

A boolean, converted with `Boolean()`.

- Readable and writable. The default is `false`.
- `true`: hidden. After a view controller presented full screen sets it to `true`, the status bar is hidden (tested: [`statusBarManager.isStatusBarHidden`](../ui-status-bar-manager/isstatusbarhidden.md) becomes `true`).
- `false`: shown.
- After a write, the runtime immediately tells the system to ask again; you do not need to call [`setNeedsStatusBarAppearanceUpdate()`](setneedsstatusbarappearanceupdate.md) yourself.
- The system asks the topmost full-screen view controller: the window's root view controller, or a view controller it presented full screen.
- When the view controller is inside a navigation controller, a value set on the navigation controller itself takes precedence; if it is not set, the view controller the navigation controller is currently showing decides (both cases tested). So each view controller can set its own value, and the status bar follows as you push and go back. The tab bar controller case is **not verified in the simulator**.

Only view controllers created with `new UIViewController()`, `new UINavigationController()`, or `new UITabBarController()` can be written. System view controllers (alerts, the share sheet, the photo picker, the camera) cannot; writing it on them throws `TypeError`: in native development this setting cannot be changed on them either.

## Examples

```js
const page = new UIViewController();
page.prefersStatusBarHidden = true;
console.log(page.prefersStatusBarHidden);
```

**Result**: prints `true`. When this view controller is the window's root view controller, the status bar is hidden.

## Corresponding iOS API

`UIViewController.prefersStatusBarHidden`. In native code it is read-only and must be overridden in a subclass; here you write it directly.

## See also

- [`preferredStatusBarStyle`](preferredstatusbarstyle.md)
- [`UIStatusBarManager`](../ui-status-bar-manager.md): how the status bar looks right now
