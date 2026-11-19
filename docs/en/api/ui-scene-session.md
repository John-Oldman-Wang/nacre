---
type: reference
native: UISceneSession
status: partial
---

# `UISceneSession`

**`UISceneSession`** represents a scene's session: the scene's persistent identity. The system may destroy a scene object and create it again; a session lives longer than the scene object. Use it to tell "this is a new scene" from "an earlier scene has connected again", and to store data belonging to this scene.

Read the session from the scene's [`session`](ui-window-scene/session.md).

**Inheritance**: `EventTarget` → `NSObject` → `UISceneSession`

## Constructor

Can't be created with `new`. `new UISceneSession()` throws `TypeError: Illegal constructor: UISceneSession is created by the runtime, not by new`.

## Instance properties

| Property | Description |
| --- | --- |
| [`role`](ui-scene-session/role.md) <small>read-only</small> | What the scene is for |
| [`persistentIdentifier`](ui-scene-session/persistentidentifier.md) <small>read-only</small> | The unique identifier of this session |
| [`userInfo`](ui-scene-session/userinfo.md) | The app's own data, saved by the system |

None of these properties has a change event: the first two never change, and only the app's code changes `userInfo`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;
  console.log(session.role);
  console.log(typeof session.persistentIdentifier);
});
```

**Result**: Prints `UIWindowSceneSessionRoleApplication` and then `string`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `scene.session.persistentIdentifier` | `scene.session.persistentIdentifier` |
| `scene.session.userInfo = @{ @"kind": @"mailDetail" }` | `scene.session.userInfo = { kind: 'mailDetail' }` |

## See also

- [`UIWindowScene`](ui-window-scene.md)
- [Creating windows and handling scenes](../guides/scenes-and-windows.md#remembering-what-this-scene-was-showing-last-time)
