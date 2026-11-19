---
type: reference
native: NSError.code
---

# `CLLocationError`: `code` property

The **`code`** property is the error code from the system, passed through as is.

## Value

A number.

- For errors from the system, it is the system's original value: for example, 1 for no authorization, 2 for a network problem, and 0 when the location can't be determined.
- For errors from the runtime itself (`'AbortError'`, `'InvalidStateError'`), it is 0.
- When the runtime determines there is no authorization before calling the system, `code` is also 1, the same as from the system.

## Examples

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  console.log(err.name, err.code);
});
```

**Result**: Without authorization, prints `NotAllowedError 1`.

## Corresponding iOS API

`NSError.code`, a value from the `CLError` enum.

## See also

- [`name`](name.md): the category of the error. Use it to tell errors apart
- [Installing `@nacrejs/core-location`](../cl-location-manager.md#installation)
