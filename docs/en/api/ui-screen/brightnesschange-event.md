---
type: reference
native: UIScreenBrightnessDidChangeNotification
---

# `UIScreen`: `brightnesschange` event

The **`brightnesschange`** event fires when the screen brightness changes.

## Syntax

```
screen.addEventListener('brightnesschange', (event) => { })
```

## Event object

`Event`. `type` is `'brightnesschange'` and `target` is this screen. The event object does not carry the new value; read the screen's properties in the callback. Not cancelable; `event.cancelable` is `false`.

## When it fires

| Cause | Fires? |
| --- | --- |
| The user adjusts brightness in Control Center or system settings | Fires. **Not verified in the simulator** |
| Auto-brightness adjusts to ambient light | **Not verified in the simulator** |
| The app writes [`brightness`](brightness.md) itself | **Not verified in the simulator**; do not rely on it firing or not firing |

- Callbacks do not run synchronously at the moment of the change but a little later; see [How the runtime works](../how-it-works.md#events).
- There is no overhead when there are no listeners.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  screen.addEventListener('brightnesschange', () => {
    console.log(screen.brightness);
  });
});
```

**Effect**: when the user drags the brightness slider in Control Center, logs the new brightness. **Not verified in the simulator.**

## Corresponding iOS API

`UIScreenBrightnessDidChangeNotification`.

## See also

- [`brightness`](brightness.md)
