---
type: reference
native: WebContentsPreloadErrorEvent.error
---

# `WebContentsPreloadErrorEvent`: `error` property

The **`error`** property is the error the preload script threw.

## Value

An `Error`. Its `message` is the result of `String(error)` on the web page side, such as `'Error: boom'`.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('preload-error', (e) => {
  console.log(e.error.message);
});
```

**Effect**: when the preload script runs `throw new Error('boom')`, prints `Error: boom`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsPreloadErrorEvent`](../web-contents-preload-error-event.md)
