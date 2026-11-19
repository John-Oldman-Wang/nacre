---
type: reference
native: UISceneSession.userInfo
---

# `UISceneSession`: `userInfo` property

The **`userInfo`** property holds the app's own data, saved by the system.

## Value

A plain object, or `null`.

- Readable and writable.
- The default is **not verified in the simulator**.
- Writing `null` or a value that isn't a plain object clears it.
- Values can only be strings, numbers, booleans, arrays, and plain objects. How the system handles a `null` inside the value is **not verified in the simulator**.
- After writing, reading it within the same run returns what was written.
- Whether it survives the scene disconnecting and reconnecting, or the app being terminated and reopened, is **not verified in the simulator**.
- No event fires when it changes: only the app's code changes it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;
  const info = session.userInfo;
  if (info && info.kind === 'mailDetail') {
    console.log('was viewing mail', info.mailId);
  } else {
    console.log('no record, showing home');
  }
  session.userInfo = { kind: 'mailDetail', mailId: 42 };
});
```

**Effect**: The first run prints `no record, showing home`. After writing, reading `session.userInfo` within the same run returns what was written.

## Corresponding iOS API

`UISceneSession.userInfo`.

## See also

- [Creating windows and handling scenes](../../guides/scenes-and-windows.md#where-data-goes)
