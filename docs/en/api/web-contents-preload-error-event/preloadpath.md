---
type: reference
native: WebContentsPreloadErrorEvent.preloadPath
---

# `WebContentsPreloadErrorEvent`: `preloadPath` property

The **`preloadPath`** property is the path of the preload script.

## Value

A string: the path given as `webPreferences.preload` when the `WebView` was built.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const contents = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } }).webContents;
contents.addEventListener('preload-error', (e) => {
  console.log('出错的脚本', e.preloadPath);
});
```

**Effect**: when the preload script throws, prints `出错的脚本 JS/web/preload.js`.

## Corresponding iOS API

There is no corresponding system API.

## See also

- [`WebContentsPreloadErrorEvent`](../web-contents-preload-error-event.md)
