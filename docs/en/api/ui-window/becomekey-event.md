---
type: reference
native: UIWindowDidBecomeKeyNotification
---

# `UIWindow`: `becomekey` event

The **`becomekey`** event fires when the window becomes the [key window](../ui-window.md#key-window): `isKeyWindow` becomes `true`.

## Syntax

```
win.addEventListener('becomekey', (event) => { })
```

## Event object

`Event`. It has only two fields, `type` and `target`; `target` is the window.

Not cancelable.

## When it fires

- Fires when [`makeKeyAndVisible()`](makekeyandvisible.md) or [`makeKeyWindow()`](makekeywindow.md) is called.
- **Register the listener before `makeKeyAndVisible()`.**
- The callback runs a little later; see [How the runtime works](../how-it-works.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.addEventListener('becomekey', (event) => {
    console.log(event.type, event.target === win);
  });
  win.makeKeyAndVisible();
});
```

**Effect**: After the window is shown, the console prints `becomekey true`.

## Corresponding iOS API

`UIWindowDidBecomeKeyNotification`.

## See also

- [`resignkey`](resignkey-event.md)
- [`isKeyWindow`](iskeywindow.md)
