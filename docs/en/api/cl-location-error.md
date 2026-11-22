---
type: reference
native: NSError (kCLErrorDomain)
---

# `CLLocationError`

**`CLLocationError`** is the error you get when location fails. You get it when the Promise from [`requestLocation()`](cl-location-manager/requestlocation.md) or [`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) is rejected, and it is also the `error` field of the [`locationerror`](cl-location-manager/locationerror-event.md) event.

`CLLocationError` is a name in the type definitions, not a global class: there is no global `CLLocationError`, and you can't check with `instanceof CLLocationError`. It is one of the two kinds of errors below; tell them apart by `name`:

| `name` | Kind of error | Where the system's error code and error domain are |
| --- | --- | --- |
| `'NotAllowedError'`, `'NetworkError'`, `'AbortError'`, `'InvalidStateError'` | [`DOMException`](dom-exception.md) | In `cause`, an [`NSError`](ns-error.md). `'AbortError'` and `'InvalidStateError'` come from the runtime and have no `cause` |
| `'LocationUnknownError'`, `'NSError'` | [`NSError`](ns-error.md) | Its own `code` and `domain` |

Both kinds are `Error`s; `err instanceof Error` is `true`.

You need to install `@nacrejs/core-location` first; for how, see [`CLLocationManager`](cl-location-manager.md#installation), or see [Core and capability packages](capabilities.md).

**Inheritance**: `Error` → [`DOMException`](dom-exception.md) or [`NSError`](ns-error.md)

## Constructor

It can't be created. The runtime provides the error when location fails.

## Instance properties

Also has `message` from `Error`: a one-sentence explanation. For errors from the system, it is the system's text, in the system language.

| Property | Description |
| --- | --- |
| [`name`](cl-location-error/name.md) | The category of the error, for example `'NotAllowedError'` |
| [`code`](cl-location-error/code.md) | The legacy web numeric code for a `DOMException`; the system's error code for an `NSError` |
| [`domain`](cl-location-error/domain.md) | Only on an `NSError`: the system's error domain |

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  const system = err instanceof NSError ? err : err.cause;
  console.log(err.name, system?.domain, system?.code);
});
```

**Result**: Without authorization, prints `NotAllowedError kCLErrorDomain 1` (measured).

## Corresponding iOS API

`NSError` with the error domain `kCLErrorDomain`. `error.code == kCLErrorDenied` is written as `error.name === 'NotAllowedError'`; the system's `NSError` is then in `error.cause`.

## See also

- [`CLLocationManager`](cl-location-manager.md): which methods and events provide it
- [`DOMException`](dom-exception.md), [`NSError`](ns-error.md): all members of these two kinds of errors
- [Getting the user's location](../guides/get-location.md#handle-errors): what to do after an error
