---
type: reference
native: NSError.code (kCLErrorDomain)
---

# `CLLocationError`: `name` property

The **`name`** property is the category of the location error. Use it to determine what went wrong.

## Value

A string, one of these six:

| Value | Meaning | Provided by |
| --- | --- | --- |
| `'NotAllowedError'` | No authorization | The system, or the runtime determining it before calling the system. In both cases `code` is 1 and `domain` is `'kCLErrorDomain'` |
| `'LocationUnknownError'` | The location can't be determined at this moment. During continuous updates the system keeps trying | The system (`code` is 0) |
| `'NetworkError'` | A network problem | The system (`code` is 2) |
| `'CLError'` | Other errors reported by the system; see [`code`](code.md) | The system |
| `'AbortError'` | [`requestLocation()`](../cl-location-manager/requestlocation.md) was canceled | The runtime |
| `'InvalidStateError'` | This can't be done right now: requesting a single location during continuous updates, requesting authorization while the app is in the background, or the usage description is missing from Info.plist | The runtime |

- `code` is 0 for both `'LocationUnknownError'` and `'AbortError'`, so tell them apart by `name`, not just `code`.
- Errors from the system whose error domain isn't `kCLErrorDomain` are also classified as `'CLError'`.

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

- [`code`](code.md): the system's error code
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
