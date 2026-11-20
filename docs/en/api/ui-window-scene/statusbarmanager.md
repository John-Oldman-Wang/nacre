---
type: reference
native: UIWindowScene.statusBarManager
---

# `UIWindowScene`: `statusBarManager` property

The **`statusBarManager`** property describes what this scene's status bar looks like right now: whether it is hidden, its style, and how much room it takes up.

## Value

A [`UIStatusBarManager`](../ui-status-bar-manager.md).

- Read-only. Assigning to it throws `TypeError`.
- Every read on the same scene returns the same object; its properties give the values at the moment they are read.

The status bar is determined by the view controller. To change it, set the view controller's [`prefersStatusBarHidden`](../ui-view-controller/prefersstatusbarhidden.md) and [`preferredStatusBarStyle`](../ui-view-controller/preferredstatusbarstyle.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.isStatusBarHidden);
});
```

**Result**: logs `false`.

## Corresponding iOS API

`UIWindowScene.statusBarManager`.

## See also

- [`UIStatusBarManager`](../ui-status-bar-manager.md)
