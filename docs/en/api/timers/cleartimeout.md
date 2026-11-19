---
type: reference
---

# `clearTimeout()` global function

The **`clearTimeout()`** global function cancels a timer. It is interchangeable with [`clearInterval()`](clearinterval.md): `clearTimeout()` can cancel a timer created by `setInterval()`, and vice versa.

## Syntax

```
clearTimeout(id)
```

### Parameters

**`id`**

The ID returned by [`setTimeout()`](settimeout.md) or [`setInterval()`](setinterval.md).

### Return value

None (`undefined`).

### Exceptions

None. An ID that doesn't exist, a timer that has already run or already been canceled, no argument, or `null` — none of these throw; it does nothing.

## Description

If you cancel a `setInterval()` from inside its own callback, the current callback runs to completion, and it doesn't run again afterward.

## Examples

```js
const id = setTimeout(() => {
  console.log('never printed');
}, 1000);

clearTimeout(id);
clearTimeout(id);
```

**Result**: Nothing is printed. Canceling the same ID a second time doesn't throw.

## Differences from the web

Same as the web.

## See also

- [`setTimeout()`](settimeout.md)
- [`clearInterval()`](clearinterval.md)
