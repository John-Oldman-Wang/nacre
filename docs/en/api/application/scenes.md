---
type: reference
native: UIApplication.connectedScenes
---

# `Application`: `scenes` property

The **`scenes`** property is the currently connected scenes.

## Value

A read-only array of [`UIWindowScene`](../ui-window-scene.md).

- Read-only. Assigning to it throws `TypeError`.
- An empty array while the top level of `main.js` runs: the system creates scenes only after the script finishes. So don't read `application.scenes[0]` at the top level; you'll get `undefined`.
- Scenes the system uses internally aren't included, such as the scene the system creates when the keyboard appears.
- The same scene is the same JS object on every read, so it can be compared with `===`. In the `sceneconnect` callback, `e.scene` and the first element here are the same object.
- Fires [`sceneconnect`](sceneconnect-event.md) and [`scenedisconnect`](scenedisconnect-event.md) when it changes.

## Examples

```js
console.log(application.scenes.length);

application.addEventListener('sceneconnect', (e) => {
  console.log(application.scenes[0] === e.scene);
});
```

**Result**: the first line prints `0`. After the scene connects, the callback prints `true`.

## Corresponding iOS API

`UIApplication.connectedScenes`. Natively it's a set; here it's an array.

## See also

- [`sceneconnect`](sceneconnect-event.md)
