---
type: reference
native: WKUserScript
---

# `contextBridge.exposeInMainWorld()` method

The **`exposeInMainWorld()`** method attaches an object to the web page's `window` under a name chosen by the preload script. The page can't replace the name with another object.

## Syntax

```
contextBridge.exposeInMainWorld(key, api)
```

### Parameters

**`key`**

A string, the name on `window`.

**`api`**

The value to attach, usually an object whose members are a few methods. It's attached as is, not copied.

### Return value

None (`undefined`).

### Exceptions

**`Error`**

`window` already has this name: `Cannot bind an API on top of an existing property on the window object`.

## Description

- The attached name can't be written or deleted: `window.app = 1` in the page has no effect, and `window.app` is still the original object.
- The name is fixed, but the object's members aren't: the page can modify and replace the members of `api`.
- The preload script runs before any of the page's own scripts, so the name is already there when the page's first script runs.
- When the page changes, the preload script runs again and the name is attached again.

Provide as few methods as possible, each doing one thing: provide specific methods like `share(id)`, not general ones like "run any command" or "read any key".

## Examples

```javascript
// JS/web/preload.js
contextBridge.exposeInMainWorld('app', {
  version: '1.0',
  share: (id) => ipcRenderer.send('share', id),
});
```

**Effect**: In the page, `app.version` is `'1.0'`, and `app.share(42)` sends the app a `share` message. After the page runs `window.app = 1`, `typeof window.app` is still `'object'`.

## Differences from Electron

Written the same as Electron's `contextBridge.exposeInMainWorld(key, api)`. Electron copies `api` between isolated environments; here there's no isolation, `api` is attached as is, and the page can change its members.

## See also

- [`ipcRenderer`](../ipc-renderer.md)
