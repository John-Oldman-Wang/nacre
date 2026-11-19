---
type: reference
native: UIScreen.calibratedLatency
---

# `UIScreen`: `calibratedLatency` property

The **`calibratedLatency`** property is the latency of this screen's display hardware.

## Value

A number, in seconds.

- Read-only. Assigning to it throws `TypeError`.
- `0` when the user has not calibrated display latency. On the iPhone Air simulator (iOS 27.2) it is `0`.
- No change notification.

Use it when doing your own video playback and aligning sound with picture. Ordinary apps do not need it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.calibratedLatency);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `0`.

## Corresponding iOS API

`UIScreen.calibratedLatency`.

## See also

- [`UIScreen`](../ui-screen.md)
