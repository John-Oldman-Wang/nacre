---
type: reference
native: UIScreen.preferredMode
---

# `UIScreen`: `preferredMode` property

The **`preferredMode`** property is the most suitable display mode for this screen.

## Value

A [`UIScreenMode`](../ui-screen-mode.md) or `null`.

- Read-only. Assigning to it throws `TypeError`.
- On the iPhone Air simulator (iOS 27.2) it reads a `UIScreenMode`. When it is `null` is **not verified in the simulator**.
- No change notification.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.preferredMode !== null);
});
```

**Result**: logs `true`.

## Corresponding iOS API

`UIScreen.preferredMode`.

## See also

- [`currentMode`](currentmode.md)
