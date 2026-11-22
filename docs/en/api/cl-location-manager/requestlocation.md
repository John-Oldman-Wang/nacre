---
type: reference
native: "-[CLLocationManager requestLocation]"
---

# `CLLocationManager`: `requestLocation()` method

The **`requestLocation()`** method gets the current location once. The system locates according to [`desiredAccuracy`](desiredaccuracy.md) and stops on its own after getting one location.

## Syntax

```
requestLocation()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with a [`CLLocation`](../cl-location.md).

- It usually takes a few seconds. **The duration and timeout are not verified in the simulator.**
- Calling it again before the previous call settles locates only once; both Promises get the same result.
- [`locationupdate`](locationupdate-event.md) also fires once when the location is obtained.

When the Promise is rejected, you get a [`CLLocationError`](../cl-location-error.md):

| `name` | When |
| --- | --- |
| `'NotAllowedError'` | The authorization status isn't `'authorizedWhenInUse'` or `'authorizedAlways'`. Rejected immediately, with no prompt and no waiting. `cause.code` is 1 and `cause.domain` is `'kCLErrorDomain'` |
| `'InvalidStateError'` | This `manager` is continuously updating |
| `'AbortError'` | `startUpdatingLocation()` or `stopUpdatingLocation()` was called before it settled |
| `'LocationUnknownError'` | The system can't determine the location. This is what happens in the simulator when no location is set. **Not verified in the simulator** |
| `'NetworkError'`, `'NSError'` | Other errors reported by the system. For `'NetworkError'` the system's error code is in `cause.code`; for `'NSError'` it is in `code`. **Not verified in the simulator** |

The `message` of `'NotAllowedError'`: when authorization hasn't been requested yet, `requestLocation: location authorization has not been requested yet; call requestWhenInUseAuthorization() first`; for other statuses, something like `requestLocation: location access is denied`, where the last word is the current status.

The `message` of `'InvalidStateError'`: `requestLocation: location updates are running; read the locationupdate event instead, or call stopUpdatingLocation() first`.

The `message` of `'AbortError'`: `requestLocation was cancelled by ` followed by the name of the method that canceled it.

### Exceptions

None. All errors come through Promise rejection.

## Description

Use it when you need just one location; there's nothing to remember to turn off. To follow the user as they move, use [`startUpdatingLocation()`](startupdatinglocation.md).

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().then(
  (here) => {
    console.log(here.coordinate.latitude, here.coordinate.longitude);
  },
  (err) => {
    console.log('Failed: ' + err.name);
  });
```

**Effect**: on success, prints two numbers, the latitude and longitude. On failure, prints `Failed: ` followed by the error name. Without authorization, prints `Failed: NotAllowedError`.

## Corresponding iOS API

`-[CLLocationManager requestLocation]`. In ObjC the result comes from the delegate's `locationManager:didUpdateLocations:` or `locationManager:didFailWithError:`; here it comes from the returned Promise.

## See also

- [`startUpdatingLocation()`](startupdatinglocation.md): receiving locations continuously
- [`CLLocationError`](../cl-location-error.md): error categories
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
