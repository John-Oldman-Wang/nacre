# Displaying web pages

This guide covers using [`WebView`](../api/web-view.md) to display web pages in your app: loading addresses and local files, handling load failures, going back and forward, restricting where a page can go, loading ahead of time, destroying a page, and recovering after a crash. Loading and events live on [`WebContents`](../api/web-contents.md); back and forward live on [`NavigationHistory`](../api/navigation-history.md).

For a web page calling into the app and the app notifying the page, see the separate guide [Messaging between a web page and the app](web-page-messaging.md).

## Recommended approach

- **Use constraints to make the `WebView` fill the safe area.** The safe area is the part of the screen that isn't covered by the notch, the status bar, or the home indicator at the bottom. To extend the page under the status bar, see [Extending the page under the status bar and home indicator](#extending-the-page-under-the-status-bar-and-home-indicator).
- **To get the result of a load you started yourself, use the Promise returned by `loadURL()`.** To also handle loads caused by the user tapping links, listen for events.
- **Use `will-navigate` to restrict where the page can go.** This matters especially for a `WebView` with a preload script: once the page navigates to another site, that site's scripts get the message channel too.
- **Call `close()` on pages you no longer use.** A simple web page measured about 60 MB in the simulator. For the reasons, see [Memory and references](../api/web-view.md#memory-and-references).
- **Use `https://`.** Plain-text `http://` addresses are blocked by the system; `http://localhost` is the only exception.

## Your first web page

Starting from a blank app, display a web page that fills the safe area, and log the loading progress to the console.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create a WebView and use constraints to make it fill the safe area
  const web = new WebView();
  web.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(web);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    web.topAnchor.constraintEqualToAnchor(safe.topAnchor),
    web.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor),
    web.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor),
    web.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor),
  ]);

  // 2. Everything about the page is on webContents
  const contents = web.webContents;
  contents.addEventListener('did-navigate', (event) => {
    console.log('Navigated to', event.url, 'status', event.httpResponseCode);
  });
  contents.addEventListener('page-title-updated', (event) => {
    console.log('Title', event.title);
  });
  contents.addEventListener('did-fail-load', (event) => {
    console.log('Load failed', event.errorCode, event.validatedURL);
  });

  // 3. Load. The returned Promise fulfills when loading finishes
  contents.loadURL('https://example.com/').then(() => {
    console.log('Loaded', contents.getURL());
  });
});
```

**Effect**

- The example.com web page appears on screen. It fills the safe area: its top edge is below the status bar, and its bottom edge is above the home indicator.
- Links can be tapped. When the page content is larger than the view, it can be scrolled (scrolling is **not verified in the simulator**).
- The console logs `Navigated to https://example.com/ status 200`, `Loaded https://example.com/`, and `Title Example Domain`. The order of the last two lines is not fixed.

The three steps are: create the `WebView` and put it on the view controller, listen for events on `webContents`, and load. The sections below reuse `page`, `web`, and `contents` from here. To try a section on its own, write the three lines below first, then continue with that section's code:

```js
const page = new UIViewController();
const web = new WebView();
const contents = web.webContents;
```

## Knowing how far loading has gotten

```js
contents.addEventListener('did-start-loading', () => console.log('Started loading'));
contents.addEventListener('did-navigate', (e) => console.log('Navigated to', e.url));
contents.addEventListener('did-stop-loading', () => console.log('Stopped loading'));
contents.addEventListener('did-finish-load', () => console.log('Loaded'));
contents.loadURL('https://example.com/');
```

**Effect**

- Each of the four events fires once, in the order `did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`.
- Reading `contents.isLoading()` right after calling `loadURL` gives `true`; after `did-stop-loading` it gives `false`.
- When the user taps a link in the page to go to another page, these four events fire as well.

To show a loading indicator, use the pair [`did-start-loading`](../api/web-contents/did-start-loading-event.md) and [`did-stop-loading`](../api/web-contents/did-stop-loading-event.md).

## Handling load failures

When loading fails, the Promise returned by `loadURL` is rejected, and the [`did-fail-load`](../api/web-contents/did-fail-load-event.md) event fires. Both carry the same information. Use the Promise when you only care about the load you started yourself; listen for the event when you also want to handle failures from loads caused by the user tapping links.

```js
try {
  await contents.loadURL('https://no-such-host.invalid/');
} catch (err) {
  const failure = /** @type {Error & { code: number }} */ (err);
  console.log(failure.name, failure.code);
}
```

**Effect**

- The console logs `NetworkError -1003`.
- The web view stays on the previous page. It does not go blank and shows no error page. To tell the user that loading failed, show a message yourself.
- `did-fail-load` fires once as well, with `errorCode` `-1003` and `validatedURL` `https://no-such-host.invalid/`.

Listening only for the event without handling the Promise is fine too. A failure does not produce an extra unhandled rejection.

A 404 or 500 from the server **is not a failure**: the error page loads normally and the Promise fulfills. Read the status code from the `httpResponseCode` of the [`did-navigate`](../api/web-contents/did-navigate-event.md) event.

```js
contents.addEventListener('did-navigate', (e) => {
  if (e.httpResponseCode >= 400) console.log('Server returned', e.httpResponseCode);
});
```

**Effect**: When loading an address that returns 404, the console logs `Server returned 404`.

## Showing the page title

```js
contents.addEventListener('page-title-updated', (e) => {
  page.title = e.title;
});
```

**Effect**

- When the web page's title changes, the view controller's title changes with it.
- At the moment of switching pages, you first get an empty string, then get it again once the new page's title arrives.

> **Note:** Don't read `getTitle()` directly in `did-finish-load` or after `loadURL` fulfills. The order of the title and "finished loading" is not fixed, so you may still read an empty string at that point. To get the title, listen for [`page-title-updated`](../api/web-contents/page-title-updated-event.md).

## Back, forward, and reload

```js
const history = contents.navigationHistory;
if (history.canGoBack()) history.goBack();
if (history.canGoForward()) history.goForward();
contents.reload();
```

**Effect**

- `goBack()` returns to the previous page, and `goForward()` returns to the page you were on before going back. Each fires a round of loading events.
- Calling `goBack()` when you can't go back does nothing and doesn't throw.
- `reload()` reloads the current address.

`WebView` has no gesture for going back by swiping right from the left edge of the screen. To go back, put a button in your UI that calls [`goBack()`](../api/navigation-history/goback.md).

## Stopping a load in progress

```js
const loading = contents.loadURL('https://example.com/big');
contents.stop();
loading.catch((err) => console.log(err.name, err.code));
```

**Effect**

- The console logs `AbortError -999`.
- The web view stays on the previous page.

When you call `loadURL` twice in a row, the second call supersedes the first: the first Promise is rejected with `AbortError`, and the second fulfills normally.

## Allowing the page to navigate only within your own domain

When the page itself navigates to another address (the user tapped a link, a script changed `location`, a form was submitted), [`will-navigate`](../api/web-contents/will-navigate-event.md) fires first. Call `preventDefault()` in the listener, and the navigation doesn't happen.

```js
contents.addEventListener('will-navigate', (e) => {
  if (!e.url.startsWith('https://my.app/')) {
    e.preventDefault();
    console.log('Blocked', e.url, e.navigationType);
  }
});
```

**Effect**

- Tapping a link to `https://other.site/` in the page: the console logs `Blocked https://other.site/ linkActivated`, the page stays where it is, and no loading events fire.
- Tapping a link under `https://my.app/`: navigates normally.
- Calling `contents.loadURL(...)`, `reload()`, going back, or going forward yourself **does not fire** this event, so this code doesn't block them.

Server redirects, changes to only the part after `#`, `history.pushState()`, and navigations inside an `<iframe>` don't fire it either. For all the cases, see [`will-navigate`](../api/web-contents/will-navigate-event.md#when-it-fires).

## Handling phone, mail, and custom-scheme links

The web view doesn't understand `tel:`, `mailto:`, or the app's own schemes (such as `myapp://`). If you don't handle them, tapping such links fails to load. Intercept them in `will-navigate` and handle them yourself.

```js
contents.addEventListener('will-navigate', (e) => {
  if (e.url.startsWith('tel:') || e.url.startsWith('mailto:')) {
    e.preventDefault();
    application.openURL(e.url);       // Hand off to the system: dial, compose mail
  } else if (e.url.startsWith('myapp://')) {
    e.preventDefault();
    console.log('The page asks the app to do something', e.url);
  }
});
```

**Effect**

- Tapping a `tel:10086` link: `e.url` is `tel:10086`, the page stays where it is, and `did-fail-load` does not fire. The system shows a call confirmation (**not verified in the simulator**; the simulator can't make calls).
- Tapping a `myapp://share?id=1` link: the console logs `The page asks the app to do something myapp://share?id=1`.
- Without intercepting `tel:` links: `did-fail-load` fires with `errorCode` `-1002`.

Custom-scheme addresses come from the web page and are untrusted input: before acting on one, check that it is one of the kinds the app recognizes.

## Checking something before deciding whether to allow navigation

Whether the navigation is allowed is decided **the moment the listener returns**; you can't call `preventDefault()` after an `await`. When you need an asynchronous decision, block first, then load it yourself after checking.

```js
/** The app's own check. A fixed allowlist stands in for it here
 * @param {string} url */
async function isAllowed(url) {
  return url.startsWith('https://my.app/');
}

contents.addEventListener('will-navigate', async (e) => {
  e.preventDefault();                       // Block first. This line must come before the first await
  const allowed = await isAllowed(e.url);
  if (allowed) contents.loadURL(e.url);
});
```

**Effect**

- The page stays where it is at first. Navigation starts only after `isAllowed` fulfills with `true`.
- Loads started by `loadURL` don't fire `will-navigate`, so they don't enter this listener again.

## Loading web pages bundled in the app

Pages that don't need a network connection, such as terms and help, can be bundled with the app as web files and loaded with [`loadFile()`](../api/web-contents/loadfile.md). Relative paths start from the root of the app bundle. The app bundle is the directory installed on the device; it contains the app's program and the resource files bundled with it, and it is read-only.

```js
await contents.loadFile('JS/web/help.html');
console.log(contents.getURL());

// With the parts after ? and #
await contents.loadFile('JS/web/help.html', { query: { topic: 'fees' }, hash: 'refund' });
```

**Effect**

- It displays without a network connection. Stylesheets, scripts, and images next to the page, referenced with relative paths, load normally.
- The console logs an address that starts with `file:///` and ends with `/JS/web/help.html`.
- On the second load, `location.search` in the page is `?topic=fees` and `location.hash` is `#refund`.
- When the file doesn't exist, the Promise is rejected with `NetworkError`, and `code` is `-1100`.

> **Note:** In local web pages, `<script type="module">` doesn't run, and `fetch` can't read local files. Pages that use these (such as Vite's default build output) can't be loaded this way; see [Limitations of local web pages](../api/web-contents.md#limits-of-local-web-pages).

## Displaying a piece of HTML

When terms or a help article sent by the server is an HTML string, turn it into a `data:` address and load it with [`loadURL()`](../api/web-contents/loadurl.md). There is no need to write it to a file first.

```js
const article = new WebView({ webPreferences: { javascript: false } });
const html = '<!doctype html><meta name="viewport" content="width=device-width">' +
  '<h1>Terms of Service</h1><p>…</p><img src="logo.png">';
await article.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html), {
  baseURLForDataURL: 'https://example.com/legal/',
});
```

**Effect**

- The HTML is displayed. The image is resolved against `baseURLForDataURL`: `https://example.com/legal/logo.png`. **This remote image is not verified in the simulator**; resolving an image in the app bundle by relative path has been verified; see [`loadURL()`](../api/web-contents/loadurl.md#displaying-an-html-string-that-references-an-image-in-the-app-bundle).
- `javascript: false`: even if a `<script>` slips into the content, it doesn't run. When the content is your own and needs scripts, remove this option.
- Without `baseURLForDataURL`, relative paths in the HTML resolve to nothing; absolute addresses load normally. **Not verified in the simulator.**

## Loading web pages the app downloaded

`loadFile` also accepts absolute paths. After the app downloads or writes a web page into its own directories, it can load it directly.

```js
const dir = application.fileSystem.documents + '/pages';
await application.fileSystem.makeDirectory(dir);
await application.fileSystem.writeText(dir + '/notice.html', '<h1>Notice</h1>');
await contents.loadFile(dir + '/notice.html');
```

**Effect**

- "Notice" appears on screen.
- The page can reference files in the same directory and its subdirectories with relative paths. Files outside the directory can't be referenced: on a device, such an image fails to load. The simulator doesn't enforce this restriction, so loading successfully in the simulator doesn't mean it works on a device.

## Reading content from the web page

[`executeJavaScript()`](../api/web-contents/executejavascript.md) runs code in the web page and brings the result back.

```js
const title = await contents.executeJavaScript('document.title');
const count = await contents.executeJavaScript('document.querySelectorAll("a").length');
const status = await contents.executeJavaScript('fetch("/api/ping").then((r) => r.status)');
console.log(title, count, status);
```

**Effect**

- The console logs the page title, the number of links, and the status code of that request.
- The result of the third call is a Promise; it waits for it to fulfill before bringing the result back.
- When the page throws, the Promise on this side is rejected: the error message of `executeJavaScript('throw new Error("boom")')` is `Error: boom`.
- This code isn't restricted by the page's Content Security Policy: it runs even when the page forbids scripts.

When the code is **a single expression**, a Promise result is awaited. When written as multiple statements (`var a = 1; a + 1`), the last value is taken, but a Promise is not awaited. To use `await` across multiple statements, wrap them in an immediately invoked async function:

```js
const text = await contents.executeJavaScript(`(async () => {
  const response = await fetch('/api/user');
  return (await response.json()).name;
})()`);
```

**Effect**: `text` is the `name` returned by the API.

The result is passed back as JSON; see [How values are passed](../api/web-contents.md#how-values-are-passed). The result comes from the web page; check its type and range before using it.

## Loading first, showing when needed

A `WebView` can load without being added to the UI. Create a few ahead of time, and add whichever one you want to show to the UI.

```js
// Load two ahead of time. They aren't in the UI yet, so keep references to them yourself
const pages = {
  help: new WebView(),
  terms: new WebView(),
};
pages.help.webContents.loadURL('https://example.com/help');
pages.terms.webContents.loadURL('https://example.com/terms');

// Later, when you want to show the help page
/** @param {WebView} view */
function show(view) {
  view.frame = page.view.bounds;
  page.view.addSubview(view);
}
show(pages.help);
```

**Effect**

- Both pages load in the background, including network requests. Nothing changes on screen.
- When `show(pages.help)` is called, the help page appears immediately, without waiting to load.

Pages that aren't in the UI differ in two ways:

- `document.visibilityState` in the page reads `'hidden'`.
- The system slows down their timers: a `setInterval` with a 100 ms interval runs only about once per second.

To keep a page running normally before it is shown, add it to the UI and set `isHidden = true`. A hidden view isn't displayed and doesn't receive touches, but the page considers itself visible, and timers run normally.

> **Note:** Keep references yourself to `WebView`s that aren't in the UI yet, as with storing them in `pages` above. A `WebView` with no references is reclaimed, and its page is destroyed along with it. Once it is in the UI, you don't need to worry about this.

## Sharing or isolating sign-in state between pages

A web page's cookies, `localStorage`, and cache are stored in a [storage partition](../api/web-view.md#storage-partitions). Specify which one to use with `partition` when creating the `WebView`.

```js
// These two share one set of data: sign in on one, and the other is signed in too
const shop = new WebView({ webPreferences: { partition: 'persist:shop' } });
const cart = new WebView({ webPreferences: { partition: 'persist:shop' } });

// This one uses a separate set, independent of the two above
const guest = new WebView({ webPreferences: { partition: 'guest' } });
```

**Effect**

- `shop` and `cart` read and write the same cookies and `localStorage`. After the app quits and opens again, the data is still there.
- `guest` can't see their data. After the app quits, `guest`'s data is gone.

To read and write cookies in a partition from the app, or to clear data on sign-out, use [`session`](../api/session.md).

## Destroying a web page

A web page uses a fair amount of memory; when you no longer need it, destroy it with [`close()`](../api/web-contents/close.md).

```js
contents.addEventListener('destroyed', () => console.log('Destroyed'));
contents.close();
console.log(contents.isDestroyed());
web.removeFromSuperview();
```

**Effect**

- The console logs `true`, then `Destroyed`.
- The page disappears from the screen, and the memory it used is released.
- `web` is still a view, just empty. When you no longer need it, remove it from the UI like any other view.
- Calling `contents.getURL()` or other methods afterward throws `TypeError: Object has been destroyed`.
- Destroying can't be undone. To show a web page again, create a new `WebView`.
- For a `loadURL` still in progress when the page is destroyed, its Promise is rejected with `AbortError`.

## Recovering after a web page crashes

Each web page runs in its own separate process. That process may crash, or may be terminated by the system when memory is tight. When that happens, the page goes blank, and the app is unaffected. The runtime does not reload automatically; the app decides whether to recover.

```js
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**Effect**

- When the page's process is terminated, the page reloads and is displayed again.
- Reading `contents.isCrashed()` in the `render-process-gone` callback gives `true`; after reloading it goes back to `false`.
- What you get after reloading is a freshly loaded page. The page's previous state (a half-filled form, variables in scripts) is not restored.
- For a `loadURL` not yet complete when the process went away, its Promise is rejected.

## Extending the page under the status bar and home indicator

In the first example, the page fills only the safe area. To make the page fill the entire screen, attach the constraints to the edges of `page.view` itself, and use CSS in the page to avoid the covered areas.

```js
NSLayoutConstraint.activateConstraints([
  web.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
  web.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
  web.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
  web.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
]);
```

On the page side, write `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, then leave margins with the `env(safe-area-inset-top)` family of CSS values.

**Effect**

- The page's background extends under the status bar and the home indicator.
- On iPhone Air, `env(safe-area-inset-top)` in the page is 68px and `env(safe-area-inset-bottom)` is 34px, equal to the window's `safeAreaInsets` (68 pt, 34 pt).
- When the page fills only the safe area, both values are 0.

For how the page perceives other changes on the view side (size, light and dark appearance, removal from the UI), see [What the web page can perceive](../api/web-view.md#what-the-web-page-can-detect).

## See also

- [`WebView`](../api/web-view.md): the view itself, plus storage partitions and which web features differ from browsers.
- [`WebContents`](../api/web-contents.md): all members for loading, events, and running scripts.
- [`NavigationHistory`](../api/navigation-history.md): going back and forward.
- [Messaging between a web page and the app](web-page-messaging.md)
- [`session`](../api/session.md): reading and writing the page's cookies, clearing data.
- [Auto Layout](../api/auto-layout.md): the constraints used to make the page fill the safe area.
