---
type: reference
native: "-[CLLocationManagerDelegate locationManager:didUpdateLocations:]"
---

# `CLLocationManager`: `locationupdate` event

The **`locationupdate`** event fires when the `CLLocationManager` has a new location.

## Syntax

```
manager.addEventListener('locationupdate', (event) => { })
```

## Event object

`CLLocationUpdateEvent`, with one extra field:

**`locations`**

An array of [`CLLocation`](../cl-location.md), with at least one item, ordered from earliest to latest; **the last one is the newest**. The system sometimes reports several locations together. This field is read-only; assigning to it throws `TypeError`.

Not cancelable. `target` is the `manager`.

## When it fires

- During continuous updates (after [`startUpdatingLocation()`](startupdatinglocation.md) and before [`stopUpdatingLocation()`](stopupdatinglocation.md)), each time there's a new location.
- When [`requestLocation()`](requestlocation.md) gets a location.
- The callback runs on the turn after the system reports the location.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude,
              latest.timestamp.toISOString());
});
manager.startUpdatingLocation();
```

**Effect**: prints a line for each new location: latitude, longitude, and the time it was measured.

## Corresponding iOS API

The delegate method `locationManager:didUpdateLocations:`. The `locations` parameter is the event's `e.locations`.

## See also

- [`locationerror`](locationerror-event.md): location failures
- [Getting the user's location](../../guides/get-location.md#pick-out-usable-locations): picking usable locations by accuracy and time
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
