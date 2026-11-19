---
type: reference
native: "-[CLLocationManager stopUpdatingLocation]"
---

# `CLLocationManager`: `stopUpdatingLocation()` method

The **`stopUpdatingLocation()`** method stops continuous updates and cancels any unsettled [`requestLocation()`](requestlocation.md).

## Syntax

```
stopUpdatingLocation()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None. Calling it when not updating doesn't throw.

## Description

- After the call, [`locationupdate`](locationupdate-event.md) no longer fires. **Not verified in the simulator.**
- An unsettled `requestLocation()` is rejected with `name` `'AbortError'`.
- The runtime no longer keeps this `manager` alive on account of continuous updates.
- Call it when leaving a view controller that uses location; otherwise location stays on.

## Examples

```js
const manager = new CLLocationManager();
const pending = manager.requestLocation();
manager.stopUpdatingLocation();
pending.catch((err) => {
  console.log(err.name);
});
```

**Result**: when authorized, prints `AbortError`. Without authorization, `requestLocation()` rejects immediately and prints `NotAllowedError`.

## Corresponding iOS API

`-[CLLocationManager stopUpdatingLocation]`.

## See also

- [`startUpdatingLocation()`](startupdatinglocation.md): starting continuous updates
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
