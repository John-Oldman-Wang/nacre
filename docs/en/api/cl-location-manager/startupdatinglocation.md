---
type: reference
native: "-[CLLocationManager startUpdatingLocation]"
---

# `CLLocationManager`: `startUpdatingLocation()` method

The **`startUpdatingLocation()`** method starts continuous updates: from then on, [`locationupdate`](locationupdate-event.md) fires each time there's a new location, until [`stopUpdatingLocation()`](stopupdatinglocation.md) is called.

## Syntax

```
startUpdatingLocation()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. It doesn't throw even without authorization: the system reports it through the [`locationerror`](locationerror-event.md) event with `name` `'NotAllowedError'`, and no locations arrive. **This event without authorization is not verified in the simulator.**

## Description

- Calling it again while already updating has no additional effect.
- An unsettled [`requestLocation()`](requestlocation.md) is canceled, and its Promise is rejected with `name` `'AbortError'`.
- From start to stop, the runtime keeps this `manager` alive; you don't need to keep a variable pointing to it.
- The location hardware stays on until `stopUpdatingLocation()` is called, using power the whole time.
- The first location received after starting may be one the system stored earlier rather than a fresh measurement. If freshness matters, check the location's [`timestamp`](../cl-location/timestamp.md).

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude);
});
manager.startUpdatingLocation();
```

**Effect**: when authorized and the system has a location, prints a line with the latitude and longitude for each new location. How often locations arrive is **not verified in the simulator**.

## Corresponding iOS API

`-[CLLocationManager startUpdatingLocation]`. Locations come from the `locationupdate` event; no delegate is needed.

## See also

- [`stopUpdatingLocation()`](stopupdatinglocation.md): stopping
- [`distanceFilter`](distancefilter.md): how far to move before reporting
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
