---
type: reference
native: UIStatusBarManager.isStatusBarHidden
---

# `UIStatusBarManager`: `isStatusBarHidden` property

The **`isStatusBarHidden`** property indicates whether the status bar is hidden right now.

## Value

A boolean.

- Read-only.
- Becomes `true` after the root view controller's `prefersStatusBarHidden` is set to `true` (tested).
- No change notification: the status bar is determined by the view controller, and the view controller's value is set by the app itself.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.isStatusBarHidden);
});
```

**Result**: logs `false`.

## Corresponding iOS API

`UIStatusBarManager.isStatusBarHidden`.
