---
type: reference
native: CLLocation.courseAccuracy
---

# `CLLocation`: `courseAccuracy` property

The **`courseAccuracy`** property is the error of the direction of movement.

## Value

A number (degrees), or `null`.

- Read-only; assigning to it throws `TypeError`.
- Not less than 0.
- `null` means the direction is invalid; in that case [`course`](course.md) is also `null`.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.course !== null && here.courseAccuracy !== null) {
    console.log(here.course + ' ± ' + here.courseAccuracy + ' degrees');
  }
}, () => {});
```

**Effect**: When the direction was measured, prints the direction and its error (in degrees). **Not verified in the simulator.**

## Corresponding iOS API

`CLLocation.courseAccuracy`. In ObjC it is negative when invalid; here it is `null`.

## See also

- [`course`](course.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
