---
type: reference
native: WebContentsWillNavigateEvent.url
---

# `WebContentsWillNavigateEvent`: `url` property

The **`url`** property is the URL the page wants to go to.

## Value

A string. It comes from the web page and is untrusted input; check it before acting on it.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (!e.url.startsWith('https://example.com/')) {
    e.preventDefault();
  }
});
```

**Effect**: the page can only go to URLs under `https://example.com/`; other navigations are blocked and the page stays where it is.

## Corresponding iOS API

`navigationAction.request.URL` in `webView:decidePolicyForNavigationAction:decisionHandler:`.

## See also

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
