---
type: reference
native: "webView:decidePolicyForNavigationAction:decisionHandler:"
---

# `WebContents`: `will-navigate` event

The **`will-navigate`** event fires when the web page itself is about to navigate to another URL and hasn't started yet. Call `preventDefault()` in the listener and the navigation doesn't happen.

## Syntax

```
contents.addEventListener('will-navigate', (event) => {})
```

## Event object

`WebContentsWillNavigateEvent`. Besides `type` and `target`, it has three fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | string | The destination URL |
| `navigationType` | string | What caused this navigation; values below |
| `isMainFrame` | boolean | Always `true`. Navigations inside an `<iframe>` don't fire this event |

Values of `navigationType`:

| Value | Meaning |
| --- | --- |
| `'linkActivated'` | A link was tapped |
| `'formSubmitted'` | A form was submitted |
| `'backForward'` | The page's script went back or forward |
| `'reload'` | The page's script reloaded |
| `'formResubmitted'` | A form was resubmitted, such as going back to a page produced by a form submission (**not verified in the simulator**) |
| `'other'` | Everything else. Most commonly a script changing `location` |

**Cancelable**: `cancelable` is `true`. After `preventDefault()` the page stays where it is and no loading events fire. If the listener throws, it counts as not blocked.

Whether to allow it is decided **the moment the listener returns**. Calling `preventDefault()` after an `await` has no effect. When the decision needs async work, block first, check, then call `loadURL()` yourself; see [Checking before deciding whether to allow it](../../guides/web-pages.md#checking-something-before-deciding-whether-to-allow-navigation).

## When it fires

Only navigations **started by the page itself that switch to another document** fire it.

| Case | Fires? | `navigationType` |
| --- | --- | --- |
| The user taps a link | Yes | `'linkActivated'` |
| The page's script changes `location` | Yes | `'other'` |
| A form is submitted | Yes | `'formSubmitted'` |
| The page's script calls `location.reload()` | Yes | `'reload'` |
| The page's script calls `history.back()` / `forward()` | Yes | `'backForward'` |
| `tel:`, `mailto:`, and custom-scheme links | Yes | As above, depending on what caused it |
| The app calls `loadURL()`, `reload()`, `navigationHistory.goBack()` / `goForward()` | No | |
| Server redirects (301, 302) | No. It fires once, only for the URL before the redirect | |
| Changing only the part after `#` | No | |
| `history.pushState()` | No | |
| Navigations inside an `<iframe>` | No | |

Between the user tapping a link and the navigation actually starting, the listener has to finish running. Don't do slow work in the listener.

`url` comes from the page and is untrusted input; check it before acting on it.

## Examples

### Allowing navigation only to your own domain

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (!e.url.startsWith('https://my.app/')) {
    e.preventDefault();
    console.log('Blocked', e.url, e.navigationType);
  }
});
```

**Effect**

- Tapping a link to `https://other.site/` in the page prints `Blocked https://other.site/ linkActivated`; the page stays where it is and no loading events fire.
- Tapping a link under `https://my.app/` navigates as usual.

### Handling phone links

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (e.url.startsWith('tel:')) {
    e.preventDefault();
    application.openURL(e.url);
  }
});
```

**Effect**: Tapping a `tel:10086` link leaves the page where it is, doesn't fire `did-fail-load`, and hands the URL to the system. The system's call confirmation is **not verified in the simulator** (the simulator can't place calls). Without blocking it, `did-fail-load` fires with `errorCode` `-1002`.

## Differences from Electron

Electron writes `contents.on('will-navigate', (details) => details.preventDefault())`; here it is `contents.addEventListener('will-navigate', (e) => e.preventDefault())`. It adds `navigationType`; there is no `frame` or `initiator`. Electron's `will-redirect` and `will-frame-navigate` don't exist.

The native iOS equivalent is `webView:decidePolicyForNavigationAction:decisionHandler:`; `decisionHandler(.cancel)` corresponds to `e.preventDefault()`, and `navigationType` corresponds to `navigationAction.navigationType`.

## See also

- [Allowing the page to navigate only to your own domain](../../guides/web-pages.md#allowing-the-page-to-navigate-only-within-your-own-domain)
- [Handling phone, email, and custom-scheme links](../../guides/web-pages.md#handling-phone-mail-and-custom-scheme-links)
