---
type: reference
native: WKWebView
status: partial
---

# `WebView`

**`WebView`** represents a view that displays a web page. Add it to the UI, have it load a URL, and the web page appears within its bounds, where the user can tap links and fill in forms.

`WebView` handles only the view itself: where it is, how big it is, and whether it is shown or hidden are all done with view properties and methods. The web page inside the view is a [`WebContents`](web-contents.md), obtained from [`webView.webContents`](web-view/webcontents.md). Loading URLs, going back and forward, listening to the loading process, running scripts in the page, and exchanging messages with the page all happen on it.

This group has four more objects:

- [`WebContents`](web-contents.md): the web page inside the view.
- [`NavigationHistory`](navigation-history.md): going back and forward in the web page.
- [`WebContentsIPC`](web-contents-ipc.md): answering requests sent from the web page.
- [`ipcRenderer`](ipc-renderer.md) and [`contextBridge`](context-bridge.md): available only in a [preload script](#preload-scripts); the web page's end of the message channel.

Where the web page's cookies, `localStorage`, and cache are stored is decided by the [storage partition](#storage-partitions); to read and write cookies and clear data, use [`session`](session.md).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `WebView`

For how to display a web page, handle load failures, and restrict which URLs the page can go to, see the guide [Displaying web pages](../guides/web-pages.md). For exchanging messages between the web page and the app, see the guide [Messaging between a web page and the app](../guides/web-page-messaging.md).

## Constructor

[`WebView()`](web-view/constructor.md)

Creates a view that displays web pages. You can specify a storage partition and a preload script, which cannot be changed after creation.

## Instance properties

Also inherits properties from [`UIView`](ui-view.md). Commonly used inherited properties on `WebView` are `frame`, `isHidden`, `layer`, and `translatesAutoresizingMaskIntoConstraints`.

| Property | Description |
| --- | --- |
| [`webContents`](web-view/webcontents.md) <small>read-only</small> | The web page inside the view |

## Instance methods

All inherited from [`UIView`](ui-view.md), such as `addSubview()` and `removeFromSuperview()`.

## How the web page relates to the app

Each web page runs in its own separate process, not the same process as the app's JS. This determines the following:

- **Neither side can access the other's variables.** The page's `window` and `document` do not exist in the app's JS; the app's JS objects and functions do not exist in the page either. Only data can pass between the two, as JSON; see [How values are passed](web-contents.md#how-values-are-passed).
- **The page's scripts do not take the app's time.** However long scripts in the page run, they do not affect the responsiveness of the app's UI.
- **A web page crashing does not make the app quit.** When the page's process crashes or is ended by the system, the page goes blank, the app keeps running, and the [`render-process-gone`](web-contents/render-process-gone-event.md) event fires on `webContents`.

There are three ways to pass data between the app and the web page:

| Method | Direction | When to use it |
| --- | --- | --- |
| [`executeJavaScript()`](web-contents/executejavascript.md) | The app runs a piece of code in the page and gets the result back | The app actively reads content from the page, or changes the page |
| [Preload script](#preload-scripts) and messages | Both directions | The page needs to call the app's features, or the app needs to notify the page |
| The [`will-navigate`](web-contents/will-navigate-event.md) event | When the page is about to navigate, the app gets the destination URL and can block it | Restricting where the page can go; handling `tel:` and custom-scheme links |

## Web content is untrusted

A web page's content comes from a server, and the page may also pull in third-party scripts. The app cannot assume the code running in the page is its own. The runtime draws its boundaries on this premise:

- **The runtime never automatically gives the web page any of the app's capabilities.** A web page without a preload script has no way at all to call the app's JS or read the app's files or storage. It can do only what an ordinary web page can do.
- **The message channel is the only way from the web page into the app.** The page has a message channel only if a [preload script](#preload-scripts) was specified with `webPreferences.preload` when the `WebView` was created. What the app does with a message it receives is decided entirely by the app's own listeners.
- **The preload script and the page's scripts are not isolated.** Both run in the same environment. Once a preload script is configured, any script in the page, including third-party scripts, can call the objects the preload script provides, modify that object's members, or post messages directly to the message channel without going through the preload script. So checks written in the preload script cannot be treated as a security measure; checks must be written on the app side.
- **Content inside an `<iframe>` cannot send messages.** The preload script runs only in the main document, and the app does not accept messages sent from an `<iframe>`.

Data from the web page arrives in three places: the channel names and arguments of messages, the results of `executeJavaScript()`, and the URL in the `will-navigate` event. Treat all three as untrusted input and check their types and value ranges before using them. For how, see [Checking every message on the app side](../guides/web-page-messaging.md#checking-every-message-on-the-app-side).

## Preload scripts

A preload script is a JS file specified with `webPreferences.preload` when the `WebView` is created, and bundled with the app. It runs in the web page, not in the app's JS, so it cannot be written into `main.js` and cannot use any object from the app side.

| | |
| --- | --- |
| When it runs | Each time a web page starts loading, before any of the page's own scripts. There is no `<body>` yet at that point |
| Where it runs | Only in the main document. Not inside an `<iframe>` |
| When the page changes | It runs again |
| What it can use | Everything a web page can use (`document`, `window`), plus the two names [`ipcRenderer`](ipc-renderer.md) and [`contextBridge`](context-bridge.md) |
| The page forbids scripts (Content Security Policy) | It still runs. Only the page's own scripts are restricted |
| It throws while running | The page loads as usual, and [`preload-error`](web-contents/preload-error-event.md) fires on `webContents` |

It runs in the **same environment** as the page's scripts, with no isolation between them. This has four consequences:

- What the preload script attaches to `window` is visible to the page.
- A name attached with `contextBridge.exposeInMainWorld` cannot be replaced with another object by the page, but the page can modify that object's members.
- The page cannot use the names `ipcRenderer` and `contextBridge`, but it can bypass them and post messages directly to the underlying message channel, choosing both the channel name and the arguments.
- The page can impersonate the app and make listeners registered with `ipcRenderer.on` in the preload script receive fake messages.

So preload scripts are suited to web pages the app itself controls. Every message received on the app side must be checked, and messages received by the preload script cannot be assumed to come from the app either.

## Storage partitions

A storage partition is the set of data where a web page's cookies, `localStorage`, and cache are kept. Which one to use is specified with `webPreferences.partition` when the `WebView` is created. A partition's data is stored in the app's own storage space, and neither other apps nor Safari can read it (from the iOS definition; **not verified in the simulator**).

| Value of `partition` | Where the data is stored | After the app quits |
| --- | --- | --- |
| Omitted, or an empty string | The default set. Shared by all web pages that omit `partition` | Still there |
| `'persist:name'` | The set for that name. Shared by web pages with the same name | Still there |
| `'name'` (without `persist:`) | The set for that name, in memory only. Shared by web pages with the same name | Gone |

Different partitions cannot see each other's data. `partition` can only be specified when the `WebView` is created and cannot be changed afterward.

The app can read and write the cookies in a partition and clear its data; see [`session`](session.md).

The web page's cookies and the cookies of [`fetch`](fetch.md) are two separate sets: signing in within the web page does not give `fetch` the signed-in state, and vice versa.

## Web features that differ from a browser

| Web feature | In `WebView` |
| --- | --- |
| Tapping links, submitting forms, navigating from script | Normal. The app can block them with `will-navigate` |
| `localStorage`, cookies | Normal, stored in the [storage partition](#storage-partitions) |
| Plain `http://` URLs | Blocked by the system; loading fails. `http://localhost` is the exception |
| Opening a new window (`window.open`, links with `target="_blank"`) | Nothing happens; the page stays where it is. The script-triggered case is measured; a real user tap on a `target="_blank"` link is **not verified in the simulator** |
| Downloading a file (a URL pointing to content that cannot be displayed, such as an archive) | No download. Loading fails, `did-fail-load` fires, and `errorCode` is `102` |
| `alert()`, `confirm()`, `prompt()` | No dialog is shown. **Not verified in the simulator** |
| File selection (`<input type="file">`), camera, microphone, location | **Not verified in the simulator** |
| Swiping right from the left edge of the screen to go back | Not available. Go back with [`navigationHistory.goBack()`](navigation-history/goback.md) |

Web pages loaded from local files have some extra restrictions; see [Restrictions on local web pages](web-contents.md#limits-of-local-web-pages).

## What the web page can detect

Changes on the view side can all be detected in the web page with standard web APIs.

| What happens on the view side | What the web page sees |
| --- | --- |
| The view's width or height changes | `window.innerWidth` / `innerHeight` change accordingly and `resize` fires. 1 [pt](units.md) corresponds to 1 CSS px |
| The view extends outside the safe area | `env(safe-area-inset-*)` gives the obscured widths; requires `viewport-fit=cover` |
| The system switches between light and dark, or the view is [forced](ui-trait-collection.md) to dark or light | `prefers-color-scheme` changes accordingly, and `matchMedia`'s `change` event fires |
| Setting `isHidden` | **No change.** `visibilitychange` does not fire |
| Removing it from the UI (`removeFromSuperview`) | `visibilityState` becomes `'hidden'` and `visibilitychange` fires |
| Adding it back to the UI | `visibilityState` goes back to `'visible'` and `visibilitychange` fires |
| The app goes to the background and comes back to the foreground | `visibilityState` becomes `'hidden'` and goes back to `'visible'` (**not verified in the simulator**) |

For a web page not in the UI, the system slows down its timers: a `setInterval` with a 100 ms interval runs only about once per second.

## Memory and references

A web page uses a fair amount of memory: a simple page was measured at about 60 MB in the simulator. When memory is tight, the system can end the page's process.

When a web page is no longer needed, destroy it with [`webContents.close()`](web-contents/close.md). After that the page's process exits and its memory is freed; the `WebView` is still a view, just empty, so then remove it from the UI.

Without calling `close()`:

| State of the `WebView` | What happens |
| --- | --- |
| In the UI | It stays, and the page keeps holding its memory. The UI holds it, so you do not need to hold a reference yourself |
| Not in the UI (not yet added, or removed) | If the code holds no reference either, it is garbage-collected, and the page is destroyed with it and its process exits (measured). When collection happens is uncertain, so do not rely on it to free memory; if you want to keep it for later use, hold a reference yourself |

## Examples

### A full-screen web page

Starting from a blank app, display a web page that fills the safe area and print the loading process to the console.

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

  // 2. Everything about the web page is on webContents
  const contents = web.webContents;
  contents.addEventListener('did-navigate', (event) => {
    console.log('Arrived at', event.url, 'status', event.httpResponseCode);
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

- The screen shows the example.com web page. It fills the safe area: its top is below the status bar and its bottom is above the home indicator. The safe area is the part of the screen not covered by the notch, the status bar, or the home indicator; see [Views](ui-view.md).
- Links can be tapped. When the content is larger than the view, it can be scrolled (scrolling is **not verified in the simulator**).
- The console prints `Arrived at https://example.com/ status 200`, `Loaded https://example.com/`, and `Title Example Domain`. The order of the last two lines is not fixed.

### Using a separate partition

```js
const shop = new WebView({ webPreferences: { partition: 'persist:shop' } });
const guest = new WebView({ webPreferences: { partition: 'guest' } });
console.log(shop.webContents.session.isPersistent(), guest.webContents.session.isPersistent());
```

**Result**: Prints `true false`. `shop`'s data remains after the app quits; `guest`'s exists only in memory.

## Comparison with Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `new WebContentsView({ webPreferences })` | `new WebView({ webPreferences })` | Only `partition`, `preload`, and `javascript` are supported |
| `view.setBounds({ x, y, width, height })` | `web.frame = new CGRect(x, y, width, height)` | Constraints can also be used |
| `win.contentView.addChildView(view)` | `page.view.addSubview(web)` | |
| `view.webContents` | `web.webContents` | The same |
| `webPreferences.preload` | The same | Relative paths start from the app bundle. Not isolated, equivalent to `contextIsolation: false` |
| `webPreferences.javascript` | The same | Defaults to `true` |

The mappings for `WebContents`, `ipcRenderer`, and the other objects are on their own pages.

## Corresponding iOS API

| ObjC (`WKWebView`) | JS |
| --- | --- |
| `[[WKWebView alloc] initWithFrame:configuration:]` | `new WebView()` |
| `configuration.websiteDataStore` | `webPreferences.partition` |
| `WKUserScript` (injected at document start, main document only) | `webPreferences.preload` |
| Releasing the `WKWebView` | `contents.close()` |

## See also

- [Displaying web pages](../guides/web-pages.md): complete patterns for loading, handling failure, restricting navigation, and local web pages.
- [Messaging between a web page and the app](../guides/web-page-messaging.md): complete patterns for preload scripts and messages.
- [`WebContents`](web-contents.md): the web page inside the view. Loading and events are on it.
- [Views](ui-view.md): placement, showing and hiding, and rounded corners of a `WebView` all use its members.
- [Auto Layout](auto-layout.md): the constraints the example uses to make the web page fill the safe area.
- [Traits](ui-trait-collection.md): forcing light or dark appearance, which the page's `prefers-color-scheme` follows.
- [`session`](session.md): reading and writing the page's cookies, and clearing data the page left behind.
- [`fetch`](fetch.md): use it when you only need data and do not need to display a web page. Its cookies are separate from the web page's.
