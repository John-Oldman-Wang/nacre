---
type: reference
native: UIScreenCapturedDidChangeNotification
---

# `UIScreen`: `capturedchange` event

The **`capturedchange`** event fires when the screen starts or stops being recorded, cast, or mirrored.

## Syntax

```
screen.addEventListener('capturedchange', (event) => { })
```

## Event object

`Event`. `type` is `'capturedchange'` and `target` is this screen. The event object does not carry the new value; read the screen's properties in the callback. Not cancelable; `event.cancelable` is `false`.

## When it fires

Fires when [`isCaptured`](iscaptured.md) changes: the user starts or stops screen recording, or starts or stops AirPlay and mirroring. **Not verified in the simulator.** Screenshots do not fire it.

- Callbacks do not run synchronously at the moment of the change but a little later; see [How the runtime works](../how-it-works.md#events).
- There is no overhead when there are no listeners.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // A layer over the content, shown while recording
  const cover = new UIView();
  cover.backgroundColor = 'systemBackground';
  cover.frame = screen.bounds;
  cover.isHidden = !screen.isCaptured;
  page.view.addSubview(cover);

  screen.addEventListener('capturedchange', () => {
    cover.isHidden = !screen.isCaptured;
  });
});
```

**Effect**:
- When not recording, `cover` is hidden and the page shows normally.
- After the user starts recording from Control Center, `cover` appears and covers the page's content. The content is not visible in the recording. **Not verified in the simulator.**
- After recording stops, `cover` is hidden again. **Not verified in the simulator.**

Set it once from `isCaptured` at launch: if recording started before the app launched, `capturedchange` does not fire again.

## Corresponding iOS API

`UIScreenCapturedDidChangeNotification`.

## See also

- [`isCaptured`](iscaptured.md)
