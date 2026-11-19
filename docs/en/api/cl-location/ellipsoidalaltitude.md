---
type: reference
native: CLLocation.ellipsoidalAltitude
---

# `CLLocation`: `ellipsoidalAltitude` property

The **`ellipsoidalAltitude`** property is the altitude of this location relative to the WGS 84 ellipsoid. This is the height satellite positioning measures directly.

## Value

A number (meters), or `null`.

- Read-only; assigning to it throws `TypeError`.
- `null` when the system cannot measure altitude, together with [`altitude`](altitude.md) and [`verticalAccuracy`](verticalaccuracy.md).
- The case where altitude has a value is **not verified in the simulator**.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.altitude !== null && here.ellipsoidalAltitude !== null) {
    console.log('The two altitudes differ by ' + (here.ellipsoidalAltitude - here.altitude).toFixed(1) + ' m');
  }
}, () => {});
```

**Effect**: When the altitude was measured, prints the difference between the two altitudes (in meters).

## Corresponding iOS API

`CLLocation.ellipsoidalAltitude`.

## See also

- [`altitude`](altitude.md): altitude relative to mean sea level
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
