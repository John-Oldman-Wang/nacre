---
type: reference
native: CLLocationCoordinate2D
---

# `CLLocationCoordinate2D`

**`CLLocationCoordinate2D`** represents the latitude and longitude of a point on Earth, in degrees. North latitudes and east longitudes are positive; south latitudes and west longitudes are negative.

It is a read-only value: its fields cannot be changed and no fields can be added. The `coordinate` of a [`CLLocation`](cl-location.md) is one of these; you can also create one yourself with `new`.

Install `@nacrejs/core-location` first. See [`CLLocationManager`](cl-location-manager.md#installation) for how, or [Core and capability packages](capabilities.md).

**Inheritance**: `CLLocationCoordinate2D` does not inherit from any native class.

## Constructor

[`CLLocationCoordinate2D()`](cl-location-coordinate-2d/constructor.md)

Creates a coordinate from a latitude and a longitude.

## Instance properties

| Property | Description |
| --- | --- |
| [`latitude`](cl-location-coordinate-2d/latitude.md) <small>read-only</small> | Latitude, in degrees |
| [`longitude`](cl-location-coordinate-2d/longitude.md) <small>read-only</small> | Longitude, in degrees |

## Examples

```js
const c = new CLLocationCoordinate2D(39.9042, 116.4074);
console.log(JSON.stringify(c));
console.log(String(c));
```

**Result**

- The first line logs `{"latitude":39.9042,"longitude":116.4074}`.
- The second line logs `CLLocationCoordinate2D(39.9042, 116.4074)`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `CLLocationCoordinate2DMake(lat, lon)` | `new CLLocationCoordinate2D(lat, lon)` |
| `coordinate.latitude`, `coordinate.longitude` | `coordinate.latitude`, `coordinate.longitude` |

In ObjC it is a struct.

## See also

- [`CLLocation`](cl-location.md): the `coordinate` of a location
- [Structs](structs.md): other read-only value types
