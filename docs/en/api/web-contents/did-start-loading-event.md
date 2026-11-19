---
type: reference
native: WKWebView.loading
---

# `WebContents`: `did-start-loading` event

The **`did-start-loading`** event fires when the web page starts loading.

## Syntax

```
contents.addEventListener('did-start-loading', (event) => {})
```

## Event object

`Event`, with no extra fields. Not cancelable.

## When it fires

- When the app calls `loadURL()`, `loadFile()`, `reload()`, or goes back or forward.
- When the user taps a link in the page, or the page's script navigates.

For a successful load, the events arrive in the order `did-start-loading` → `did-navigate` → `did-stop-loading` → `did-finish-load`. After it fires, [`isLoading()`](isloading.md) is `true`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-start-loading', () => console.log('Started loading'));
contents.addEventListener('did-stop-loading', () => console.log('Stopped loading'));
contents.loadURL('https://example.com/');
```

**Result**: It prints `Started loading`, then `Stopped loading`. Use this pair of events to show a loading indicator.

## Differences from Electron

Same as Electron's `did-start-loading`. The native iOS equivalent is `WKWebView.loading` becoming `YES`.

## See also

- [`did-stop-loading`](did-stop-loading-event.md)
- [Knowing how far loading has progressed](../../guides/web-pages.md#knowing-how-far-loading-has-gotten)
