---
type: reference
native: UIWindowDidBecomeHiddenNotification
---

# `UIWindow`: `becomehidden` event

The **`becomehidden`** event fires when the window goes from shown to hidden: `isHidden` becomes `true`.

## Syntax

```
win.addEventListener('becomehidden', (event) => { })
```

## Event object

`Event`. It has only two fields, `type` and `target`; `target` is the window.

Not cancelable.

## When it fires

- Fires when `isHidden` of a shown window is set to `true`.
- The firing of this event is **not verified in the simulator**.
- The callback runs a little later; see [How the runtime works](../how-it-works.md).

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.makeKeyAndVisible();

  win.addEventListener('becomehidden', () => {
    console.log('window hidden');
  });
  win.isHidden = true;
});
```

**Effect**: The window and everything in it disappear from the screen, and the console prints `window hidden`. **Not verified in the simulator.**

## Corresponding iOS API

`UIWindowDidBecomeHiddenNotification`.

## See also

- [`becomevisible`](becomevisible-event.md)
