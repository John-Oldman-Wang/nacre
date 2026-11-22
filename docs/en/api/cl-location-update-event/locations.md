---
type: reference
native: CLLocationUpdateEvent.locations
---

# `CLLocationUpdateEvent`: `locations` property

The **`locations`** property is the locations reported this time.

## Value

An array of [`CLLocation`](../cl-location.md), with at least one.

- Read-only. Assigning to it throws `TypeError`.
- They are ordered from earliest to latest; **the last one is the latest**.
- The system sometimes reports several locations together.
- When the event is created with [`new`](constructor.md) without it, it is an empty array.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude);
});
manager.startUpdatingLocation();
```

**Effect**: each time there is a new location, prints the latitude and longitude of the latest one.

## Corresponding iOS API

The `locations` parameter of `locationManager:didUpdateLocations:`.

## See also

- [`CLLocationUpdateEvent`](../cl-location-update-event.md)
