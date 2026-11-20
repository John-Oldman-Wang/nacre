---
type: reference
native: UIViewController.prefersInterfaceOrientationLocked
---

# `UIViewController`: `prefersInterfaceOrientationLocked` property

The **`prefersInterfaceOrientationLocked`** property indicates that this view controller wants the orientation locked (iOS 26 and later).

## Value

A boolean.

- Readable and writable. The default is `false`.
- `true`: asks for the lock. The system locks only when the scene is centered, the same size as the screen, and not covered by another scene; read [`effectiveGeometry.isInterfaceOrientationLocked`](../ui-window-scene-geometry/isinterfaceorientationlocked.md) to see whether it is locked right now. The effect once locked is **not verified in the simulator**.
- `false`: does not lock.
- After a write, the runtime immediately tells the system to ask again.

Only view controllers created with `new UIViewController()`, `new UINavigationController()`, or `new UITabBarController()` can be written. System view controllers (alerts, the share sheet, the photo picker, the camera) cannot; writing it on them throws `TypeError`: in native development this setting cannot be changed on them either.

## Examples

```js
const page = new UIViewController();
page.prefersInterfaceOrientationLocked = true;
console.log(page.prefersInterfaceOrientationLocked);
```

**Result**: prints `true`.

## Corresponding iOS API

`UIViewController.prefersInterfaceOrientationLocked`. In native code it is read-only and must be overridden in a subclass; here you write it directly.

## See also

- [`UIWindowSceneGeometry`](../ui-window-scene-geometry.md)
