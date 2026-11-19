---
type: reference
native: CLLocationCoordinate2D.longitude
---

# `CLLocationCoordinate2D`: `longitude` property

The **`longitude`** property is the longitude.

## Value

A number (degrees). East is positive, west is negative. Locations from the system fall between -180 and 180; coordinates you create with `new` are not range-checked.

- Read-only. Assigning to it throws `TypeError`: `longitude is read-only: locations are values, they cannot be changed`.
- The value is the one given at creation and never changes.

## Examples

```js
const c = new CLLocationCoordinate2D(40.7128, -74.006);
console.log(c.longitude < 0 ? 'West' : 'East');
```

**Result**: logs `West`.

## Corresponding iOS API

`CLLocationCoordinate2D.longitude`.

## See also

- [`latitude`](latitude.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
