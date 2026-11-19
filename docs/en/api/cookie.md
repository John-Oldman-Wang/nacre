---
type: reference
native: NSHTTPCookie
status: partial
---

# `Cookie`

**`Cookie`** represents a record of a cookie at one moment. Each item in the array returned by [`Cookies.get()`](cookies/get.md) is a `Cookie`.

It is a plain object, not a native object, and there is no global with this name. Its fields are for reading only: modifying the object does not change the cookie in the partition; use [`Cookies.set()`](cookies/set.md) for that. If the cookie changes later, records you already have do not change with it.

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | Name |
| `value` | `string` | Value |
| `domain` | `string` | The domain it belongs to. A leading dot means it also applies to subdomains; see [Who a cookie belongs to](#who-a-cookie-belongs-to) |
| `hostOnly` | `boolean` | `true`: sent only to the host `domain`. `false`: also sent to subdomains |
| `path` | `string` | Path. Only requests to this path and paths below it carry the cookie |
| `secure` | `boolean` | `true`: sent only with `https` requests. `false`: sent with both `http` and `https` |
| `httpOnly` | `boolean` | `true`: page scripts cannot read it. `false`: page scripts can read it through `document.cookie` |
| `session` | `boolean` | `true`: no expiration time; gone when the app restarts. `false`: has an expiration time |
| `expirationDate` | `number` | Expiration time, an integer number of seconds since 1970. Absent when `session` is `true` |
| `sameSite` | `string` | Whether cross-site requests carry the cookie; see below |

`sameSite` reads as one of these three:

| Value | Effect |
| --- | --- |
| `'strict'` | Carried only by requests initiated from the same site |
| `'lax'` | Not carried by cross-site subrequests; carried when the user follows a link to the site |
| `'no_restriction'` | Always carried |

A cookie with no SameSite attribute also reads as `'no_restriction'`, indistinguishable from one that set it explicitly. `'unspecified'`, which is accepted when writing, is never read back.

## Who a cookie belongs to

When you call [`set()`](cookies/set.md), `url` and `domain` decide which requests carry the cookie:

| How you write it | `domain` read back | `hostOnly` | Requests that carry it |
| --- | --- | --- | --- |
| Only `url: 'https://a.my.app/'` | `'a.my.app'` | `true` | Only those to `a.my.app` |
| Plus `domain: 'my.app'` | `'.my.app'` | `false` | `my.app` and all its subdomains |

Cookies are the same cookie only when name, domain, and path all match. Calling `set` again overwrites the existing value rather than adding another cookie.

## Session cookies and cookies with an expiration time

| | `session` | `expirationDate` | After the app restarts |
| --- | --- | --- | --- |
| `set` without `expirationDate` | `true` | Field absent | Gone |
| `set` with it | `false` | That time, in whole seconds | Still there; expires automatically at that time |

This also holds for partitions that store data on disk: session cookies are gone after the app restarts.

## Examples

```js
await session.defaultSession.cookies.set({
  url: 'https://a.my.app/',
  domain: 'my.app',
  name: 'theme',
  value: 'dark',
});
const [cookie] = await session.defaultSession.cookies.get({ url: 'https://a.my.app/', name: 'theme' });
if (cookie) console.log(cookie.domain, cookie.hostOnly, cookie.session, 'expirationDate' in cookie);
```

**Result**: logs `.my.app false true false`.

## Differences from Electron

The fields are the same as Electron's `Cookie`. One difference: `sameSite` never reads as `'unspecified'`.

## Corresponding iOS API

`NSHTTPCookie`. `expiresDate` becomes `expirationDate`, in seconds since 1970; `sessionOnly` becomes `session`; `HTTPOnly` becomes `httpOnly`.

## See also

- [`Cookies`](cookies.md): reading, writing, and removing
