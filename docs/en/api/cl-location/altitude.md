---
type: reference
native: CLLocation.altitude
---

# `CLLocation`: `altitude` property

The **`altitude`** property is the altitude of this location, relative to mean sea level.

## Value

A number (meters), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Positive above sea level and negative below.
- `null` when the system cannot measure altitude. In that case [`ellipsoidalAltitude`](ellipsoidalaltitude.md) and [`verticalAccuracy`](verticalaccuracy.md) are also `null`: these three are always `null` together or have values together.
- A location set by command in the simulator has no altitude and reads `null`. The case where altitude has a value is **not verified in the simulator**.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.altitude === null) {
    console.log('No altitude');
  } else {
    console.log('Altitude ' + here.altitude.toFixed(1) + ' m');
  }
}, () => {});
```

**Effect**: When the system measured the altitude, prints it (in meters, to one decimal place); when it could not, prints "No altitude".

## Corresponding iOS API

`CLLocation.altitude`. In ObjC, an invalid altitude is indicated by a negative `verticalAccuracy`; here the altitude itself is `null`.

## See also

- [`ellipsoidalAltitude`](ellipsoidalaltitude.md): the other kind of altitude
- [`null` in a location](../cl-location.md#null-in-a-location)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
