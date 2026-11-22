---
type: reference
native: NSError.domain
---

# `CLLocationError`: `domain` property

The **`domain`** property is the error domain from the system. Only the two [`NSError`](../ns-error.md) kinds of errors have it.

## Value

A string. Read-only; assigning to it throws `TypeError`.

- When `name` is `'LocationUnknownError'` or `'NSError'`, the error is an `NSError`, and `domain` is the system's error domain. Location errors are `'kCLErrorDomain'`; an `'NSError'` can also have another error domain.
- When `name` is `'NotAllowedError'`, `'NetworkError'`, `'AbortError'`, or `'InvalidStateError'`, the error is a [`DOMException`](../dom-exception.md) and has no `domain`. The system's error domain is in `cause.domain`; `'AbortError'` and `'InvalidStateError'` from the runtime itself have no `cause`.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  const domain = err instanceof NSError ? err.domain : err.cause?.domain;
  console.log(domain === undefined ? 'From the runtime' : 'From the system: ' + domain);
});
```

**Result**: Without authorization, prints `From the system: kCLErrorDomain` (measured).

## Corresponding iOS API

`NSError.domain`. For the `DOMException` kinds it is in `cause.domain`.

## See also

- [`code`](code.md)
- [`NSError`'s `domain`](../ns-error/domain.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
