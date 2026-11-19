---
type: reference
native: "-[WKHTTPCookieStoreObserver cookiesDidChangeInCookieStore:]"
---

# `Cookies`: `changed` event

The **`changed`** event fires when the cookies of this partition change.

## Syntax

```
cookies.addEventListener('changed', (event) => { })
```

## Event object

`Event`, with no fields other than `type` and `target`. The event only says "something changed"; it does not say which cookie, or whether it was added or deleted. After receiving it, read again yourself with [`get()`](get.md).

Not cancelable.

## When it fires

- For cookies written by the app, by the page's scripts, or by the server, and for cookies cleared by clearing data.
- One change may fire it more than once. Measured: five writes, one overwrite, and two deletions produced 7 events in total. Code in the callback must tolerate running repeatedly.
- It starts being received after the first listener is added, and is no longer received after the last listener is removed.

## Examples

```js
const cookies = session.defaultSession.cookies;
const onChanged = async () => {
  const sid = await cookies.get({ url: 'https://my.app/', name: 'sid' });
  console.log(sid.length > 0 ? 'Signed in' : 'Signed out');
};
cookies.addEventListener('changed', onChanged);
```

**Effect**: When the page signs in or out, the console prints `Signed in` or `Signed out`, possibly several times in a row.

When no longer needed:

```js
const cookies = session.defaultSession.cookies;
/** @type {EventListener} */
const onChanged = () => console.log('Cookies changed');
cookies.addEventListener('changed', onChanged);
cookies.removeEventListener('changed', onChanged);
```

**Effect**: After removing it, no more events are received.

## Differences from Electron

Electron's listener receives `(event, cookie, cause, removed)`; there is no `cookie`, `cause`, or `removed` here: the system's notification does not carry them.

The corresponding iOS API is `cookiesDidChangeInCookieStore:` of `WKHTTPCookieStoreObserver`.

## See also

- [`get()`](get.md): read again after receiving it
