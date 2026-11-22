---
type: reference
native: NSError.code
---

# `CLLocationError`: `code` property

The **`code`** property is an error code. Which kind of code it is depends on whether the error is a [`DOMException`](../dom-exception.md) or an [`NSError`](../ns-error.md).

## Value

A number. Read-only; assigning to it throws `TypeError`.

| `name` | Kind of error | `code` |
| --- | --- | --- |
| `'NotAllowedError'` | `DOMException` | 0: this name has no legacy web numeric code |
| `'NetworkError'` | `DOMException` | 19: the legacy web numeric code |
| `'AbortError'` | `DOMException` | 20: the legacy web numeric code |
| `'InvalidStateError'` | `DOMException` | 11: the legacy web numeric code |
| `'LocationUnknownError'` | `NSError` | The system's error code, 0 |
| `'NSError'` | `NSError` | The system's error code |

For a `DOMException`, the system's error code is in `cause.code`: 1 for no authorization, 2 for a network problem. `'AbortError'` and `'InvalidStateError'` come from the runtime itself and have no `cause`.

Tell errors apart by [`name`](name.md), not just `code`.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  const systemCode = err instanceof NSError ? err.code : err.cause?.code;
  console.log(err.name, err.code, systemCode);
});
```

**Result**: Without authorization, prints `NotAllowedError 0 1`. `0` is the `DOMException`'s `code`, and `1` is the system's error code.

## Corresponding iOS API

`NSError.code`, a value from the `CLError` enum. For the `DOMException` kinds it is in `cause.code`.

## See also

- [`name`](name.md): the category of the error. Use it to tell errors apart
- [`DOMException`'s `code`](../dom-exception/code.md): the legacy web numeric codes
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
