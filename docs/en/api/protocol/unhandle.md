---
type: reference
native: WKWebViewConfiguration
---

# `Protocol`: `unhandle()` method

The **`unhandle()`** method removes a custom protocol registered in this partition: pages created afterward no longer recognize it.

## Syntax

```
unhandle(scheme)
```

### Parameters

**`scheme`**

The protocol name, a string, without `://`. Non-strings are converted to strings first. When this partition hasn't registered it, nothing happens.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- Pages already created are unaffected: they keep getting files from the original directory.
- A page in this partition created afterward that loads an address of this protocol: [`loadURL()`](../web-contents/loadurl.md) rejects.
- Only this partition's registration is removed. A protocol of the same name registered in another partition stays.
- After the call, [`isProtocolHandled()`](isprotocolhandled.md) returns `false`.

## Examples

```js
const protocol = session.defaultSession.protocol;
protocol.serveDirectory('app', 'JS/assets/web');
const before = new WebView();

protocol.unhandle('app');
console.log(protocol.isProtocolHandled('app'));

const after = new WebView();
await before.webContents.loadURL('app://local/index.html');
try {
  await after.webContents.loadURL('app://local/index.html');
} catch {
  console.log("after can't load");
}
```

**Effect**

- The console first prints `false`, then `after can't load`.
- `before` was created before `unhandle()`, and shows `assets/web/index.html` normally.

## Differences from Electron

Electron's `protocol.unhandle(scheme)` applies to the whole app and takes effect immediately. Here it covers one partition and takes effect only for pages created afterward.

## Corresponding iOS API

There is no separate method. Pages created afterward no longer get `-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]` called on their configuration.

## See also

- [`serveDirectory()`](servedirectory.md)
- [`isProtocolHandled()`](isprotocolhandled.md)
