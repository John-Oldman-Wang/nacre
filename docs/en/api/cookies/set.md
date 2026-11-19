---
type: reference
native: "-[WKHTTPCookieStore setCookie:completionHandler:]"
---

# `Cookies`: `set()` method

The **`set()`** method writes a cookie into this partition. An existing cookie with the same name, domain, and path is overwritten; no extra cookie is added.

## Syntax

```
set(details)
```

### Parameters

**`details`**

An object describing the cookie.

**`details.url`**

A string, required. Which address the cookie belongs to; must be `http` or `https`. Without `domain`, the cookie belongs only to this address's host.

**`details.name`**

A string, the name. Defaults to `''`.

**`details.value`**

A string, the value. Defaults to `''`.

**`details.domain`**

A string. When given, the cookie is valid for this domain and its subdomains, and the `domain` read back starts with a dot. When not given, it belongs only to the host of `url`. See [Whom a cookie belongs to](../cookie.md#who-a-cookie-belongs-to).

**`details.path`**

A string. Only requests to this path and paths below it send the cookie. Defaults to `'/'`.

**`details.secure`**

A boolean. `true`: sent only with `https` requests. Defaults to `false`.

**`details.httpOnly`**

A boolean. `true`: the page's scripts cannot read it. Defaults to `false`.

**`details.expirationDate`**

A number, the expiration time, in seconds since 1970. Without it, it is a session cookie and is gone after the app restarts; see [Session cookies](../cookie.md#session-cookies-and-cookies-with-an-expiration-time).

**`details.sameSite`**

A string: `'lax'`, `'strict'`, `'no_restriction'`, or `'unspecified'`; for their meanings, see [`Cookie`](../cookie.md). The last two have the same effect: neither writes this attribute, and it reads back as `'no_restriction'`. Not giving it is the same.

### Return value

A `Promise` that fulfills with `undefined` once the write is done.

### Exceptions

The returned Promise is rejected; nothing is thrown on the spot.

**`TypeError`**

- `details` is not an object: `cookies.set needs a details object, got …`.
- `url` is missing or invalid: `cookies.set: the url is invalid`.
- `url` is not `http` / `https`: `cookies.set: the url must be http or https`.
- `sameSite` is invalid: `sameSite has no value "none"; expected one of: unspecified / no_restriction / lax / strict`.
- `expirationDate` is not a number: `expirationDate must be a finite number, got "abc"`.

## Examples

```js
await session.defaultSession.cookies.set({
  url: 'https://my.app/',
  name: 'token',
  value: 'abc123',
  httpOnly: true,
  expirationDate: Date.now() / 1000 + 7 * 24 * 3600,
});
```

**Effect**

- Requests that pages in the default partition later send to `my.app` carry `token=abc123`. Pages already open do not need to reload.
- Scripts in the page cannot read it through `document.cookie`.
- It survives app restarts for 7 days.

## Differences from Electron

The same.

The corresponding iOS API is `-[WKHTTPCookieStore setCookie:completionHandler:]`; the cookie is represented by `NSHTTPCookie`.

## See also

- [`Cookie`](../cookie.md): whom a cookie belongs to, session cookies
- [Managing web page sign-in state](../../guides/web-login.md): writing sign-in cookies before opening a page
