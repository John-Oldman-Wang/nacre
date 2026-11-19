---
type: reference
native: CLLocationCoordinate2DMake
---

# `CLLocationCoordinate2D()` constructor

The **`CLLocationCoordinate2D()`** constructor creates a coordinate from a latitude and a longitude.

## Syntax

```
new CLLocationCoordinate2D(latitude, longitude)
```

### Parameters

**`latitude`**

The latitude, a number in degrees. North is positive, south is negative. A string that looks like a number is treated as that number: `'1.5'` is 1.5.

**`longitude`**

The longitude, a number in degrees. East is positive, west is negative. Converted the same way.

The range is not checked: numbers outside -90 to 90 and -180 to 180 still produce a coordinate.

### Return value

A new `CLLocationCoordinate2D`. Its fields are read-only and no fields can be added.

### Exceptions

**`TypeError`**

An argument cannot be converted to a finite number, including when an argument is missing:

- `new CLLocationCoordinate2D('north', 0)`: `CLLocationCoordinate2D latitude must be a finite number, got "north"`
- `new CLLocationCoordinate2D(1)`: `CLLocationCoordinate2D longitude must be a finite number, got undefined`

## Examples

```js
const c = new CLLocationCoordinate2D(39.9042, 116.4074);
console.log(c.latitude, c.longitude);
```

**Result**: logs `39.9042 116.4074`.

## Corresponding iOS API

`CLLocationCoordinate2DMake(latitude, longitude)`.

## See also

- [`latitude`](latitude.md), [`longitude`](longitude.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
