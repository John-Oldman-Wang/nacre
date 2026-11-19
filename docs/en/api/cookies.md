---
type: reference
native: WKHTTPCookieStore
status: partial
---

# `Cookies`

**`Cookies`** represents all the cookies in one storage partition. The app uses it to read, write, and delete the cookies of that partition, and to be notified when cookies change.

The app has full read and write access to the cookies in a partition and is not subject to the restrictions on the web page side:

- It can read the cookies of any site, including those marked `httpOnly` that the page's scripts cannot read.
- Cookies the app writes are sent with the page's next request. Pages already open do not need to reload; reading `document.cookie` shows them (except `httpOnly` ones).
- The app can read cookies written by the page's scripts and cookies written by the server with `Set-Cookie`.

Each cookie read is a [`Cookie`](cookie.md) object.

**Inheritance**: `EventTarget` → `Cookies`

For which partition it belongs to and how partitions differ, see [`Session`](session.md).

## Constructor

Cannot be created with `new`: `Cookies` is not a global. Get it from the [`cookies`](session/cookies.md) property of a `Session`; the same partition gives the same object every time.

## Instance methods

All three methods return a Promise. Invalid arguments reject the Promise rather than throwing on the spot.

| Method | Description |
| --- | --- |
| [`get()`](cookies/get.md) | Reads cookies, optionally filtered |
| [`set()`](cookies/set.md) | Writes a cookie |
| [`remove()`](cookies/remove.md) | Deletes the cookies with a given name for an address |

Also inherits `addEventListener()`, `removeEventListener()`, and `dispatchEvent()` from `EventTarget`.

## Events

| Event | When it fires |
| --- | --- |
| [`changed`](cookies/changed-event.md) | The cookies of this partition changed |

Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Examples

```js
const cookies = session.defaultSession.cookies;
await cookies.set({ url: 'https://my.app/', name: 'token', value: 'abc' });
const list = await cookies.get({ url: 'https://my.app/' });
console.log(list.map((c) => c.name + '=' + c.value).join('; '));
await cookies.remove('https://my.app/', 'token');
```

**Effect**

- The console prints `token=abc` (when `my.app` had no other cookies in this partition).
- After the last line, this cookie is gone.

## Differences from Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `cookies.get(filter)`, `set(details)`, `remove(url, name)` | The same | |
| `cookies.on('changed', (event, cookie, cause, removed) => …)` | `cookies.addEventListener('changed', () => …)` | No `cookie`, `cause`, or `removed` |
| `cookies.flushStore()` | None | The system does not provide it |

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[dataStore.httpCookieStore getAllCookies:]` | `cookies.get(filter)` |
| `[dataStore.httpCookieStore setCookie:completionHandler:]` | `cookies.set(details)` |
| `[dataStore.httpCookieStore deleteCookie:completionHandler:]` | `cookies.remove(url, name)` |
| `cookiesDidChangeInCookieStore:` of `WKHTTPCookieStoreObserver` | The `changed` event |

## See also

- [Managing web page sign-in state](../guides/web-login.md): writing sign-in cookies before opening a page, and reading cookies after the page signs in
- [`Cookie`](cookie.md): which fields each cookie read has
- [`Session`](session.md): partitions, and clearing data
