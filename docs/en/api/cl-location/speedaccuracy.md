---
type: reference
native: CLLocation.speedAccuracy
---

# `CLLocation`: `speedAccuracy` property

The **`speedAccuracy`** property is the error of the speed.

## Value

A number (meters per second), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Not less than 0.
- `null` means the speed is invalid; in that case [`speed`](speed.md) is also `null`.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.speed !== null && here.speedAccuracy !== null) {
    console.log(here.speed + ' ± ' + here.speedAccuracy + ' m/s');
  }
}, () => {});
```

**Effect**: When the speed was measured, prints the speed and its error (in meters per second). **Not verified in the simulator.**

## Corresponding iOS API

`CLLocation.speedAccuracy`. In ObjC it is negative when invalid; here it is `null`.

## See also

- [`speed`](speed.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
