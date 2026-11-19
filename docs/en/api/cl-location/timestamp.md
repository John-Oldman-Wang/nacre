---
type: reference
native: CLLocation.timestamp
---

# `CLLocation`: `timestamp` property

The **`timestamp`** property is when this location was measured.

## Value

A `Date`.

- Read-only; assigning to it throws `TypeError`.
- Always has a value, and it is a valid time.
- Each read gives a new `Date`. Modifying the `Date` you read does not affect the location.
- The first location received after continuous updates start may be one the system stored earlier, with a time earlier than now.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  const ageSeconds = (Date.now() - here.timestamp.getTime()) / 1000;
  console.log('This location was measured ' + ageSeconds.toFixed(0) + ' seconds ago');
}, () => {});
```

**Effect**: Prints how many seconds ago this location was measured.

## Corresponding iOS API

`CLLocation.timestamp`. In ObjC it is an `NSDate`; here it is a `Date`.

## See also

- [Getting the user's location](../../guides/get-location.md#pick-out-usable-locations): discarding locations that are too old
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
