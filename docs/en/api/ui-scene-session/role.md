---
type: reference
native: UISceneSession.role
---

# `UISceneSession`: `role` property

The **`role`** property is what the scene is for.

## Value

A string whose value is the native constant verbatim. An ordinary app interface is `'UIWindowSceneSessionRoleApplication'`.

- Read-only; assigning to it throws `TypeError`.
- Never changes, so there is no change notification.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.session.role === 'UIWindowSceneSessionRoleApplication');
});
```

**Result**: Prints `true`.

## Corresponding iOS API

`UISceneSession.role`. The constant keeps its prefix and is written verbatim.

## See also

- [`UISceneSession`](../ui-scene-session.md)
