---
type: reference
native: UIWindow.rootViewController
---

# `UIWindow`: `rootViewController` property

The **`rootViewController`** property is the window's root view controller. The window displays its `view`; it is the only entry point for the window's content.

## Value

A [`UIViewController`](../ui-view-controller.md), or `null`.

- Readable and writable.
- The default is `null`: the window has no content and the screen is black, with no error. **Not verified in the simulator.**
- Reading it returns the same object that was written, so it can be compared with `===`.
- Assigning a new view controller replaces the screen content with the new one, without a transition animation. **Not verified in the simulator.**
- The previous root view controller is no longer kept by the window. If no variable holds it, it and its views are collected. **Not verified in the simulator.**
- Writing `null` clears the window's content. **Not verified in the simulator.**
- Accessing it before the window has been placed in a scene throws `TypeError: rootViewController: this object is not connected to a scene yet, so no native object exists`.
- No event fires when it changes: it only changes when the app itself assigns it.

Switching the root view controller fits cases where the whole interface changes, such as going from the sign-in screen to the main screen. For navigation with a back button, use a [`UINavigationController`](../ui-navigation-controller.md) as the root view controller; to cover the screen temporarily with a view controller, use [modal presentation](../ui-view-controller.md#modal-presentation).

### Invalid values

- Writing a native object that isn't a view controller throws `TypeError: rootViewController needs a UIViewController or null`.
- Writing something that isn't a native object (a string, a number, a plain object) throws `TypeError: rootViewController needs a native object or null, got "home"` (what follows `got` is the value received).

On error, the property keeps its value.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const next = new UIViewController();
  next.view.backgroundColor = 'systemBlue';
  win.rootViewController = next;
  console.log(win.rootViewController === next);
});
```

**Effect**: The screen shows the blue `next`. The console prints `true`.

## Corresponding iOS API

`UIWindow.rootViewController`.

## See also

- [`UIViewController`](../ui-view-controller.md)
