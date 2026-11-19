---
type: reference
native: UIWindowDidBecomeVisibleNotification
---

# `UIWindow`: `becomevisible` event

The **`becomevisible`** event fires when the window goes from hidden to shown: `isHidden` becomes `false`.

## Syntax

```
win.addEventListener('becomevisible', (event) => { })
```

## Event object

`Event`. It has only two fields, `type` and `target`; `target` is the window.

Not cancelable.

## When it fires

- Fires when [`makeKeyAndVisible()`](../ui-window/makekeyandvisible.md) is called, followed by [`becomekey`](becomekey-event.md).
- Fires when `isHidden` is set from `true` to `false`. **Not verified in the simulator.**
- **Register the listener before `makeKeyAndVisible()`.** Listeners registered afterward don't receive events that have already fired.
- The callback doesn't run synchronously at the moment of the change; it runs a little later. See [How the runtime works](../how-it-works.md). Properties read in the callback have their values at the time the callback runs. Verified by testing: in this callback `isKeyWindow` is already `true`, because by then the window has also become the key window.
- The event only means the window is shown. A view controller's content can be added before `makeKeyAndVisible()` is called; there is no need to wait for this event.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = new UIViewController();
  win.addEventListener('becomevisible', () => {
    console.log('window shown, isHidden =', win.isHidden);
  });
  win.makeKeyAndVisible();
});
```

**Effect**: The console prints `window shown, isHidden = false`.

## Corresponding iOS API

`UIWindowDidBecomeVisibleNotification`.

## See also

- [`becomehidden`](becomehidden-event.md)
