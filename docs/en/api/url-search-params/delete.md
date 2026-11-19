---
type: reference
web: URLSearchParams.delete()
---

# `URLSearchParams`: `delete()` method

The **`delete()`** method deletes the parameters with a given name.

## Syntax

```
delete(name[, value])
```

### Parameters

**`name`**

The parameter name, a string. Non-string values are converted to strings first.

**`value`**

Optional. When passed, only parameters whose name and value both match are deleted.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

Without `value`, all parameters with the name are deleted. When this list is the [`searchParams`](../url/searchparams.md) of a `URL`, the URL changes with it.

## Examples

```js
const q = new URLSearchParams('a=9&b=2&c=3&a=1');
q.delete('a');
console.log(q.toString());
q.delete('c', '4');
console.log(q.toString());
```

**Result**: logs `b=2&c=3`, then `b=2&c=3` again: the value differs, so nothing is deleted. The second line is **not verified in the simulator**.

## Differences from the web

Same as the web.

## See also

- [`set()`](set.md)
