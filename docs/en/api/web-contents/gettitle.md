---
type: reference
native: WKWebView.title
---

# `WebContents`: `getTitle()` method

The **`getTitle()`** method returns the current web page's title, that is, the content of the page's `<title>`.

## Syntax

```
getTitle()
```

### Parameters

None.

### Return value

A string. Empty string when the page has no title.

[`page-title-updated`](page-title-updated-event.md) fires when the title changes.

> **Note:** Don't read `getTitle()` directly in `did-finish-load` or after `loadURL` fulfills. Whether the title or "finished loading" arrives first isn't fixed, so you may still read an empty string then. If you need the title, listen for `page-title-updated`.

### Exceptions

**`TypeError`**

The page has been destroyed: `Object has been destroyed`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', () => {
  console.log(contents.getTitle());
});
contents.loadURL('https://example.com/');
```

**Result**: It first prints an empty line (the title briefly becomes an empty string as the page switches), then prints `Example Domain`.

## Differences from Electron

Same as Electron's `contents.getTitle()`. The corresponding native iOS member is `WKWebView.title`.

## See also

- [`page-title-updated`](page-title-updated-event.md)
