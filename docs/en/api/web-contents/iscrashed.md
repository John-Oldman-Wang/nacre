---
type: reference
native: "webViewWebContentProcessDidTerminate:"
---

# `WebContents`: `isCrashed()` method

The **`isCrashed()`** method returns whether the web page's process is gone.

Each web page runs in its own separate process. That process can crash, or the system can terminate it when memory is tight. The page then goes blank, and the app keeps running as usual.

## Syntax

```
isCrashed()
```

### Parameters

None.

### Return value

A boolean.

- `true`: the process is gone and the page is blank.
- `false`: the process is alive. It returns to `false` after reloading.

[`render-process-gone`](render-process-gone-event.md) fires when it becomes `true`.

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('render-process-gone', () => {
  console.log(contents.isCrashed());
  contents.reload();
});
```

**Result**: When the page's process is terminated, it prints `true`; then the page reloads and `isCrashed()` returns to `false`.

## Differences from Electron

Same as Electron's `contents.isCrashed()`. The native iOS equivalent is the `webViewWebContentProcessDidTerminate:` callback.

## See also

- [`render-process-gone`](render-process-gone-event.md)
- [Recovering after the page crashes](../../guides/web-pages.md#recovering-after-a-web-page-crashes)
