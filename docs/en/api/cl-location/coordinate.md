---
type: reference
native: CLLocation.coordinate
---

# `CLLocation`: `coordinate` property

The **`coordinate`** property is the latitude and longitude of this location.

## Value

A [`CLLocationCoordinate2D`](../cl-location-coordinate-2d.md), in degrees.

- Read-only; assigning to it throws `TypeError`: `coordinate is read-only: locations are values, they cannot be changed`.
- Always has a value; never `null`.
- When [`horizontalAccuracy`](horizontalaccuracy.md) is `null`, this latitude and longitude are invalid; do not use them.
- Each read on the same `CLLocation` gives the same object.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.horizontalAccuracy !== null) {
    console.log(here.coordinate.latitude.toFixed(5), here.coordinate.longitude.toFixed(5));
  }
}, () => {});
```

**Effect**: When a valid location is obtained, prints the latitude and longitude, each to five decimal places.

## Corresponding iOS API

`CLLocation.coordinate`.

## See also

- [`CLLocationCoordinate2D`](../cl-location-coordinate-2d.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
