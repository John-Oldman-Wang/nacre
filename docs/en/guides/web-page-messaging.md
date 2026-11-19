# Messaging between a web page and the app

This guide covers how a web page calls the app's features, how it asks the app for a result, and how the app notifies the web page. The web page side uses [`ipcRenderer`](../api/ipc-renderer.md) and [`contextBridge`](../api/context-bridge.md); the app side uses [`WebContents`](../api/web-contents.md) and [`WebContentsIPC`](../api/web-contents-ipc.md).

If you only need to read the page's content or change the page, you don't need messages; use [`executeJavaScript()`](../api/web-contents/executejavascript.md). See [Displaying web pages](web-pages.md#reading-content-from-the-web-page).

## Recommended approach

- **Configure a preload script only for web pages you control.** Don't configure one for a `WebView` that loads third-party sites, so those pages have no message channel. When the same app has both your own pages and third-party pages, create two `WebView`s.
- **Check every message on the app side.** The preload script and the page's scripts aren't isolated from each other; any script in the page can send messages, and the arguments can be any value. For how, see [Checking every message on the app side](#checking-every-message-on-the-app-side).
- **Use `will-navigate` to restrict where the page can go.** Once the page navigates to another site, that site's scripts get the message channel too. For how, see [Allowing the page to navigate only within your own domain](web-pages.md#allowing-the-page-to-navigate-only-within-your-own-domain).
- **Expose as few methods as possible from the preload script, each doing one thing.** Provide specific methods such as `share(id)`, not general-purpose ones such as "run any command" or "read any key".

For why, see [Web content isn't trusted](../api/web-view.md#web-content-is-untrusted).

## The first message

For the web page to have the app do something (share, close the screen, get the login state), there are two steps: a **preload script** places an object in the page, and the page calls that object; the object's methods send messages to the app.

A preload script is a separate JS file packaged with the app. It runs in the web page, not in the app's JS, so it can't go in `main.js` and can't use any of the app's objects. It can use two names: `ipcRenderer` and `contextBridge`. These two names currently have no type definitions, so the code in the preload script and the web page below doesn't take part in type checking.

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
});
```

On the app side, starting from a blank app, specify the preload script when creating the `WebView` and listen for messages:

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
  web.frame = page.view.bounds;
  page.view.addSubview(web);

  web.webContents.addEventListener('ipc-message', (e) => {
    if (e.channel === 'share') console.log('Page wants to share', e.args[0]);
  });
  web.webContents.loadURL('https://my.app/');
});
```

In the web page:

```html
<button onclick="app.share(42)">Share</button>
```

**Effect**

- When the page calls `app.share(42)` (for example, when the user taps that button), the app's console prints `Page wants to share 42`.
- In the page, `typeof app` is `'object'`. It's already there when the page's own first script runs.
- `ipcRenderer` and `contextBridge` are available only to the preload script; in the page, `typeof ipcRenderer` is `'undefined'`.
- If the preload script file can't be read or has a syntax error, `new WebView` throws on the spot. If it throws while running, the page loads as usual and [`preload-error`](../api/web-contents/preload-error-event.md) fires on `webContents`.

The following sections reuse a `web` configured with a preload script. To try a section on its own, write this line first:

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
```

## Checking every message on the app side

Any script in the page (including third-party scripts it loads) can call `app.share`, and can also bypass it and send messages directly. Treat everything received in [`ipc-message`](../api/web-contents/ipc-message-event.md) as untrusted input and check it.

```js
const contents = web.webContents;

contents.addEventListener('ipc-message', (e) => {
  // Accept only messages from your own site
  if (!contents.getURL().startsWith('https://my.app/')) return;

  if (e.channel === 'share') {
    const id = e.args[0];
    // Check both the type and the range of the argument
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return;
    console.log('Share', id);
  }
});
```

**Effect**

- When the page is under `https://my.app/` and sends `share` with a positive integer, the console prints `Share` and the number.
- When the page has navigated to another site, or the argument isn't a positive integer, the message is ignored.

## Having the page ask the app for a result

When the page needs to wait for the app to return a value, the preload script uses [`ipcRenderer.invoke()`](../api/ipc-renderer/invoke.md), and the app registers a handler with [`ipc.handle()`](../api/web-contents-ipc/handle.md).

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  getUser: () => ipcRenderer.invoke('get-user'),
});
```

```js
web.webContents.ipc.handle('get-user', async (event) => {
  // The handler's return value is handed to the page. Return only data this page should see
  if (!event.sender.getURL().startsWith('https://my.app/')) throw new Error('not allowed');
  return { name: application.storage.get('name') };
});
```

In the web page:

```javascript
const user = await app.getUser();
```

**Effect**

- When the page is under `https://my.app/`, `user` in the page is the object the handler returned. The handler can be asynchronous; the page waits until it returns.
- When the page is on another site, the Promise on the page side is rejected with `Error invoking remote method 'get-user': Error: not allowed`.
- When the handler throws, the Promise on the page side is rejected with `Error invoking remote method 'get-user': Error: …`.
- When the app hasn't registered this channel, the page side is likewise rejected, with `Error invoking remote method 'get-user': Error: No handler registered for 'get-user'`.

A channel can have only one handler; registering a second throws `Error: Attempted to register a second handler for 'get-user'`.

## Having the app notify the page

The app sends with [`webContents.send()`](../api/web-contents/send.md), and the preload script receives with [`ipcRenderer.on()`](../api/ipc-renderer/on.md).

```javascript
// JS/web/preload.js
ipcRenderer.on('theme', (event, name) => {
  document.documentElement.dataset.theme = name;
});
```

```js
web.webContents.addEventListener('did-finish-load', () => {
  web.webContents.send('theme', 'dark');
});
```

**Effect**

- After the page finishes loading, `<html>` gets `data-theme="dark"`.
- If the page hasn't loaded yet, or no preload script is configured, nobody receives the message; it's dropped without an error. So send it after `did-finish-load`.
- If the arguments contain a function, `send` throws on the spot: `TypeError: send: functions cannot be sent`.

Messages the preload script receives can't be assumed to come from the app either: the page's scripts can impersonate the app and push messages into the channel.

## What messages can carry

Message arguments and `invoke` results are passed as JSON: numbers, strings, booleans, `null`, arrays, and plain objects arrive unchanged; dates become strings, `Map` becomes `{}`, and functions throw on the spot. For the full rules, see [How values are passed](../api/web-contents.md#how-values-are-passed).

## See also

- [`ipcRenderer`](../api/ipc-renderer.md), [`contextBridge`](../api/context-bridge.md): the two names in the preload script.
- [`WebContents`](../api/web-contents.md): the `ipc-message` event and `send()`.
- [`WebContentsIPC`](../api/web-contents-ipc.md): responding to the page's requests.
- [Preload scripts](../api/web-view.md#preload-scripts): when they run and whether they're isolated from the page's scripts.
- [Displaying web pages](web-pages.md)
