---
type: reference
native: NSError (kCLErrorDomain)
---

# `CLLocationError`

**`CLLocationError`** is the `Error` object you get when location fails. You get it when the Promise from [`requestLocation()`](cl-location-manager/requestlocation.md) or [`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) is rejected, and it is also the `error` field of the [`locationerror`](cl-location-manager/locationerror-event.md) event.

`CLLocationError` is a name in the type definitions, not a global class: there is no global `CLLocationError`, and you can't check with `instanceof CLLocationError`. It is an ordinary `Error` (`err instanceof Error` is `true`) with two extra fields, `code` and `domain`. To tell kinds of errors apart, look at `name`.

You need to install `@nacrejs/core-location` first; for how, see [`CLLocationManager`](cl-location-manager.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `Error` → `CLLocationError`

## Constructor

It can't be created. The runtime provides the error when location fails.

## Instance properties

Also inherits `message` from `Error`: a one-sentence explanation. For errors from the system, it is the system's text, in the system language.

| Property | Description |
| --- | --- |
| [`name`](cl-location-error/name.md) | The category of the error, for example `'NotAllowedError'` |
| [`code`](cl-location-error/code.md) | The system's error code |
| [`domain`](cl-location-error/domain.md) | The system's error domain, `'kCLErrorDomain'` or an empty string |

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  console.log(err.name, err.code, err.domain);
});
```

**Result**: Without authorization, prints `NotAllowedError 1 kCLErrorDomain`.

## Corresponding iOS API

`NSError` with the error domain `kCLErrorDomain`. `error.code == kCLErrorDenied` is written as `error.name === 'NotAllowedError'`.

## See also

- [`CLLocationManager`](cl-location-manager.md): which methods and events provide it
- [Getting the user's location](../guides/get-location.md#handle-errors): what to do after an error
