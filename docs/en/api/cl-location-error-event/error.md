---
type: reference
native: CLLocationErrorEvent.error
---

# `CLLocationErrorEvent`: `error` property

The **`error`** property is the location error.

## Value

A [`CLLocationError`](../cl-location-error.md): a [`DOMException`](../dom-exception.md) or an [`NSError`](../ns-error.md). `name` is the error's category.

- Read-only. Assigning to it throws `TypeError`.
- Without authorization, `name` is `'NotAllowedError'`.
- When the location can't be determined for now, `name` is `'LocationUnknownError'`, and the system keeps trying.
- The system's error code and domain: an `NSError` has its own `code` and `domain`; a `DOMException` has them on `cause`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('没有权限，停止定位');
  }
});
manager.startUpdatingLocation();
```

**Effect**: without location permission, stops updating and prints `没有权限，停止定位`. **Not verified in the simulator.**

## Corresponding iOS API

The `error` parameter of `locationManager:didFailWithError:`.

## See also

- [`CLLocationErrorEvent`](../cl-location-error-event.md)
