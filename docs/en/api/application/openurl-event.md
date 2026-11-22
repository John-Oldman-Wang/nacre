---
type: reference
native: "-[UISceneDelegate scene:openURLContexts:]"
---

# `Application`: `openurl` event

The **`openurl`** event fires when another app or a link opens this app.

## Syntax

```
application.addEventListener('openurl', (event) => { })
```

## Event object

[`OpenURLEvent`](../open-url-event.md):

| Field | Type | Meaning |
| --- | --- | --- |
| [`url`](../open-url-event/url.md) | string | The full address the system provided, unchanged |
| [`scene`](../open-url-event/scene.md) | [`UIWindowScene`](../ui-window-scene.md) | The scene the system handed the address to |
| [`sourceApplication`](../open-url-event/sourceapplication.md) | string or `null` | The bundle ID of the source app. `null` when the system doesn't provide it |

`target` is `application`. For `openurl` events dispatched by the runtime, `cancelable` is `false`.

## When it fires

There are two kinds of links that can open the app:

- **Custom schemes**: addresses like `myapp://orders/42`. The scheme name (`myapp`) is declared in `ios.urlSchemes` in `nacre.config.json`; only after it's declared does the system hand such addresses to this app. The system doesn't hand undeclared schemes to this app, so there's no event for them.
- **Universal links**: ordinary `https://` addresses. You declare the associated domain in the project and place a file on that domain's website; only after the system verifies it does it hand links under that domain to this app.

For how to configure each, see [Configuring the app](../../guides/project-config.md#declaring-a-custom-scheme). On the JS side both arrive as `openurl`; tell them apart by the start of `url`.

- **It's received even when the app isn't running.** If the app hasn't launched when the user taps the link, the system launches it first; the runtime fires `openurl` after that scene's [`sceneconnect`](sceneconnect-event.md). So register the listener at the top level of `main.js`. The event isn't replayed, and there's no other way to find out which link launched the app.
- When the app is already running (in the foreground, or in the background and not yet terminated by the system), only `openurl` fires, not `sceneconnect`.
- When the system delivers several addresses at once, the event fires once per address.
- When this app calls [`openURL()`](openurl.md) itself to open another app, this event doesn't fire.
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

The behavior in this section is **not verified in the simulator**; registering the listener and the fields and construction of the event object are asserted in the acceptance tests.

> **Note:** The address is external input. Any app or web page can construct an address starting with `myapp://` to open this app, and the runtime doesn't check the address's contents. Operations such as transferring money, changing settings, or signing in must not be performed based solely on parameters in the address; see the guide [Handling links that open the app](../../guides/open-links.md).

## Examples

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log('Opened', url.protocol, url.hostname, url.pathname, url.searchParams.get('ref'));
});
```

**Effect** (**not verified in the simulator**): when another app or a web page opens `myapp://orders/42?ref=mail`, the app comes to the foreground and the console prints `Opened myapp: orders /42 mail`.

In the simulator you can try it without another app by running this in Terminal:

```bash
xcrun simctl openurl booted 'myapp://orders/42?ref=mail'
```

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `scene:openURLContexts:` | `openurl` |
| `scene:continueUserActivity:` with activity type `NSUserActivityTypeBrowsingWeb` | `openurl` |
| `URLContexts` and `userActivities` of `connectionOptions` in `scene:willConnectToSession:options:` | The same `openurl`, fired after `sceneconnect` |
| `UIOpenURLContext.URL`, `NSUserActivity.webpageURL` | `e.url` |
| `UIOpenURLContext.options.sourceApplication` | `e.sourceApplication` |

## See also

- [Handling links that open the app](../../guides/open-links.md)
- [`OpenURLEvent`](../open-url-event.md)
- [Configuring the app](../../guides/project-config.md#declaring-a-custom-scheme)
- [`URL`](../url.md): taking an address apart
