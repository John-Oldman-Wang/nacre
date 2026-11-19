---
type: reference
native: UIWindow.keyWindow
---

# `UIWindow`: `isKeyWindow` property

The **`isKeyWindow`** property indicates whether this window is the [key window](../ui-window.md#key-window): input events without a location, such as keyboard input, go to it.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | This window is the key window |
| `false` | It isn't |

- Read-only; assigning to it throws `TypeError`.
- It is `true` after [`makeKeyAndVisible()`](makekeyandvisible.md) is called.
- When it changes, [`becomekey`](becomekey-event.md) or [`resignkey`](resignkey-event.md) fires.
- Accessing it before the window has been placed in a scene throws `TypeError`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  console.log(win.isKeyWindow);
  win.makeKeyAndVisible();
  console.log(win.isKeyWindow);
});
```

**Result**: First prints `false`, then `true`. The first value is **not verified in the simulator**.

## Corresponding iOS API

`UIWindow.keyWindow` (`isKeyWindow` in Swift).

## See also

- [`makeKeyWindow()`](makekeywindow.md)
