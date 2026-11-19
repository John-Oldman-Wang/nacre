---
type: reference
native: UIScreen.maximumFramesPerSecond
---

# `UIScreen`: `maximumFramesPerSecond` property

The **`maximumFramesPerSecond`** property is the maximum number of frames per second this screen refreshes.

## Value

An integer, in frames per second.

- Read-only. Assigning to it throws `TypeError`.
- On the iPhone Air simulator (iOS 27.2) it is `60`. On a device it is the screen hardware's limit; **not verified on a device**.
- No change notification.

The frame rate requested by [`CADisplayLink`](../ca-display-link.md) never exceeds it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.maximumFramesPerSecond);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `60`.

## Corresponding iOS API

`UIScreen.maximumFramesPerSecond`.

## See also

- [`CADisplayLink`](../ca-display-link.md)
- [`CAFrameRateRange`](../ca-frame-rate-range.md)
