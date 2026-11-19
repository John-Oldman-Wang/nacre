---
type: reference
native: "-[UIWindow makeKeyAndVisible]"
---

# `UIWindow`: `makeKeyAndVisible()` method

The **`makeKeyAndVisible()`** method shows the window and makes it the [key window](../ui-window.md#key-window).

## Syntax

```
makeKeyAndVisible()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The window hasn't been placed in a scene yet: `makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists`.

## Description

- After it runs, the window's `isHidden` becomes `false` and [`isKeyWindow`](iskeywindow.md) becomes `true`, and [`becomevisible`](becomevisible-event.md) and [`becomekey`](becomekey-event.md) fire in turn. **The order of these two events is not verified in the simulator.**
- Register listeners for these two events before calling it.
- This step is the easiest to forget. If it's missing, the window is already in the scene, `rootViewController` reads fine, `isHidden` is `true`, the screen is black, and there is no error at all.
- Whether it can be called before setting [`rootViewController`](rootviewcontroller.md) instead of after is **not verified in the simulator**. Set the root view controller first, then call it.
- The result of calling it again on a window that is already shown is **not verified in the simulator**.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;

  win.addEventListener('becomekey', () => {
    console.log('isKeyWindow =', win.isKeyWindow);
  });
  win.makeKeyAndVisible();
});
```

**Effect**: The screen shows the view controller, and the console prints `isKeyWindow = true`.

## Corresponding iOS API

`-[UIWindow makeKeyAndVisible]`.

## See also

- [`makeKeyWindow()`](makekeywindow.md)
