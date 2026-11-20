---
type: reference
native: UIStatusBarManager
---

# `UIStatusBarManager`

**`UIStatusBarManager`** represents what a scene's status bar looks like right now: whether it is hidden, its style, and how much room it takes up. It is read-only; to change the status bar, set the view controller's [`prefersStatusBarHidden`](ui-view-controller/prefersstatusbarhidden.md) and [`preferredStatusBarStyle`](ui-view-controller/preferredstatusbarstyle.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIStatusBarManager`

## Constructor

Can't be created with `new`; doing so throws `TypeError`. Read it from the scene's [`statusBarManager`](ui-window-scene/statusbarmanager.md).

## Instance properties

All read-only; each gives the value at the moment it is read.

| Property | Description |
| --- | --- |
| [`isStatusBarHidden`](ui-status-bar-manager/isstatusbarhidden.md) <small>read-only</small> | Whether the status bar is hidden |
| [`statusBarStyle`](ui-status-bar-manager/statusbarstyle.md) <small>read-only</small> | The status bar's style |
| [`statusBarFrame`](ui-status-bar-manager/statusbarframe.md) <small>read-only</small> | The area the status bar occupies |

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const bar = e.scene.statusBarManager;
  console.log(bar.isStatusBarHidden, bar.statusBarStyle);
});
```

**Result**: logs `false default`.

## Corresponding iOS API

`UIStatusBarManager`.

## See also

- [`UIViewController`](ui-view-controller.md): `prefersStatusBarHidden`, `preferredStatusBarStyle`
