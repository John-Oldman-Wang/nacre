---
type: reference
native: WKWebView
status: partial
---

# `WebContents`

**`WebContents`** represents the web page inside a [`WebView`](web-view.md). Loading URLs, going back and forward, observing the loading process, running scripts in the page, and exchanging messages with the page all happen on it.

`WebView` handles the view itself: position, size, showing and hiding. `WebContents` handles the web page:

| Task | Use | Example |
| --- | --- | --- |
| Change position and size | `WebView` | `web.frame = …`, or constraints |
| Show, hide, opacity | `WebView` | `web.isHidden = true` |
| Rounded corners, border | `WebView` | `web.layer.cornerRadius = 12` |
| Load a URL, go back and forward | `WebContents` | `web.webContents.loadURL(…)` |
| Observe the loading process | `WebContents` | `web.webContents.addEventListener(…)` |

**Inheritance**: [`EventTarget`](event-target.md) → `WebContents`

For how to display web pages, handle load failures, and restrict navigation, see the guide [Displaying web pages](../guides/web-pages.md); for exchanging messages with the page, see [Messaging between a web page and the app](../guides/web-page-messaging.md).

## Constructor

It can't be created with `new`: `new WebContents()` throws `TypeError: Illegal constructor: WebContents is created by the runtime, not by new`. It is created together with the `WebView`, and you get it from [`webView.webContents`](web-view/webcontents.md).

## Instance properties

| Property | Description |
| --- | --- |
| [`navigationHistory`](web-contents/navigationhistory.md) <small>read-only</small> | Back and forward |
| [`ipc`](web-contents/ipc.md) <small>read-only</small> | Answers requests the page sends with `ipcRenderer.invoke` |
| [`session`](web-contents/session.md) <small>read-only</small> | The storage partition this page's data lives in |

## Instance methods

Loading and navigation:

| Method | Description |
| --- | --- |
| [`loadURL()`](web-contents/loadurl.md) | Loads a URL |
| [`loadFile()`](web-contents/loadfile.md) | Loads a local web page file |
| [`stop()`](web-contents/stop.md) | Stops the load in progress |
| [`reload()`](web-contents/reload.md) | Reloads the current URL |

Reading the page's state:

| Method | Description |
| --- | --- |
| [`getURL()`](web-contents/geturl.md) | URL of the current page |
| [`getTitle()`](web-contents/gettitle.md) | Title of the current page |
| [`isLoading()`](web-contents/isloading.md) | Whether it is loading |
| [`isCrashed()`](web-contents/iscrashed.md) | Whether the page's process is gone |

Exchanging data with the page:

| Method | Description |
| --- | --- |
| [`executeJavaScript()`](web-contents/executejavascript.md) | Runs code in the page and gets the result back |
| [`send()`](web-contents/send.md) | Sends a message to the page's preload script |

Destroying:

| Method | Description |
| --- | --- |
| [`close()`](web-contents/close.md) | Destroys the page and frees its memory |
| [`isDestroyed()`](web-contents/isdestroyed.md) | Whether it has been destroyed |

It also has `addEventListener()` and `removeEventListener()`, inherited from `EventTarget`.

## Events

Listen with `addEventListener`. A misspelled event name doesn't throw: it is treated as a custom event that the page never fires, so check names against the table below.

| Event | When it fires |
| --- | --- |
| [`will-navigate`](web-contents/will-navigate-event.md) | The page itself is about to navigate to another URL and hasn't started yet. Cancelable |
| [`did-start-loading`](web-contents/did-start-loading-event.md) | Loading starts |
| [`did-navigate`](web-contents/did-navigate-event.md) | The page has switched to a new document |
| [`did-stop-loading`](web-contents/did-stop-loading-event.md) | Loading stops. Fires on both success and failure |
| [`did-finish-load`](web-contents/did-finish-load-event.md) | Loading finishes |
| [`did-fail-load`](web-contents/did-fail-load-event.md) | Loading fails |
| [`page-title-updated`](web-contents/page-title-updated-event.md) | The title changes |
| [`ipc-message`](web-contents/ipc-message-event.md) | The page's preload script calls `ipcRenderer.send` |
| [`preload-error`](web-contents/preload-error-event.md) | The preload script throws while running |
| [`console-message`](web-contents/console-message-event.md) | The page calls a `console` method, or an exception goes uncaught |
| [`render-process-gone`](web-contents/render-process-gone-event.md) | The page's process is gone |
| [`destroyed`](web-contents/destroyed-event.md) | Destroyed by `close()` |

`will-navigate` is the only cancelable event. The others fire after the fact: `cancelable` is `false`, and calling `preventDefault()` has no effect.

For a successful load, the four loading events arrive in the order `did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`. When the user taps a link in the page that goes to another page, the same four events arrive.

## After destruction

After you call [`close()`](web-contents/close.md), every method other than `close()` and `isDestroyed()` throws `TypeError: Object has been destroyed`; `loadURL()` returns a Promise rejected with the same error. Destruction can't be undone; to show a web page again, create a new `WebView`.

## How values are passed

The result of `executeJavaScript()`, message arguments, and the return value of `invoke` are all passed as JSON.

| Value | After passing |
| --- | --- |
| Numbers, strings, booleans, `null`, arrays, plain objects | Unchanged |
| Order of object members | Same as in the page. The exception is an object produced by `executeJavaScript` running **multiple statements**: the values are correct, but the order isn't guaranteed |
| `undefined` | Stays `undefined` as a standalone value; the member disappears inside an object; becomes `null` inside an array |
| Dates | Strings, such as `'1970-01-01T00:00:00.000Z'` |
| `NaN`, `Infinity` | `null` |
| Functions | A message containing a function throws `TypeError` immediately; an `executeJavaScript` result that is a function is rejected; when the result is an object with a function member, that member disappears |
| `Map` | Empty object `{}` |
| DOM nodes | An `executeJavaScript` result that is a DOM node is rejected |

## Limits of local web pages

A page loaded with [`loadFile()`](web-contents/loadfile.md) has a URL starting with `file://`. It differs from a page loaded from a server in a few ways.

| | Local web page |
| --- | --- |
| Referencing stylesheets, classic scripts, and images by relative path | Works |
| `?` and `#` in the URL | Work; the page can read them |
| `localStorage`, cookies | Work |
| `<script type="module">` | **Doesn't run** |
| Reading local files with `fetch` or `XMLHttpRequest` | **Fails** |
| Origin | All local web pages share one: `file://`. Their `localStorage` is shared |
| Which files it can read | Pages inside the app bundle: the whole app bundle. Pages elsewhere: their own directory and its subdirectories. The simulator doesn't enforce this limit; test it on a device |

Requests from a local web page to `https://` APIs are unaffected; only reading local files is restricted.

`loadFile()` suits static pages and pages bundled the traditional way (a single classic `<script>`). For pages that use module scripts or `fetch` (such as Vite's default build output), register a custom protocol with [`session.protocol`](session/protocol.md) and load from an address like `app://local/`: the page has its own origin, module scripts run, and same-origin `fetch` can read files. See [Loading local web pages through a custom protocol](../guides/web-pages.md#loading-local-web-pages-through-a-custom-protocol).

## Examples

```js
const web = new WebView();
const contents = web.webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log('Load failed', e.errorCode, e.validatedURL);
});
await contents.loadURL('https://example.com/');
console.log(contents.getURL(), contents.isLoading());
```

**Result**: On success, it prints `https://example.com/ false`. On failure, it first prints `Load failed` with the error code, and the `await` line throws the rejection error.

## Comparison with Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => …)` | `contents.addEventListener('did-fail-load', (e) => …)` | Data is on `e`, with the same field names |
| `contents.on('will-navigate', (details) => details.preventDefault())` | `contents.addEventListener('will-navigate', (e) => e.preventDefault())` | Adds `navigationType`; no `frame` or `initiator` |
| `httpStatusText` on `did-navigate` | None | The system doesn't provide it |
| `details.reason` on `render-process-gone` | None | The system doesn't give a reason |
| `errorCode` on `did-fail-load` (`-105` and so on) | `errorCode` (`-1003` and so on) | Different numbers |
| `contents.executeJavaScript(code)` | Same | Code with multiple statements doesn't wait for Promises, and returned objects don't guarantee member order; results are passed as JSON (dates are strings, `Map` is `{}`) |
| `contents.on('ipc-message', (event, channel, ...args) => …)` | `contents.addEventListener('ipc-message', (e) => …)` | `e.channel`, `e.args` |
| `contents.send(channel, ...args)`, `contents.ipc.handle(channel, listener)` | Same | |
| `contents.session` | Same | See [`session`](session.md) |
| `contents.loadFile(filePath, { query, search, hash })` | Same | Relative paths start from the app bundle. Local web pages have more limits than in Electron; see [Limits of local web pages](#limits-of-local-web-pages) |
| `contents.navigationHistory.goBack()` | Same | |
| `contents.loadURL(url, { baseURLForDataURL })` | Same | The second argument supports only `baseURLForDataURL` |
| `contents.on('console-message', (details) => …)` | `contents.addEventListener('console-message', (e) => …)` | No `frame`; uncaught exceptions also fire it |
| `contents.close()` / `isDestroyed()` / `'destroyed'` | Same | |

## Corresponding iOS API

| ObjC (`WKWebView`) | JS |
| --- | --- |
| `[webView loadRequest:]` | `contents.loadURL(url)` |
| `[webView loadHTMLString:html baseURL:base]` | `contents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html), { baseURLForDataURL: base })` |
| `[webView loadFileURL:allowingReadAccessToURL:]` | `contents.loadFile(filePath)`. The runtime decides the readable directory from the file's location |
| `webView.URL` | `contents.getURL()` |
| `webView.title` | `contents.getTitle()`, the `page-title-updated` event |
| `webView.loading` | `contents.isLoading()`, the `did-start-loading` / `did-stop-loading` events |
| `[webView stopLoading]` | `contents.stop()` |
| `[webView reload]` | `contents.reload()` |
| `webView.canGoBack` / `canGoForward` | `contents.navigationHistory.canGoBack()` / `canGoForward()` |
| `[webView goBack]` / `[webView goForward]` | `contents.navigationHistory.goBack()` / `goForward()` |
| `[webView evaluateJavaScript:completionHandler:]`, `callAsyncJavaScript:…` | `contents.executeJavaScript(code)` |
| `WKScriptMessageHandlerWithReply` | `ipcRenderer` in the preload script; the `ipc-message` event and `ipc.handle` on the app side |
| `webView:decidePolicyForNavigationAction:decisionHandler:` | The `will-navigate` event; `decisionHandler(.cancel)` corresponds to `e.preventDefault()` |
| `navigationAction.navigationType` | The event's `navigationType` |
| `webView:didCommitNavigation:` | The `did-navigate` event |
| `webView:didFinishNavigation:` | The `did-finish-load` event |
| `webView:didFailNavigation:withError:`, `webView:didFailProvisionalNavigation:withError:` | The `did-fail-load` event |
| `webViewWebContentProcessDidTerminate:` | The `render-process-gone` event |
| Releasing the `WKWebView` | `contents.close()` |

## See also

- [`WebView`](web-view.md): the view that holds this page, plus the explanation of preload scripts and storage partitions.
- [Displaying web pages](../guides/web-pages.md): the complete pattern for loading, handling failures, and restricting navigation.
- [Messaging between a web page and the app](../guides/web-page-messaging.md)
- [`NavigationHistory`](navigation-history.md), [`WebContentsIPC`](web-contents-ipc.md): obtained from properties of this object.
- [`session`](session.md): reading and writing the page's cookies, clearing data.
