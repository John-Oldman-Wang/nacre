---
type: reference
native: UIWindowDidResignKeyNotification
---

# `UIWindow`: `resignkey` event

The **`resignkey`** event fires when the window stops being the [key window](../ui-window.md#key-window): `isKeyWindow` becomes `false`.

## Syntax

```
win.addEventListener('resignkey', (event) => { })
```

## Event object

`Event`. It has only two fields, `type` and `target`; `target` is the window.

Not cancelable.

## When it fires

- When another window becomes the key window, the previous key window fires it.
- The firing of this event is **not verified in the simulator**.
- The callback runs a little later; see [How the runtime works](../how-it-works.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.addEventListener('resignkey', () => {
    console.log('no longer the key window');
  });
  win.makeKeyAndVisible();

  const overlay = new UIWindow(e.scene);
  overlay.rootViewController = new UIViewController();
  overlay.makeKeyAndVisible();
});
```

**Effect**: After `overlay` becomes the key window, the console prints `no longer the key window`. **Not verified in the simulator.**

## Corresponding iOS API

`UIWindowDidResignKeyNotification`.

## See also

- [`becomekey`](becomekey-event.md)
