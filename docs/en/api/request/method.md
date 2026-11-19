---
type: reference
web: Request.method
---

# `Request`: `method` property

The **`method`** property is the request method, in uppercase.

## Value

A string, such as `'GET'` or `'POST'`.

- Readable, not writable.
- It's `'GET'` when none was given at construction.
- The method name given at construction is converted to uppercase: `'post'` becomes `'POST'`.

## Examples

```js
const req = new Request('https://httpbin.org/post', { method: 'post' });
console.log(req.method);
```

**Result**: Prints `POST`.

## Differences from the web

All method names are converted to uppercase. The web converts only `DELETE`, `GET`, `HEAD`, `OPTIONS`, `POST`, and `PUT` to uppercase, and keeps `'patch'` as is. **From the code; not verified in the simulator.**

## See also

- [`Request()`](constructor.md)
