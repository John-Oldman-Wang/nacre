---
type: reference
native: CLLocationManager.location
---

# `CLLocationManager`: `location` property

The **`location`** property is the most recent location.

## Value

A [`CLLocation`](../cl-location.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- Defaults to `null`. It's `null` before any location has been determined, or without authorization.
- Each read returns a new `CLLocation` object with the same fields as the previous read. To check whether two locations are the same, compare their fields, not `===`.
- During continuous updates, [`locationupdate`](locationupdate-event.md) fires when a new location arrives; the event carries the new location, so you don't need to read this property again.

## Examples

```js
const manager = new CLLocationManager();
const last = manager.location;
if (last === null) {
  console.log('No location yet');
} else {
  console.log(last.coordinate.latitude, last.coordinate.longitude);
}
```

**Effect**: prints `No location yet` before any location has been determined; otherwise prints the latitude and longitude of the last location.

## Corresponding iOS API

`CLLocationManager.location`.

## See also

- [`requestLocation()`](requestlocation.md): getting a new location
- [Locations are values](../cl-location.md#locations-are-values)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
