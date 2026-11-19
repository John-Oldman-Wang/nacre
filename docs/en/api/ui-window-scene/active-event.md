---
type: reference
native: UISceneDidActivateNotification
---

# `UIWindowScene`: `active` event

The **`active`** event fires when this scene has become active and the user can interact.

## Syntax

```
scene.addEventListener('active', (event) => { })
```

## Event object

An `Event`, with only the two fields `type` and `target`; `target` is this scene.

Not cancelable.

## When it fires

- When the user switches back to the App from the Home Screen, it fires after [`foreground`](foreground-event.md). The order of the two is **not verified in the simulator**.
- It also fires when a temporary interruption (such as pulling down Notification Center) ends. **Not verified in the simulator.**
- Whether it also fires after the scene connects at App launch is **not verified in the simulator**.
- The callback runs a little later; see [How the runtime works](../how-it-works.md#events).

Put data that needs refreshing on returning to the foreground here.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('active', () => {
    console.log('Interactive now, refreshing data');
  });
});
```

**Effect**: when the user switches back to the App from the Home Screen, the console logs `Interactive now, refreshing data`.

## Corresponding iOS API

`UISceneDidActivateNotification`, that is, `sceneDidBecomeActive:`.

## See also

- [`inactive`](inactive-event.md)
