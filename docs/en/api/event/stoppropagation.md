---
type: reference
native: Event.stopPropagation
---

# `Event`: `stopPropagation()` method

The **`stopPropagation()`** method does nothing. Events don't bubble, so there is no propagation to stop. It is kept for compatibility with browser code.

## Syntax

```
stopPropagation()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
application.addEventListener('ping', (e) => e.stopPropagation());
application.addEventListener('ping', () => console.log('Runs as usual'));
application.dispatchEvent(new Event('ping'));
```

**Result**: Prints `Runs as usual`. **Not verified in the simulator.**

## See also

- [`stopImmediatePropagation()`](stopimmediatepropagation.md): use this to keep later listeners from running
