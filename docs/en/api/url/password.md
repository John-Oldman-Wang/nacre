---
type: reference
web: URL.password
---

# `URL`: `password` property

The **`password`** property is the password in the address: the part after the username and before `@`.

## Value

A string.

- Readable and writable.
- An empty string when the address has no password.
- When there is no username, the password does not appear in [`href`](href.md).
- Example: the `password` of `https://u:p@a.com:8080/p/q?x=1#f` is `p`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const u = new URL('https://u:p@a.com/');
console.log(u.username, u.password);
```

**Result**: Logs `u p`.

## Differences from the web

Same as the web.

## See also

- [`username`](username.md): the username in the address
