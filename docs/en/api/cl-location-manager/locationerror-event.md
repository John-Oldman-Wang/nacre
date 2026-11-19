---
type: reference
native: "-[CLLocationManagerDelegate locationManager:didFailWithError:]"
---

# `CLLocationManager`: `locationerror` event

The **`locationerror`** event fires when location fails, mainly during continuous updates.

## Syntax

```
manager.addEventListener('locationerror', (event) => { })
```

## Event object

`CLLocationErrorEvent`, with one extra field:

**`error`**

A [`CLLocationError`](../cl-location-error.md). `name` is the error category; `code` and `domain` are the raw values from the system.

Not cancelable. `target` is the `manager`.

## When it fires

- When the system reports a location error. Without authorization during continuous updates, `name` is `'NotAllowedError'`; when the location temporarily can't be determined, `name` is `'LocationUnknownError'`, and the system keeps trying.
- The callback runs on the turn after the system's report.

The event name is `locationerror`, not `error`. Listening for `error` doesn't throw, but receives nothing.

Actual firing of this event is **not verified in the simulator**.

## Examples

```js
const manager = new CLLocationManager();
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('No permission, stopping location');
  } else {
    console.log('Location error', e.error.name, e.error.code);
  }
});
manager.startUpdatingLocation();
```

**Effect** (not verified in the simulator): without authorization, prints `No permission, stopping location`; for other errors, prints the error's name and code.

## Corresponding iOS API

The delegate method `locationManager:didFailWithError:`. The `NSError` is the event's `e.error`.

## See also

- [`CLLocationError`](../cl-location-error.md): what each `name` means
- [Getting the user's location](../../guides/get-location.md#handle-errors): whether to stop or continue after an error
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
