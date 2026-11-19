---
type: reference
native: "-[WKHTTPCookieStore getAllCookies:]"
---

# `Cookies`: `get()` method

The **`get()`** method reads the cookies in this partition, optionally filtered. It can read cookies of any site, including `httpOnly` ones.

## Syntax

```
get([filter])
```

### Parameters

**`filter`** <small>optional</small>

The filter conditions, an object. When omitted, or given as `null` / `undefined`, returns all the cookies of this partition. Conditions are combined with "and".

**`filter.url`**

A string. Keeps the cookies a request to this address would send: matching domain and matching path; if the address is `http`, `secure` cookies are excluded. An empty string is the same as not giving it.

**`filter.name`**

A string. Keeps cookies with the same name.

**`filter.domain`**

A string. Keeps cookies of this domain and its subdomains. A leading dot makes no difference.

**`filter.path`**

A string. Keeps cookies with exactly this path.

**`filter.secure`**

A boolean. Keeps cookies whose `secure` equals this value.

**`filter.session`**

A boolean. `true` keeps session cookies; `false` keeps cookies with an expiration time.

**`filter.httpOnly`**

A boolean. Keeps cookies whose `httpOnly` equals this value.

### Return value

A `Promise` that fulfills with an array of [`Cookie`](../cookie.md). When nothing matches, it is an empty array, with no error.

Each item is a record as of the moment it was read; see [`Cookie`](../cookie.md).

### Exceptions

The returned Promise is rejected; nothing is thrown on the spot.

**`TypeError`**

`url` is not a valid `http` / `https` address: `cookies.get: the url is invalid`; a valid address that is not `http` / `https`: `cookies.get: the url must be http or https`.

## Examples

```js
const found = await session.defaultSession.cookies.get({
  url: 'https://my.app/',
  name: 'sid',
});
if (found.length > 0) console.log('The page is signed in', found[0].value);
```

**Effect**

- If the page has signed in, the console prints the value of that cookie.
- When there is no such cookie, `found` is an empty array, and nothing is printed.

## Differences from Electron

The same.

The corresponding iOS API is `-[WKHTTPCookieStore getAllCookies:]`. The system only offers "read everything"; the runtime applies the filter conditions.

## See also

- [`Cookie`](../cookie.md): which fields each item has
- [`set()`](set.md)
