---
type: reference
native: UIScreen.mirroredScreen
---

# `UIScreen`: `mirroredScreen` property

The **`mirroredScreen`** property is the screen this screen is mirroring.

## Value

A [`UIScreen`](../ui-screen.md) or `null`.

- Read-only. Assigning to it throws `TypeError`.
- `null` when not mirroring another screen. The phone's own screen reads `null`.
- When an external display mirrors the phone's screen, the `mirroredScreen` of the external display's screen is the phone's screen. This case is **not verified in the simulator**.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.mirroredScreen);
});
```

**Result**: logs `null`.

## Corresponding iOS API

`UIScreen.mirroredScreen`.

## See also

- [`UIScreen`](../ui-screen.md)
