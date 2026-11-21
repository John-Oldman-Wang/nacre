---
type: reference
native: WKURLSchemeHandler
---

# `Protocol`

**`Protocol`** represents the custom protocols of a storage partition. A custom protocol is a URL scheme the app defines itself, such as `app://`: after a directory is registered as a protocol, web pages in this partition that load an address like `app://local/index.html` get their content from that directory.

A web page loaded through a custom protocol has its own origin (`app://local`), so module scripts (`<script type="module">`) run, same-origin `fetch` can read files in the directory, and `localStorage` is kept apart from other pages. A `file://` page loaded with [`loadFile()`](web-contents/loadfile.md) can do none of these.

There is one `Protocol` per partition, obtained from the [`protocol`](session/protocol.md) property of [`Session`](session.md). A registered protocol applies only to [`WebView`](web-view.md)s in this partition **created afterward**.

**Inheritance**: `Protocol` does not inherit from any class.

For when to use it and how to organize the web files, see the guide [Displaying web pages](../guides/web-pages.md#loading-local-web-pages-through-a-custom-protocol).

## Constructor

It can't be created with `new`: `new Protocol()` throws `TypeError: Illegal constructor`.

You get one from:

- `session.defaultSession.protocol`: the default partition's.
- `session.fromPartition(partition).protocol`: a given partition's.
- `webView.webContents.session.protocol`: the partition this page is in.

The same partition gives the same object every time. Different partitions give different objects.

## Instance methods

| Method | Description |
| --- | --- |
| [`serveDirectory()`](protocol/servedirectory.md) | Registers a directory as a protocol: pages created afterward get files from that directory |
| [`unhandle()`](protocol/unhandle.md) | Removes a protocol: pages created afterward no longer recognize it |
| [`isProtocolHandled()`](protocol/isprotocolhandled.md) | Whether this partition currently has the protocol registered |

## Applies only to pages created afterward

Which protocols a web page recognizes is fixed at the moment of `new WebView()`, and doesn't change afterward:

- A page created before the registration that loads an address of this protocol: `loadURL()` rejects.
- After changing the directory or calling `unhandle()`, pages created earlier keep getting files from the original directory.
- Only pages created afterward follow the new registration.

So register first, then create pages. Register once when the app starts, and every page created after that can use it.

## Examples

### Loading web pages bundled in the app

Starting from a blank app. The project's `assets/web/` holds the web files (`index.html` and the module scripts and stylesheets it references); in the app bundle this directory's path is `JS/assets/web`.

```js
application.addEventListener('sceneconnect', async (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // Register first, then create the page
  session.defaultSession.protocol.serveDirectory('app', 'JS/assets/web');

  const web = new WebView();
  web.frame = page.view.bounds;
  page.view.addSubview(web);
  await web.webContents.loadURL('app://local/index.html');
  console.log(await web.webContents.executeJavaScript('location.origin'));
});
```

**Effect**

- The screen shows `assets/web/index.html`. It displays without a network connection.
- `<script type="module">` in the page runs and can `import` other modules in the same directory. Stylesheets load normally.
- The console prints `app://local`.

### Writing the protocol name wrong

```js
try {
  session.defaultSession.protocol.serveDirectory('App', 'JS/assets/web');
} catch (err) {
  console.log(String(err));
}
```

**Effect**: The console prints `TypeError: serveDirectory: "App" is not a valid scheme; use lowercase letters, digits, +, - and ., starting with a letter`. A protocol name must start with a lowercase letter.

## Differences from Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `require('electron').protocol`, one for the whole app | `ses.protocol`, one per partition | A registered protocol applies only to pages in that partition |
| `protocol.registerSchemesAsPrivileged()` | None | A registered protocol has its own origin right away; module scripts, `fetch`, and `localStorage` all work |
| `protocol.handle(scheme, handler)` | `serveDirectory(scheme, directory)` | JS doesn't return content per request; a directory decides it |
| `protocol.unhandle(scheme)` | Same | Pages already created are unaffected |
| `protocol.isProtocolHandled(scheme)` | Same | |

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[configuration setURLSchemeHandler:forURLScheme:]`, plus a `WKURLSchemeHandler` that reads files from a directory | `ses.protocol.serveDirectory(scheme, directory)`, attached to the page's configuration at `new WebView()` |
| `+[WKWebView handlesURLScheme:]` | `serveDirectory()` throws `TypeError` for protocols this returns `YES` for |

## See also

- [Displaying web pages](../guides/web-pages.md#loading-local-web-pages-through-a-custom-protocol): when to use a custom protocol and when to use `loadFile()`
- [`Session`](session.md): storage partitions; the `protocol` property is on it
- [`WebView`](web-view.md): use `partition` when creating a page to choose its partition
- [`loadURL()`](web-contents/loadurl.md): loads an address like `app://`
- [`loadFile()`](web-contents/loadfile.md): loads a local `file://` web page
