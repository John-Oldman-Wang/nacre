---
type: reference
native: CLLocationCoordinate2D.latitude
---

# `CLLocationCoordinate2D`: `latitude` property

The **`latitude`** property is the latitude.

## Value

A number (degrees). North is positive, south is negative. Locations from the system fall between -90 and 90; coordinates you create with `new` are not range-checked.

- Read-only. Assigning to it throws `TypeError`: `latitude is read-only: locations are values, they cannot be changed`.
- The value is the one given at creation and never changes.

## Examples

```js
const c = new CLLocationCoordinate2D(-33.8688, 151.2093);
console.log(c.latitude < 0 ? 'Southern Hemisphere' : 'Northern Hemisphere');
```

**Result**: logs `Southern Hemisphere`.

## Corresponding iOS API

`CLLocationCoordinate2D.latitude`.

## See also

- [`longitude`](longitude.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
