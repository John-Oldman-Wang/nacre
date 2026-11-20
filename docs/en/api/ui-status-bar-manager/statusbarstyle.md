---
type: reference
native: UIStatusBarManager.statusBarStyle
---

# `UIStatusBarManager`: `statusBarStyle` property

The **`statusBarStyle`** property is the status bar's current style.

## Value

A string: `'default'`, `'darkContent'`, or `'lightContent'`.

- Read-only.
- Becomes `'lightContent'` after the root view controller's `preferredStatusBarStyle` is set to `'lightContent'` (tested).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.statusBarStyle);
});
```

**Result**: logs `default`.

## Corresponding iOS API

`UIStatusBarManager.statusBarStyle`.
