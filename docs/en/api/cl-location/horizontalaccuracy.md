---
type: reference
native: CLLocation.horizontalAccuracy
---

# `CLLocation`: `horizontalAccuracy` property

The **`horizontalAccuracy`** property is the error radius of the latitude and longitude: the true location is within a circle centered on [`coordinate`](coordinate.md) with this number as its radius.

## Value

A number (meters), or `null`.

- Read-only; assigning to it throws `TypeError`.
- The smaller the number, the more accurate. Not less than 0.
- `null` means the latitude and longitude of this location are invalid; do not use `coordinate`.
- [`desiredAccuracy`](../cl-location-manager/desiredaccuracy.md) is the accuracy you would like; how accurate the system actually is, this number tells you.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  const accuracy = here.horizontalAccuracy;
  if (accuracy === null) {
    console.log('Latitude and longitude are invalid');
  } else if (accuracy > 200) {
    console.log('Error too large: ' + accuracy + ' m');
  } else {
    console.log('Usable, error ' + accuracy + ' m');
  }
}, () => {});
```

**Effect**: Prints one of the three lines depending on the error.

## Corresponding iOS API

`CLLocation.horizontalAccuracy`. In ObjC it is negative when invalid; here it is `null`.

## See also

- [`null` in a location](../cl-location.md#null-in-a-location)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
