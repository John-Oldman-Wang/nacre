---
type: reference
native: UIScreen.currentEDRHeadroom
---

# `UIScreen`: `currentEDRHeadroom` property

The **`currentEDRHeadroom`** property is how many times brighter than normal white the brightest white the screen can show right now is. Brightness beyond normal white is used to show HDR content.

## Value

A number with no unit: a multiple of brightness, no less than `1`.

- Read-only. Assigning to it throws `TypeError`.
- `1` means there is no headroom right now, and HDR content is shown at normal brightness. On the iPhone Air simulator (iOS 27.2) it is `1`.
- It changes with the screen's state and whether HDR content is being shown right now, and never exceeds [`potentialEDRHeadroom`](potentialedrheadroom.md).
- No change notification: iOS does not post notifications for this value; read it when you need it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentEDRHeadroom);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `1`.

## Corresponding iOS API

`UIScreen.currentEDRHeadroom`.

## See also

- [`potentialEDRHeadroom`](potentialedrheadroom.md)
