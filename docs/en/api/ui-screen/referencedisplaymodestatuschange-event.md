---
type: reference
native: UIScreenReferenceDisplayModeStatusDidChangeNotification
---

# `UIScreen`: `referencedisplaymodestatuschange` event

The **`referencedisplaymodestatuschange`** event fires when the status of the screen's reference display mode changes.

## Syntax

```
screen.addEventListener('referencedisplaymodestatuschange', (event) => { })
```

## Event object

`Event`. `type` is `'referencedisplaymodestatuschange'` and `target` is this screen. The event object does not carry the new value; read the screen's properties in the callback. Not cancelable; `event.cancelable` is `false`.

## When it fires

Fires when [`referenceDisplayModeStatus`](referencedisplaymodestatus.md) changes: the user turns reference display mode on or off in system settings, or overheating or low battery temporarily prevents accurate display. Screens that do not support reference display mode never fire it. **Not verified in the simulator.**

- Callbacks do not run synchronously at the moment of the change but a little later; see [How the runtime works](../how-it-works.md#events).
- There is no overhead when there are no listeners.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  screen.addEventListener('referencedisplaymodestatuschange', () => {
    console.log(screen.referenceDisplayModeStatus, screen.potentialEDRHeadroom);
  });
});
```

**Effect**: when the status changes, logs the new status and the maximum possible brightness headroom. **Not verified in the simulator.**

## Corresponding iOS API

`UIScreenReferenceDisplayModeStatusDidChangeNotification`.

## See also

- [`referenceDisplayModeStatus`](referencedisplaymodestatus.md)
- [`potentialEDRHeadroom`](potentialedrheadroom.md)
