---
type: reference
web: URL.pathname
---

# `URL`: `pathname` property

The **`pathname`** property is the path of the address.

## Value

A string.

- Readable and writable.
- At least `/`: an address without a path reads back `/`.
- In the path read back, `.` and `..` have been resolved, spaces are encoded as `%20`, and parts that were already encoded are kept as-is. How non-ASCII characters such as Chinese in the path are encoded is **not verified in the simulator**.
- When writing, the leading `/` can be omitted; it is added automatically.
- Example: the `pathname` of `https://u:p@a.com:8080/p/q?x=1#f` is `/p/q`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const w = new URL('https://a.com/p');
w.pathname = 'q';
console.log(w.href);
```

**Result**: Logs `https://a.com/q`.

## Differences from the web

Same as the web.

## See also

- [Addresses are normalized](../url.md#addresses-are-normalized)
