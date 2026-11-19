---
type: reference
---

# `clearInterval()` global function

The **`clearInterval()`** global function cancels a timer. It is interchangeable with [`clearTimeout()`](cleartimeout.md): `clearTimeout()` can cancel a timer created by `setInterval()`, and vice versa.

## Syntax

```
clearInterval(id)
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
let count = 0;
const id = setInterval(() => {
  count += 1;
  console.log('run ' + count);
  if (count >= 3) clearInterval(id);
}, 100);
```

**Result**: Prints `run 1`, `run 2`, `run 3`, then stops.

## Differences from the web

Same as the web.

## See also

- [`setInterval()`](setinterval.md)
- [`clearTimeout()`](cleartimeout.md)
