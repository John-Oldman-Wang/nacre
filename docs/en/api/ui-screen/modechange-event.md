---
type: reference
native: UIScreenModeDidChangeNotification
---

# `UIScreen`: `modechange` event

The **`modechange`** event fires when the screen's display mode changes.

## Syntax

```
screen.addEventListener('modechange', (event) => { })
```

## Event object

`Event`. `type` is `'modechange'` and `target` is this screen. The event object does not carry the new value; read the screen's properties in the callback. Not cancelable; `event.cancelable` is `false`.

## When it fires

Fires when [`currentMode`](currentmode.md) changes, which usually happens when an external display changes resolution. The phone's own screen has only one mode and never fires it. **Not verified in the simulator.**

- Callbacks do not run synchronously at the moment of the change but a little later; see [How the runtime works](../how-it-works.md#events).
- There is no overhead when there are no listeners.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  screen.addEventListener('modechange', () => {
    const mode = screen.currentMode;
    if (mode !== null) console.log(mode.size.width, mode.size.height);
  });
});
```

**Effect**: when the screen changes display mode, logs the new mode's size in pixels. **Not verified in the simulator.**

## Corresponding iOS API

`UIScreenModeDidChangeNotification`.

## See also

- [`currentMode`](currentmode.md)
- [`UIScreenMode`](../ui-screen-mode.md)
