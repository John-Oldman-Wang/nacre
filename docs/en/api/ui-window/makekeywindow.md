---
type: reference
native: "-[UIWindow makeKeyWindow]"
---

# `UIWindow`: `makeKeyWindow()` method

The **`makeKeyWindow()`** method makes this window the [key window](../ui-window.md#key-window) without changing whether it is shown.

## Syntax

```
makeKeyWindow()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The window hasn't been placed in a scene yet: `makeKeyWindow(): this object is not connected to a scene yet, so no native object exists`.

## Description

- With multiple windows, use it to choose which one is the key window. An app with only one window doesn't need to call it.
- Calling it on a window whose [`canBecomeKeyWindow`](canbecomekeywindow.md) is `false` has no effect.
- When the window becomes the key window, it fires [`becomekey`](becomekey-event.md); the previous key window fires [`resignkey`](resignkey-event.md).
- The effect of the whole method is **not verified in the simulator**.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const overlay = new UIWindow(e.scene);
  overlay.rootViewController = new UIViewController();
  overlay.isHidden = false;
  overlay.makeKeyWindow();
});
```

**Effect**: `overlay` is shown and becomes the key window. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIWindow makeKeyWindow]`. `becomeKeyWindow` and `resignKeyWindow` are what the system uses to notify the window, and have no corresponding methods.

## See also

- [`makeKeyAndVisible()`](makekeyandvisible.md)
