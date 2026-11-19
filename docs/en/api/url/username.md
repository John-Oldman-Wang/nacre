---
type: reference
web: URL.username
---

# `URL`: `username` property

The **`username`** property is the username in the address: the part before `@` and before the colon.

## Value

A string.

- Readable and writable.
- An empty string when the address has no username.
- Example: the `username` of `https://u:p@a.com:8080/p/q?x=1#f` is `u`.

### Invalid values

After assignment the whole address is parsed again. When the new value makes the address invalid, the assignment has no effect, the address stays as it was, and nothing is thrown.

## Examples

```js
const u = new URL('https://a.com/');
u.username = 'me';
console.log(u.href);
```

**Result**: Logs `https://me@a.com/`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`password`](password.md): the password in the address
