# Handling links that open the app

This guide shows how, when the user taps a link to your app in another app or a web page, to receive that link and jump to the matching page. It uses the [`openurl`](../api/application/openurl-event.md) event on [`application`](../api/application.md), whose event object is an [`OpenURLEvent`](../api/open-url-event.md).

Two kinds of links can open an app: custom schemes (`myapp://orders/42`) and universal links (addresses starting with `https://` whose domain the system has verified). For how to configure each, see [Configuring the app](project-config.md#declaring-a-custom-scheme). On the JS side both arrive as `openurl`; tell them apart by how `url` starts.

The behavior in this guide is **not verified in the simulator**; registering listeners and the event object's fields and construction have assertions in the acceptance tests.

## Recommended approach

- **Build the interface synchronously in the `sceneconnect` callback, and only navigate in the `openurl` callback.** `openurl` always comes after `sceneconnect` for the same scene, so when its callback runs the interface is already there, and "the app was launched by a link" and "the app was opened by a link while running" use the same code. If the interface can only be built after an asynchronous result (for example, reading local storage first), it may not be ready when the `openurl` callback runs; in that case, store `e.url` in a variable first and handle it after the interface is built.
- **Register the listener at the top level of `main.js`.** When the app is opened by a link while not running, the event fires after that scene's `sceneconnect`; the event isn't delivered again later, and there is no other way to find out "which link launched the app".
- **The address is external input and can't be trusted directly.** Any app or any web page can put together an address starting with `myapp://` to open your app. The runtime doesn't check the address's content and hands it to JS as is. Jumping to a page based on the address is fine; actions like transferring money, changing settings, or signing in must not be carried out based only on parameters in the address; have the user confirm in the interface. Custom schemes have another problem: other apps can declare the same scheme name, and then there's no guarantee which app the system hands the link to. Universal links don't have this problem, since the system has verified the domain; but the path and parameters in the link can still be put together by anyone.

## First link

First declare the scheme in `nacre.config.json`:

```json
{ "ios": { "urlSchemes": ["myapp"] } }
```

Then listen for `openurl` at the top level of `main.js`. `e.url` is a string; take it apart with [`URL`](../api/url.md):

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log('Opened', url.protocol, url.hostname, url.pathname, url.searchParams.get('ref'));
});
```

**Effect** (**not verified in the simulator**): When another app or web page opens `myapp://orders/42?ref=mail`, the app comes to the foreground and the console prints `Opened myapp: orders /42 mail`. If the app wasn't running at the time, the system launches it first, and this line is printed after the `sceneconnect` callback finishes.

In the simulator you can try it without another app by running this in Terminal:

```bash
xcrun simctl openurl booted 'myapp://orders/42?ref=mail'
```

## Jumping to a page based on the link

In the callback, use `e.scene` to find the interface. The example below keeps each scene's navigation controller in a `Map`:

```js
/** @type {Map<UIWindowScene, UINavigationController>} */
const navigators = new Map();

application.addEventListener('sceneconnect', (e) => {
  const home = new UIViewController();
  home.title = 'Home';
  home.view.backgroundColor = 'systemBackground';
  const nav = new UINavigationController(home);
  const win = new UIWindow(e.scene);
  win.rootViewController = nav;
  win.makeKeyAndVisible();
  navigators.set(e.scene, nav);
});

application.addEventListener('scenedisconnect', (e) => {
  navigators.delete(e.scene);
});

application.addEventListener('openurl', (e) => {
  const nav = navigators.get(e.scene);
  if (nav === undefined) return;
  const url = new URL(e.url);
  if (url.hostname !== 'orders') return;   // Ignore addresses we don't recognize
  const page = new UIViewController();
  page.title = 'Order ' + url.pathname.slice(1);
  page.view.backgroundColor = 'systemBackground';
  nav.pushViewController(page, { animated: true });
});
```

**Effect** (**not verified in the simulator**): Opening `myapp://orders/42` pushes a page titled "Order 42" onto the navigation stack. When the app was launched by this link, the home page appears first and the order page is pushed right after. Opening `myapp://settings` does nothing.

A universal link's `url` starts with `https://`; take it apart the same way in the callback.

## Simulating an open in tests

```js
application.addEventListener('sceneconnect', (e) => {
  application.dispatchEvent(new OpenURLEvent('openurl', {
    url: 'myapp://orders/42',
    scene: e.scene,
  }));
});
```

**Effect**: The `openurl` listener is called once, with `e.url` set to `'myapp://orders/42'` and `e.sourceApplication` set to `null`. Nothing happens on the system side. See [`OpenURLEvent()`](../api/open-url-event/constructor.md).

## See also

- [`openurl`](../api/application/openurl-event.md), [`OpenURLEvent`](../api/open-url-event.md)
- [Configuring the app](project-config.md#declaring-a-custom-scheme): declaring custom schemes and universal link domains
- [`URL`](../api/url.md): taking addresses apart
- [Navigating between view controllers](navigation.md)
