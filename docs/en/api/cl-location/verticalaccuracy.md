---
type: reference
native: CLLocation.verticalAccuracy
---

# `CLLocation`: `verticalAccuracy` property

The **`verticalAccuracy`** property is the error of the altitude.

## Value

A number (meters), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Not less than 0; the smaller the number, the more accurate.
- `null` means the altitude is invalid; in that case [`altitude`](altitude.md) and [`ellipsoidalAltitude`](ellipsoidalaltitude.md) are also `null`.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.verticalAccuracy !== null && here.altitude !== null) {
    console.log('Altitude ' + here.altitude.toFixed(0) + ' ± ' + here.verticalAccuracy.toFixed(0) + ' m');
  }
}, () => {});
```

**Effect**: When the altitude was measured, prints the altitude and its error, such as `Altitude 45 ± 3 m`. **Not verified in the simulator.**

## Corresponding iOS API

`CLLocation.verticalAccuracy`. In ObjC it is negative when invalid; here it is `null`.

## See also

- [`null` in a location](../cl-location.md#null-in-a-location)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
