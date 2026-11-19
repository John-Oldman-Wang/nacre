---
type: reference
native: UIWindow.canBecomeKeyWindow
---

# `UIWindow`: `canBecomeKeyWindow` property

The **`canBecomeKeyWindow`** property indicates whether this window can become the key window.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Can become the key window |
| `false` | Can't; calling [`makeKeyWindow()`](makekeywindow.md) on it has no effect |

- Read-only; assigning to it throws `TypeError`.
- The value is decided by the system and doesn't change, so there is no change event.
- The actual value is **not verified in the simulator**.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  console.log(win.canBecomeKeyWindow);
});
```

**Result**: Prints whether this window can become the key window. **Not verified in the simulator.**

## Corresponding iOS API

`UIWindow.canBecomeKeyWindow`.

## See also

- [`isKeyWindow`](iskeywindow.md)
