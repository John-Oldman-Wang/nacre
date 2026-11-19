---
type: reference
---

# `Headers`

**`Headers`** represents a set of HTTP request or response headers. Each header has a name and a value; names are case-insensitive, and the same name can have multiple values.

`Headers` is a global, created with `new`, and doesn't involve the network. [`fetch()`](fetch.md) accepts it as request headers, and response headers are read back as `Headers` too. When you're only passing headers to `fetch()` once, you can also write a plain object.

**Inheritance**: `Headers` doesn't inherit from any class.

For how to prepare request headers and read response headers, see the guide [Building and parsing URLs](../guides/urls.md).

## Constructor

[`Headers()`](headers/constructor.md)

Creates a set of headers from a plain object, an array, or another `Headers`.

## Instance methods

Names are case-insensitive in all methods.

Reading:

| Method | Description |
| --- | --- |
| [`get()`](headers/get.md) | The value for a name; multiple values are joined with `, ` |
| [`has()`](headers/has.md) | Whether the name is present |
| [`getSetCookie()`](headers/getsetcookie.md) | All `Set-Cookie` values, one item each |

Modifying:

| Method | Description |
| --- | --- |
| [`set()`](headers/set.md) | Sets a value, overwriting existing values with the same name |
| [`append()`](headers/append.md) | Appends a value, keeping existing values with the same name |
| [`delete()`](headers/delete.md) | Removes all values for the name |

Iterating:

| Method | Description |
| --- | --- |
| [`entries()`](headers/entries.md) | Yields `[name, value]` in turn. Iterating directly with `for...of` is the same |
| [`keys()`](headers/keys.md) | Yields names in turn |
| [`values()`](headers/values.md) | Yields values in turn |
| [`forEach()`](headers/foreach.md) | Calls a callback once for each header |

## Rules for names and values

- A name can only consist of letters, digits, and the symbols ``!#$%&'*+-.^_`|~``, and can't be empty. An invalid name throws `TypeError`.
- Names are stored in lowercase. Names read during iteration are all lowercase.
- Leading and trailing whitespace (spaces, tabs, carriage returns, line feeds) is removed from values.
- A value can't contain NUL, carriage return, or line feed in the middle; if it does, `TypeError` is thrown.
- Names aren't restricted otherwise: names such as `Host`, `Cookie`, and `Origin` can all be set.

For the exact error messages, see [`append()`](headers/append.md).

## Examples

The following code prepares a set of request headers and reads them back. It needs no UI and runs when written at the top level of `main.js`.

```js
const headers = new Headers({ 'Content-Type': 'application/json' });
headers.set('Authorization', 'Bearer abc');
headers.append('Accept', 'a');
headers.append('accept', 'b');

console.log(headers.get('content-type'));
console.log(headers.get('ACCEPT'));
for (const [name, value] of headers) {
  console.log(name, value);
}
```

**Result**: The console prints, in order:

- `application/json`
- `a, b`
- `accept a, b`, `authorization Bearer abc`, `content-type application/json`: names are lowercase, in alphabetical order.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Differences from the web

| Case | Browser | Here |
| --- | --- | --- |
| Names such as `Host`, `Cookie`, `Origin` | Forbidden or ignored when used in a request | Not restricted |

Everything else is the same as on the web.

## See also

- [Building and parsing URLs](../guides/urls.md): appending headers with the same name, reading `Set-Cookie`, iterating all headers
- [`fetch()`](fetch.md): sending request headers, reading response headers
- [`WebSocket`](websocket.md): sending request headers in the handshake
