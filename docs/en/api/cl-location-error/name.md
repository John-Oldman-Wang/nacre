---
type: reference
native: NSError.code (kCLErrorDomain)
---

# `CLLocationError`: `name` property

The **`name`** property is the category of the location error. Use it to determine what went wrong.

## Value

A string, one of these six:

| Value | Meaning | Provided by | Kind of error |
| --- | --- | --- | --- |
| `'NotAllowedError'` | No authorization | The system, or the runtime determining it before calling the system. Both carry a `cause`: `cause.code` is 1 and `cause.domain` is `'kCLErrorDomain'` | [`DOMException`](../dom-exception.md) |
| `'NetworkError'` | A network problem | The system (`cause.code` is 2) | `DOMException` |
| `'AbortError'` | [`requestLocation()`](../cl-location-manager/requestlocation.md) was canceled | The runtime, with no `cause` | `DOMException` |
| `'InvalidStateError'` | This can't be done right now: requesting a single location during continuous updates, requesting authorization while the app is in the background, or the usage description is missing from Info.plist | The runtime, with no `cause` | `DOMException` |
| `'LocationUnknownError'` | The location can't be determined at this moment. During continuous updates the system keeps trying | The system (`code` is 0) | [`NSError`](../ns-error.md) |
| `'NSError'` | Other errors reported by the system; see [`code`](code.md) and [`domain`](domain.md) | The system | `NSError` |

- Errors from the system whose error domain isn't `kCLErrorDomain` are also classified as `'NSError'`.
- Read-only. Assigning to it throws `TypeError`.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  if (err.name === 'NotAllowedError') {
    console.log('No permission');
  } else {
    console.log('Other error: ' + err.name);
  }
});
```

**Effect**: Without authorization, prints `No permission`.

## Corresponding iOS API

No direct equivalent: in ObjC, look at `NSError.code`. `kCLErrorDenied` is `'NotAllowedError'`, `kCLErrorLocationUnknown` is `'LocationUnknownError'`, and `kCLErrorNetwork` is `'NetworkError'`.

## See also

- [`code`](code.md): the error code
- [`DOMException`](../dom-exception.md), [`NSError`](../ns-error.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
