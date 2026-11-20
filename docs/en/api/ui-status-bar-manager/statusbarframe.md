---
type: reference
native: UIStatusBarManager.statusBarFrame
---

# `UIStatusBarManager`: `statusBarFrame` property

The **`statusBarFrame`** property is the area the status bar occupies.

## Value

A [`CGRect`](../cg-rect.md), in pt, in screen coordinates.

- Read-only.
- Its height is 0 when the status bar is hidden. **Not verified in the simulator.**
- Don't use it to position content; use the view's safe area instead. The safe area also accounts for the Dynamic Island, the notch, and the home indicator.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.statusBarFrame.height);
});
```

**Result**: logs the status bar's height. The exact number is **not recorded**.

## Corresponding iOS API

`UIStatusBarManager.statusBarFrame`.
