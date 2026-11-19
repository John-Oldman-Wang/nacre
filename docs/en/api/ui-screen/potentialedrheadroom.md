---
type: reference
native: UIScreen.potentialEDRHeadroom
---

# `UIScreen`: `potentialEDRHeadroom` property

The **`potentialEDRHeadroom`** property is how many times brighter than normal white the brightest white this screen can show at most is.

## Value

A number with no unit: a multiple of brightness, no less than `1`.

- Read-only. Assigning to it throws `TypeError`.
- `1` means this screen cannot show content brighter than normal white. On the iPhone Air simulator (iOS 27.2) it is `1`.
- It is never less than [`currentEDRHeadroom`](currentedrheadroom.md).
- According to the iOS documentation, it may change when the status of reference display mode changes; you can read it again in [`referencedisplaymodestatuschange`](referencedisplaymodestatuschange-event.md). **Not verified in the simulator.**

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.potentialEDRHeadroom);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `1`.

## Corresponding iOS API

`UIScreen.potentialEDRHeadroom`.

## See also

- [`currentEDRHeadroom`](currentedrheadroom.md)
