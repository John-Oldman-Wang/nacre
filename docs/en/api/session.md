---
type: reference
native: WKWebsiteDataStore
status: partial
---

# `Session`

**`Session`** represents a storage partition: cookies, `localStorage`, IndexedDB, caches, and other data left by web pages in a [`WebView`](web-view.md) are all stored in some partition. Through `Session`, the app can read and write the partition's cookies, and clear the data in it.

Each partition is a separate set of data. Web pages in the same partition share data: sign in on one page, and another page in the same partition is signed in too. Different partitions can't see each other's data. Which partition a page uses is set with `webPreferences.partition` when the `WebView` is created, and can't be changed afterward. For how to write partition names, see [Partitions](#partitions).

This group has two more types:

- [`Cookies`](cookies.md): a partition's cookies, obtained from the [`cookies`](session/cookies.md) property.
- [`Cookie`](cookie.md): each record you get when reading cookies.

**Inheritance**: `NSObject` → `Session`

For how to set up sign-in state before opening a page, clear data on sign-out, and keep multiple accounts separate, see the guide [Managing web page sign-in state](../guides/web-login.md).

## Constructor

It can't be created with `new`: `new Session()` throws `TypeError: Illegal constructor: Session is created by the runtime, not by new`.

There are two ways to get a `Session`; the same partition gives the same object either way:

- [`session.defaultSession`](session/defaultsession.md) and [`session.fromPartition()`](session/frompartition.md) on the global object `session`. These work without creating a web page first.
- A page's `webView.webContents.session`: the partition that page uses; see [`WebView`](web-view.md).

A `Session` object exists from its first use until the app exits. You can store it anywhere, or get it again each time you use it.

## Static properties

The global object `session` needs no creating and is available at any time.

[`session.defaultSession`](session/defaultsession.md) <small>read-only</small>

The default partition. Shared by all web pages that don't specify `partition`.

## Static methods

[`session.fromPartition()`](session/frompartition.md)

Gets a partition by name. Partition names are written the same way as `webPreferences.partition`.

## Instance properties

| Property | Description |
| --- | --- |
| [`cookies`](session/cookies.md) <small>read-only</small> | This partition's cookies |

## Instance methods

| Method | Description |
| --- | --- |
| [`isPersistent()`](session/ispersistent.md) | Whether this partition's data survives an app restart |
| [`clearStorageData()`](session/clearstoragedata.md) | Clears data in this partition; can be limited to certain kinds or to one site |

## Partitions

| Written as | Which data | Used by | After an app restart |
| --- | --- | --- | --- |
| `session.defaultSession` | The default set | All web pages that don't specify `partition` | Data is kept |
| `session.fromPartition('persist:name')` | The set for that name | Web pages whose `partition` is the same name | Data is kept |
| `session.fromPartition('name')` (without `persist:`) | The set for that name, in memory only | Web pages whose `partition` is the same name | Data is gone |

- `session.fromPartition('')` and `session.fromPartition('persist:')` are both `session.defaultSession`.
- In partitions whose "data is kept", cookies without an expiration date are the exception: they are gone after the app restarts; see [Session cookies](cookie.md#session-cookies-and-cookies-with-an-expiration-time).
- A partition's data belongs to this app only. Other apps and Safari can't read it (per the iOS definition; **not verified in the simulator**).
- After the app launches, the first read or write of a partition takes 0.6 to 1 second; after that each takes under 1 millisecond (measured). This is an asynchronous wait; the interface stays responsive meanwhile.

> **Note:** Cookies in a partition belong to web pages only. [`fetch`](fetch.md) has its own set of cookies, and the two aren't connected: cookies written here aren't sent with `fetch` requests, and clearing data here doesn't clear `fetch`'s cookies.

## Examples

### Setting up sign-in state before opening a page

Starting from a blank app: write a cookie first, then open the page, and the page's requests carry it.

```js
application.addEventListener('sceneconnect', async (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const cookies = session.defaultSession.cookies;
  await cookies.set({
    url: 'https://httpbin.org/',
    name: 'token',
    value: 'abc123',
    httpOnly: true,
    expirationDate: Date.now() / 1000 + 7 * 24 * 3600,
  });

  const web = new WebView();
  web.frame = page.view.bounds;
  page.view.addSubview(web);
  await web.webContents.loadURL('https://httpbin.org/cookies');

  const list = await cookies.get({ url: 'https://httpbin.org/' });
  console.log(list.map((c) => c.name + '=' + c.value).join('; '));
});
```

**Effect**

- The web page on screen shows `{ "cookies": { "token": "abc123" } }`. This URL echoes the cookies sent with the request, which shows the page's request carried it.
- The console prints `token=abc123`.
- This cookie is set `httpOnly`, so a script in the page reading `document.cookie` gets an empty string.
- It has an expiration date (7 days later), so it survives an app restart.

### Signing out

```js
await session.defaultSession.clearStorageData();
```

**Effect**: All cookies, `localStorage`, and caches in the default partition are cleared. Pages already open send their next requests without cookies.

## Differences from Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `require('electron').session` | The global `session` | No import needed |
| `session.defaultSession`, `session.fromPartition(partition)` | Same | |
| `contents.session` | Same | |
| `ses.cookies` | Same | See [`Cookies`](cookies.md#differences-from-electron) |
| `ses.clearStorageData({ origin, storages })` | Same | `origin` is matched by domain only, regardless of scheme and port |
| `ses.isPersistent()` | Same | |

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `WKWebsiteDataStore.defaultDataStore` | `session.defaultSession` |
| `[WKWebsiteDataStore dataStoreForIdentifier:]`, `nonPersistentDataStore` | `session.fromPartition(partition)` |
| `webView.configuration.websiteDataStore` | `webView.webContents.session` |
| `dataStore.httpCookieStore` | `ses.cookies` |
| `dataStore.isPersistent` | `ses.isPersistent()` |
| `[dataStore removeDataOfTypes:modifiedSince:completionHandler:]` | `ses.clearStorageData({ storages })` |
| `[dataStore fetchDataRecordsOfTypes:…]` plus `removeDataOfTypes:forDataRecords:…` | `ses.clearStorageData({ origin })` |

## See also

- [Managing web page sign-in state](../guides/web-login.md): writing sign-in cookies, signing out, multiple accounts, reading cookies after the page signs in
- [`Cookies`](cookies.md): reading, writing, and deleting cookies; notifications when cookies change
- [`Cookie`](cookie.md): the fields each cookie you read has
- [`WebView`](web-view.md): use `partition` when creating a page to choose its partition; `webContents.session` gets the corresponding `Session`
- [`fetch`](fetch.md): its cookies are a separate set, not connected to these
