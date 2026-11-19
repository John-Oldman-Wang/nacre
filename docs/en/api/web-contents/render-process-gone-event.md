---
type: reference
native: "webViewWebContentProcessDidTerminate:"
---

# `WebContents`: `render-process-gone` event

The **`render-process-gone`** event fires when the web page's process is gone: it crashed, or the system terminated it when memory was tight.

## Syntax

```
contents.addEventListener('render-process-gone', (event) => {})
```

## Event object

`Event`, with no extra fields. It doesn't give a reason. Not cancelable.

## When it fires

Each web page runs in its own separate process; the event fires when that process is gone. At that point:

- The page goes blank, and the app keeps running as usual.
- [`isCrashed()`](iscrashed.md) is `true`.
- The Promise of any unfinished `loadURL` is rejected.

The runtime doesn't reload automatically. The app decides whether to recover.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('render-process-gone', () => {
  contents.reload();
});
```

**Effect**: When the page's process is terminated, the page reloads and displays again. The page's previous state (a half-filled form, variables in scripts) isn't restored.

## Differences from Electron

Electron's event carries `details.reason`; this one doesn't: the system doesn't give a reason.

The native iOS equivalent is `webViewWebContentProcessDidTerminate:`.

## See also

- [Recovering after the page crashes](../../guides/web-pages.md#recovering-after-a-web-page-crashes)
