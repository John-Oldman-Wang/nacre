---
type: reference
native: CLLocation.speed
---

# `CLLocation`: `speed` property

The **`speed`** property is the speed at which the device is moving.

## Value

A number (meters per second), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Not less than 0.
- `null` when the system cannot measure speed; in that case [`speedAccuracy`](speedaccuracy.md) is also `null`.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  if (latest.speed !== null) {
    console.log((latest.speed * 3.6).toFixed(1) + ' km/h');
  }
});
manager.startUpdatingLocation();
```

**Effect**: Each time there is a new location with a measured speed, prints the speed converted to kilometers per hour. **Not verified in the simulator.**

## Corresponding iOS API

`CLLocation.speed`. In ObjC it is negative when invalid; here it is `null`.

## See also

- [`course`](course.md): the direction of movement
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
