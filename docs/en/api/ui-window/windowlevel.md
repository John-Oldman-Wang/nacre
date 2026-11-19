---
type: reference
native: UIWindow.windowLevel
---

# `UIWindow`: `windowLevel` property

The **`windowLevel`** property is the stacking order of multiple windows in the same scene. Windows with larger values are shown on top.

## Value

A number representing the level, unitless.

- Readable and writable.
- The default is `0`.
- The windows holding the system keyboard and system alerts are at higher levels. With only one window, there's no need to set it.
- Written values are converted with `Number()`.
- No event fires when it changes: it only changes when the app itself assigns it.

You can create multiple windows in the same scene. That fits one case: a layer of content that always stays above every view controller, including modally presented ones, such as a global banner. The behavior of multiple windows is **not verified in the simulator**: the acceptance tests have only one shown window.

### Invalid values

If it can't be converted to a finite number, it throws `TypeError: windowLevel must be a finite number, got "top"` (what follows `got` is the value received), and the value stays unchanged.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const overlay = new UIWindow(e.scene);
  overlay.rootViewController = new UIViewController();
  overlay.windowLevel = 1;
  overlay.isHidden = false;
});
```

**Effect**: `overlay` is shown above the window whose `windowLevel` is `0`. Its root view has no background color, so the window below shows through it. This uses `isHidden = false` rather than `makeKeyAndVisible()`, so the key window stays the same. **Not verified in the simulator.**

## Corresponding iOS API

`UIWindow.windowLevel`. `UIWindowLevelNormal` is written `0`.

## See also

- [`makeKeyWindow()`](makekeywindow.md)
