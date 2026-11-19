---
type: reference
web: AbortController()
---

# `AbortController()` constructor

The **`AbortController()`** constructor creates a controller, along with its [`signal`](signal.md).

## Syntax

```
new AbortController()
```

### Parameters

None.

### Return value

A new `AbortController`. Its `signal` is not yet aborted.

### Exceptions

None.

## Examples

```js
const controller = new AbortController();
console.log(controller.signal.aborted);
```

**Result**: Prints `false`.

## Differences from the web

The same as on the web.

## See also

- [`abort()`](abort.md)
