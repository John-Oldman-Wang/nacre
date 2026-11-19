---
type: reference
native: WKUserScript
---

# `WebContents`: `preload-error` event

The **`preload-error`** event fires when the preload script throws while running. The page loads as usual.

## Syntax

```
contents.addEventListener('preload-error', (event) => {})
```

## Event object

`WebContentsPreloadErrorEvent`. Besides `type` and `target`, it has two fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `preloadPath` | string | The preload script path given when the `WebView` was created |
| `error` | `Error` | The error the preload script threw. `message` is the result of `String(error)` on the page side |

Not cancelable.

## When it fires

Each time a page starts loading and the preload script reaches the statement that throws. The statements before the throw have already run.

When the preload script can't be read or has a syntax error, this event doesn't fire; instead, [`new WebView()`](../web-view/constructor.md) throws immediately.

## Examples

```js
const web = new WebView({ webPreferences: { preload: 'JS/web/preload.js' } });
web.webContents.addEventListener('preload-error', (e) => {
  console.log(e.preloadPath, e.error.message);
});
```

**Effect**: When the preload script runs `throw new Error('Broken')`, it prints `JS/web/preload.js` and an error message containing `Broken`.

## Differences from Electron

Electron writes `contents.on('preload-error', (event, preloadPath, error) => …)`; here the data is on the event object.

## See also

- [Preload scripts](../web-view.md#preload-scripts)
