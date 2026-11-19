---
type: reference
native: CLLocation.course
---

# `CLLocation`: `course` property

The **`course`** property is the direction in which the device is moving.

## Value

A number (degrees), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Due north is 0, increasing clockwise; due east is 90. The range is 0 to 359.9.
- `null` when the system cannot measure the direction, which is the case when the device is not moving. In that case [`courseAccuracy`](courseaccuracy.md) is also `null`.
- It is the direction of movement, not the direction the device is facing.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.course === null ? 'Not moving' : 'Heading ' + latest.course.toFixed(0) + ' degrees');
});
manager.startUpdatingLocation();
```

**Effect**: Prints one line for each new location: the direction (in degrees) while moving, or `Not moving` when not moving. The moving case is **not verified in the simulator**.

## Corresponding iOS API

`CLLocation.course`. In ObjC it is negative when invalid; here it is `null`.

## See also

- [`speed`](speed.md): the speed of movement
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
