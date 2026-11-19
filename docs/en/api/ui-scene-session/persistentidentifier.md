---
type: reference
native: UISceneSession.persistentIdentifier
---

# `UISceneSession`: `persistentIdentifier` property

The **`persistentIdentifier`** property is the unique identifier of this session.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- Decided by the system and never changes, so there is no change notification.
- Stays the same after the scene is destroyed and re-created. **Not verified in the simulator.**

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log('connected:', e.scene.session.persistentIdentifier);
});
application.addEventListener('scenedisconnect', (e) => {
  console.log('disconnected:', e.scene.session.persistentIdentifier);
});
```

**Effect**: When the scene connects, it prints a line `connected: …`. The firing of `scenedisconnect` is **not verified in the simulator**.

## Corresponding iOS API

`UISceneSession.persistentIdentifier`.

## See also

- [`userInfo`](userinfo.md)
