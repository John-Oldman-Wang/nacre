---
type: reference
native: "-[WKWebsiteDataStore removeDataOfTypes:modifiedSince:completionHandler:]"
---

# `Session`: `clearStorageData()` method

The **`clearStorageData()`** method clears data in this partition. With no arguments it clears everything: cookies, `localStorage`, `sessionStorage`, IndexedDB, and caches. Other partitions aren't affected.

## Syntax

```
clearStorageData([options])
```

### Parameters

**`options`** <small>optional</small>

An object. Omitted, or `null` / `undefined`, clears all data in the whole partition.

**`options.storages`** <small>optional</small>

An array of strings; clears only these kinds. Omitted means everything, caches included. Accepted names:

| Name | What it clears |
| --- | --- |
| `'cookies'` | Cookies |
| `'localstorage'` | `localStorage` and `sessionStorage` |
| `'indexdb'` | IndexedDB |
| `'serviceworkers'` | Service Worker registrations |
| `'cachestorage'` | What the page stored with the Cache API |
| `'filesystem'` | Files the page stored with the file system APIs |
| `'shadercache'` | Nothing. iOS has no equivalent; the name is accepted so code ported from Electron doesn't throw |

Only `'cookies'` and `'localstorage'` have been verified; the other kinds are **not verified in the simulator**.

**`options.origin`** <small>optional</small>

A string; clears only this site's data, written as `'https://shop.my.app'`. Omitted means the whole partition.

- It is matched by domain, regardless of scheme and port: `https://shop.my.app` and `http://shop.my.app:8080` clear the same data.
- Cookies set on the parent domain (`domain` is `.my.app`) are cleared too, because requests to `shop.my.app` carry them.

### Return value

A `Promise` that fulfills with `undefined` once clearing is done. Put whatever must happen after clearing after the `await`.

### Exceptions

Invalid arguments reject the returned Promise rather than throwing immediately.

**`TypeError`**

- `storages` isn't an array: `clearStorageData: storages must be an array, got "cookies"`.
- `storages` contains an unrecognized name: the message lists all accepted names.
- `origin` isn't a valid URL: `clearStorageData: the origin is invalid`.

## Description

Pages already open are affected immediately: reading `localStorage` again gives empty, reading `document.cookie` again gives empty, and new requests carry no cookies. But content already shown on screen doesn't disappear by itself; reload or destroy that page; see [Signing out](../../guides/web-login.md#log-out).

## Examples

### Clearing everything

```js
await session.defaultSession.clearStorageData();
```

**Effect**: All cookies, `localStorage`, and caches in the default partition are cleared.

### Clearing only cookies

```js
await session.defaultSession.clearStorageData({ storages: ['cookies'] });
```

**Effect**: All cookies are gone; `localStorage` remains.

### Clearing only one site's data

```js
await session.defaultSession.clearStorageData({ origin: 'https://shop.my.app' });
```

**Effect**: Data for `shop.my.app` is cleared; other sites are untouched.

## Differences from Electron

`origin` is matched by domain only, regardless of scheme and port. `'shadercache'` is accepted but clears nothing.

Corresponding iOS API: without `origin` it is `-[WKWebsiteDataStore removeDataOfTypes:modifiedSince:completionHandler:]`; with it, `fetchDataRecordsOfTypes:` finds the site's records and then `removeDataOfTypes:forDataRecords:completionHandler:` removes them.

## See also

- [Managing web page sign-in state](../../guides/web-login.md): what to clear on sign-out
- [`Cookies.remove()`](../cookies/remove.md): deleting a single cookie
