---
type: reference
native: Event.stopImmediatePropagation
---

# `Event`: `stopImmediatePropagation()` method

The **`stopImmediatePropagation()`** method prevents listeners later on the same object from running.

## Syntax

```
stopImmediatePropagation()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
application.addEventListener('ping', (e) => {
  console.log('First');
  e.stopImmediatePropagation();
});
application.addEventListener('ping', () => {
  console.log('Second');
});
application.dispatchEvent(new Event('ping'));
```

**Result**: Prints only `First`. **Not verified in the simulator.**

## See also

- [`stopPropagation()`](stoppropagation.md)
