---
type: reference
native: CLLocation
status: partial
---

# `CLLocation`

**`CLLocation`** represents a location measured by the system: latitude and longitude, altitude, the error of each measurement, speed, direction of movement, and when the location was measured.

Locations can only be given by the system and are obtained from [`CLLocationManager`](cl-location-manager.md). A location is a read-only value: its fields cannot be changed, and fields cannot be added.

Install `@nacrejs/core-location` first; for how, see [`CLLocationManager`](cl-location-manager.md#installation), or [Core and capability packages](capabilities.md).

**Inheritance**: `CLLocation` does not inherit from any native class.

## Constructor

It cannot be created with `new`. `new CLLocation()` throws `TypeError`:

```
Illegal constructor: a CLLocation comes from CLLocationManager (location, requestLocation(), or the locationupdate event)
```

Locations come from these three places:

- [`manager.location`](cl-location-manager/location.md): the most recent location.
- [`manager.requestLocation()`](cl-location-manager/requestlocation.md): a Promise that fulfills with a location.
- The `locations` of the [`locationupdate`](cl-location-manager/locationupdate-event.md) event.

## Instance properties

All properties are readable and not writable.

| Property | Description |
| --- | --- |
| [`coordinate`](cl-location/coordinate.md) <small>read-only</small> | Latitude and longitude |
| [`horizontalAccuracy`](cl-location/horizontalaccuracy.md) <small>read-only</small> | The error radius of the latitude and longitude, in meters |
| [`altitude`](cl-location/altitude.md) <small>read-only</small> | Altitude relative to mean sea level, in meters |
| [`ellipsoidalAltitude`](cl-location/ellipsoidalaltitude.md) <small>read-only</small> | Altitude relative to the WGS 84 ellipsoid, in meters |
| [`verticalAccuracy`](cl-location/verticalaccuracy.md) <small>read-only</small> | The error of the altitude, in meters |
| [`speed`](cl-location/speed.md) <small>read-only</small> | Speed of movement, in meters per second |
| [`speedAccuracy`](cl-location/speedaccuracy.md) <small>read-only</small> | The error of the speed, in meters per second |
| [`course`](cl-location/course.md) <small>read-only</small> | Direction of movement, in degrees |
| [`courseAccuracy`](cl-location/courseaccuracy.md) <small>read-only</small> | The error of the direction, in degrees |
| [`timestamp`](cl-location/timestamp.md) <small>read-only</small> | When this location was measured |
| [`sourceInformation`](cl-location/sourceinformation.md) <small>read-only</small> | Whether this location is simulated, and whether it comes from an external accessory |

## `null` in a location

Eight measurements are `null` when the system cannot measure them:

| Measurement that is `null` | What it means |
| --- | --- |
| `horizontalAccuracy` | The latitude and longitude of this location are invalid; do not use `coordinate` |
| `verticalAccuracy`, `altitude`, `ellipsoidalAltitude` | The altitude cannot be measured. These three are always `null` together or have values together |
| `speed`, `speedAccuracy` | The speed cannot be measured |
| `course`, `courseAccuracy` | The direction cannot be measured. This is the case when the device is not moving |

Check whether these measurements are `null` before using them. The remaining ones (`coordinate`, `timestamp`) always have values.

## Locations are values

- Fields cannot be changed and fields cannot be added; writing throws `TypeError`. For changing an existing field, the error is `<field name> is read-only: locations are values, they cannot be changed`.
- Each read of [`manager.location`](cl-location-manager/location.md) gives a new `CLLocation` object. To compare whether two locations are the same, compare their fields; do not use `===`.
- On the same `CLLocation`, each read of `coordinate` gives the same object.
- Each read of `timestamp` gives a new `Date`. Modifying the `Date` you read does not affect the location.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  console.log(here.coordinate.latitude, here.coordinate.longitude);
  if (here.altitude === null) {
    console.log('No altitude');
  } else {
    console.log('Altitude ' + here.altitude.toFixed(1) + ' m');
  }
}, (err) => {
  console.log('Could not get it: ' + err.name);
});
```

**Effect**: When a location is obtained, prints the latitude and longitude first, then the altitude (in meters, to one decimal place) or "No altitude". A location set by command in the simulator has no altitude, so it prints "No altitude". Without authorization, prints `Could not get it: NotAllowedError`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `location.coordinate` | `location.coordinate` |
| `location.horizontalAccuracy < 0` (invalid) | `location.horizontalAccuracy === null` |
| `location.speed < 0`, `location.course < 0` (invalid) | `location.speed === null`, `location.course === null` |
| `location.timestamp` (`NSDate`) | `location.timestamp` (`Date`) |
| `location.sourceInformation.isSimulatedBySoftware` | `location.sourceInformation?.isSimulatedBySoftware` |

## See also

- [`CLLocationManager`](cl-location-manager.md): where locations come from
- [`CLLocationCoordinate2D`](cl-location-coordinate-2d.md): the type of `coordinate`
- [Getting the user's location](../guides/get-location.md#pick-out-usable-locations): picking usable locations by error and time
