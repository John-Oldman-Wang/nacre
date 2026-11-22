---
type: reference
native: WebContentsDidFailLoadEvent.validatedURL
---

# `WebContentsDidFailLoadEvent`: `validatedURL` property

The **`validatedURL`** property is the URL that failed to load.

## Value

A string. It is an empty string when it isn't available.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('did-fail-load', (e) => {
  console.log(e.validatedURL);
});
contents.loadURL('https://no-such-host.invalid').catch(() => {});
```

**Effect**: prints `https://no-such-host.invalid/`. **Not verified in the simulator.**

## Corresponding iOS API

`error.userInfo[NSURLErrorFailingURLStringErrorKey]`.

## See also

- [`WebContentsDidFailLoadEvent`](../web-contents-did-fail-load-event.md)
