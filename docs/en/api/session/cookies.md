---
type: reference
native: WKWebsiteDataStore.httpCookieStore
---

# `Session`: `cookies` property

The **`cookies`** property is this partition's cookies, a [`Cookies`](../cookies.md) object. Use it to read, write, and delete cookies, and to listen for cookie changes.

## Value

A [`Cookies`](../cookies.md).

- Read-only.
- Every read returns the same object.

## Examples

```js
const cookies = session.defaultSession.cookies;
console.log(cookies === session.defaultSession.cookies);
const all = await cookies.get();
console.log(all.length);
```

**Result**: It first prints `true`, then the number of cookies in the default partition.

## Differences from Electron

Same. The differences are in the members of `Cookies`; see [`Cookies`](../cookies.md#differences-from-electron).

The corresponding iOS API is `WKWebsiteDataStore.httpCookieStore`.

## See also

- [`Cookies`](../cookies.md)
