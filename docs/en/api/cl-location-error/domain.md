---
type: reference
native: NSError.domain
---

# `CLLocationError`: `domain` property

The **`domain`** property is the error domain from the system.

## Value

A string.

- For errors from the system, and for no authorization determined by the runtime, it is `'kCLErrorDomain'`.
- For `'AbortError'` and `'InvalidStateError'` from the runtime itself, it is an empty string.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  console.log(err.domain === '' ? 'From the runtime' : 'From the system: ' + err.domain);
});
```

**Result**: Without authorization, prints `From the system: kCLErrorDomain`.

## Corresponding iOS API

`NSError.domain`.

## See also

- [`code`](code.md)
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
