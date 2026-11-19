---
type: reference
native: UIScene.session
---

# `UIWindowScene`: `session` property

The **`session`** property is this scene's session, a [`UISceneSession`](../ui-scene-session.md): the scene's persistent identity.

## Value

A [`UISceneSession`](../ui-scene-session.md).

- Read-only. Assigning to it throws `TypeError`.
- Determined by the system. Every read on the same scene returns the same object.
- When the system destroys the scene and creates a new scene object, the new scene's `session` represents the same UI: `persistentIdentifier` is the same, and the data stored in `userInfo` is still there. **Not verified in the simulator.**

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;
  console.log(session === e.scene.session);
  console.log(session.role);
});
```

**Result**: logs `true` and then `UIWindowSceneSessionRoleApplication`.

## Corresponding iOS API

`UIScene.session`.

## See also

- [`UISceneSession`](../ui-scene-session.md)
