---
type: reference
native: UIWindow.windowScene
---

# `UIWindow`: `windowScene` property

The **`windowScene`** property is the scene the window is in.

## Value

A [`UIWindowScene`](../ui-window-scene.md), or `null`.

- Readable and writable.
- The default is the scene passed to the constructor; if none was passed, `null`.
- For a window created with `new UIWindow()`, the system window is created and placed in the scene the first time this is assigned. After that it is used the same way as a window created with `new UIWindow(scene)`.
- Reading it returns the same object that was written, so it can be compared with `===`.
- No event fires when it changes: it only changes when the app itself assigns it.
- Two cases are **not verified in the simulator**: moving a window that is already in a scene to another scene, and writing `null`.

### Invalid values

Writing something that isn't a scene throws `TypeError`, with the same message as the equivalent error on [`rootViewController`](rootviewcontroller.md), naming `UIWindowScene` as the required class. The property keeps its value.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const later = new UIWindow();
  console.log(later.windowScene);

  later.windowScene = e.scene;
  console.log(later.windowScene === e.scene);
});
```

**Result**: When the scene connects, prints `null` and then `true`.

## Corresponding iOS API

`UIWindow.windowScene`.

## See also

- [`UIWindow()`](constructor.md): the two ways to create a window
