---
type: reference
native: WKUserScript
---

# `contextBridge`

**`contextBridge`** is the entry point a preload script uses to put things on the web page: it attaches a set of methods written in the preload script to the page's `window`, so the page's scripts can call them.

It's available only in [preload scripts](web-view.md#preload-scripts). Like [`ipcRenderer`](ipc-renderer.md), it's a name available directly in preload scripts; it isn't a global of the web page, and it doesn't exist in the app's `main.js` either.

Preload scripts and the page's scripts run in the same environment, with no isolation: assigning directly to `window` is also visible to the page. The difference with `contextBridge` is that the page can't replace the name with another object.

## Functions

| Method | Description |
| --- | --- |
| [`exposeInMainWorld()`](context-bridge/exposeinmainworld.md) | Attaches an object to the page's `window`; the page can't change the name |

## Examples

Preload script `JS/web/preload.js`:

```javascript
contextBridge.exposeInMainWorld('app', {
  share: (id) => ipcRenderer.send('share', id),
});
```

In the web page:

```html
<button onclick="app.share(42)">Share</button>
```

**Effect**: In the page, `typeof app` is `'object'`, and it's already there when the page's first script runs. When the button is tapped, the app receives a `share` message.

## Comparison with Electron

| Electron | Here | Difference |
| --- | --- | --- |
| `contextBridge.exposeInMainWorld(key, api)` | Same | A name available directly in preload scripts. No isolation: `api` is attached as is, and the page can change its members |
| `contextBridge.exposeInIsolatedWorld` and others | Not available | |

## Corresponding iOS API

There's no directly corresponding native member. What gets attached is an ordinary `window` property, written by a `WKUserScript` injected at document start.

## See also

- [`ipcRenderer`](ipc-renderer.md)
- [Preload scripts](web-view.md#preload-scripts)
