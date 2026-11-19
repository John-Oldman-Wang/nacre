---
type: reference
web: URLSearchParams.size
---

# `URLSearchParams`: `size` property

The **`size`** property is the number of parameters in the list.

## Value

A number, a count.

- Read-only. Assigning to it throws `TypeError`.
- Parameters with the same name are counted separately: `size` of `a=1&b=2&a=3` is 3.
- No event notifies when the list changes: only the App's own code can change it.

## Examples

```js
const q = new URLSearchParams('a=1&b=2&a=3');
console.log(q.size);
```

**Result**: logs `3`.

## Differences from the web

Same as the web.

## See also

- [`getAll()`](getall.md): all values with the name
