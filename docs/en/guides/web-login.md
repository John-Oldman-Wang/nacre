# Managing web page sign-in state

This guide shows how the app manages the login state of web pages in a [`WebView`](../api/web-view.md): write login cookies before opening a page, read the cookies a page gets after it logs in itself, clear data on logout, and keep multiple accounts separate. It uses [`Session`](../api/session.md), [`Cookies`](../api/cookies.md), and [`Cookie`](../api/cookie.md).

## Recommended approach

- **Write the login state before opening the web page.** After the app completes login itself, first use [`cookies.set()`](../api/cookies/set.md) to write the token as a cookie, then create the `WebView` and load the page. The page's first request carries it, so a logged-out page is never shown first. Add `httpOnly: true` when writing it so scripts in the page can't read the token. Give an `expirationDate` so the cookie survives an app restart; without one, you need to write it again after a restart.
- **On logout, clear the whole partition, then reload any web pages still open.** Deleting only the login cookie isn't enough: the page may have stored the user's data in `localStorage`.
- **When several accounts are logged in at once, give each account its own `persist:` partition.** Include the account's identifier in the partition name, for example `'persist:user-42'`. Each account's cookies are independent, and logging out of one account clears only its own partition.
- **Do the first read or write at a time that doesn't affect the UI.** After the app launches, the first read or write to a given partition takes 0.6 to 1 second; after that each takes under 1 millisecond (measured). The wait is asynchronous and the UI stays responsive meanwhile, but if you wait for it to finish before opening the page, the user waits that much longer.

## First example

Start from a blank app: write a cookie first, then open the web page, and the page's requests carry it.

```js
application.addEventListener('sceneconnect', async (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Before opening the web page, write the login state as a cookie
  const cookies = session.defaultSession.cookies;
  await cookies.set({
    url: 'https://httpbin.org/',
    name: 'token',
    value: 'abc123',
    httpOnly: true,
    expirationDate: Date.now() / 1000 + 7 * 24 * 3600,
  });

  // 2. Then open the web page. Its first request carries this cookie
  const web = new WebView();
  web.frame = page.view.bounds;
  page.view.addSubview(web);
  await web.webContents.loadURL('https://httpbin.org/cookies');

  // 3. Read which cookies this site has now
  const list = await cookies.get({ url: 'https://httpbin.org/' });
  console.log(list.map((c) => c.name + '=' + c.value).join('; '));
});
```

**Effect**

- The web page on screen shows `{ "cookies": { "token": "abc123" } }`. This address echoes back the cookies carried in the request, which shows the page's request carried it.
- The console prints `token=abc123`.
- The cookie has `httpOnly` set, so a script in the page reading `document.cookie` gets an empty string and can't read it.
- It has an expiration time (7 days later), so it survives an app restart.

The examples below are each self-contained and don't reuse the variables here.

## Read the cookie a page gets after logging in

After the page logs in itself, the app can read the cookies the server wrote, including `httpOnly` ones.

```js
const found = await session.defaultSession.cookies.get({
  url: 'https://my.app/',
  name: 'sid',
});
if (found.length > 0) console.log('Web page is logged in', found[0].value);
```

**Effect**

- If the page has logged in, the console prints that cookie's value.
- Without that cookie, `found` is an empty array; no error is thrown.
- The value read comes from the web page and the server; treat it as untrusted input.

## Log out

Clear the whole partition the web page is in, then reload it. After clearing, content already on screen doesn't disappear by itself, so reload or destroy the web page.

```js
/** @param {WebContents} contents */
async function logout(contents) {
  await contents.session.clearStorageData();
  contents.reload();
}
```

**Effect**

- All data in the web page's partition is cleared: cookies, `localStorage`, IndexedDB, and caches.
- The page reloads, and this time its requests carry no cookies. What it shows after reloading depends on the site and is **not verified in the simulator**.

To clear only cookies and keep everything else:

```js
await session.defaultSession.clearStorageData({ storages: ['cookies'] });
```

**Effect**: All cookies are gone; `localStorage` remains.

To clear only one site:

```js
await session.defaultSession.clearStorageData({ origin: 'https://shop.my.app' });
```

**Effect**

- Data for `shop.my.app` is cleared; other sites are untouched.
- Cookies written on the parent domain (`domain` is `.my.app`) are cleared too, because requests to `shop.my.app` carry them.
- Scheme and port have no effect: `http://shop.my.app:8080` clears the same data.

To delete a single cookie:

```js
await session.defaultSession.cookies.remove('https://my.app/', 'token');
```

**Effect**: The cookie named `token` for this address is gone. If it didn't exist, nothing happens and no error is thrown.

## Get notified when the page logs in or out

```js
const jar = session.defaultSession.cookies;
jar.addEventListener('changed', async () => {
  const sid = await jar.get({ url: 'https://my.app/', name: 'sid' });
  console.log(sid.length > 0 ? 'Logged in' : 'Logged out');
});
```

**Effect**

- Cookies written by the app, by the page's scripts, or by the server, and cookies removed by clearing data, all fire [`changed`](../api/cookies/changed-event.md).
- The event doesn't say which cookie changed, so read again in the callback.
- One change may fire more than once; the code in the callback must tolerate running repeatedly.

## Use different partitions for different accounts

The argument to [`session.fromPartition()`](../api/session/frompartition.md) is written the same way as `webPreferences.partition` on a `WebView`; the same name means the same data.

```js
const work = session.fromPartition('persist:work');
await work.cookies.set({ url: 'https://my.app/', name: 'token', value: 'work-token' });

const workWeb = new WebView({ webPreferences: { partition: 'persist:work' } });
console.log(workWeb.webContents.session === work);
```

**Effect**

- The console prints `true`: the same partition is always the same `Session` object.
- This web page's requests carry `work-token`. Web pages in the default partition and in other partitions can't see this cookie.
- Logging out of this account clears only the `work` partition; other accounts are unaffected.

## Web page cookies and `fetch` cookies are separate

Cookies in a partition belong only to web pages. [`fetch`](../api/fetch.md) has its own set of cookies: cookies written here are not sent with `fetch` requests, and clearing data here doesn't clear `fetch`'s cookies. When the app calls APIs itself with `fetch`, put the token in the request headers yourself.

## See also

- [`Session`](../api/session.md): partitions, clearing data
- [`Cookies`](../api/cookies.md): read, write, and delete cookies
- [`Cookie`](../api/cookie.md): who a cookie belongs to, session cookies
- [`WebView`](../api/web-view.md): specify the partition with `partition` when creating a web page
