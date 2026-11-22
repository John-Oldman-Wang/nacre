---
type: reference
native: WebContentsDidNavigateEvent.url
---

# `WebContentsDidNavigateEvent`: `url` property

The **`url`** property is the new URL.

## Value

A string. After a server redirect, it is the URL after the redirect. **Not verified in the simulator.**

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-navigate', (e) => {
  console.log('现在在', e.url);
});
contents.loadURL('https://example.com');
```

**Effect**: once the page loads, prints `现在在 https://example.com/`. **Not verified in the simulator.**

## Corresponding iOS API

`webView.URL`, read at `webView:didCommitNavigation:`.

## See also

- [`WebContentsDidNavigateEvent`](../web-contents-did-navigate-event.md)
