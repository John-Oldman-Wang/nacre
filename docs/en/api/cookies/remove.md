---
type: reference
native: "-[WKHTTPCookieStore deleteCookie:completionHandler:]"
---

# `Cookies`: `remove()` method

The **`remove()`** method deletes the cookies in this partition with a given name for an address.

## Syntax

```
remove(url, name)
```

### Parameters

**`url`**

A string, an `http` or `https` address. It deletes the cookies a request to this address would send: matching domain and matching path. It differs from the `url` condition of [`get()`](get.md) in one way: it ignores `secure`, so an `http` address can also delete `secure` cookies.

**`name`**

A string, the cookie's name.

### Return value

A `Promise` that fulfills with `undefined` once the deletion is done. If there was no such cookie, nothing happens, and it still fulfills.

### Exceptions

The returned Promise is rejected; nothing is thrown on the spot.

**`TypeError`**

- `url` is invalid: `cookies.remove: the url is invalid`.
- `url` is not `http` / `https`: `cookies.remove: the url must be http or https`.

## Examples

```js
await session.defaultSession.cookies.remove('https://my.app/', 'token');
```

**Effect**

- The cookie named `token` for this address is gone. Cookies with the same name under other domains are not affected.
- If there was no such cookie, nothing happens, with no error.

## Differences from Electron

The same.

The corresponding iOS API is `-[WKHTTPCookieStore deleteCookie:completionHandler:]`.

## See also

- [`Session.clearStorageData()`](../session/clearstoragedata.md): clear all cookies, or one site's data, at once
