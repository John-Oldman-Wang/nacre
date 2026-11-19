---
type: reference
native: WKWebViewConfiguration.websiteDataStore
---

# `WebContents`: `session` property

The **`session`** property is the storage partition this web page's data lives in. Use it to read and write this page's cookies and to clear data the page left behind.

## Value

A `Session`; see [`session`](../session.md).

- Read-only; assigning to it throws `TypeError`.
- Determined by [`webPreferences.partition`](../web-view/constructor.md) when the `WebView` is created; it doesn't change afterward.
- Pages in the same partition get the same object, which you can compare with `===`.

## Examples

```js
const a = new WebView({ webPreferences: { partition: 'persist:shop' } });
const b = new WebView({ webPreferences: { partition: 'persist:shop' } });
console.log(a.webContents.session === b.webContents.session);
console.log(a.webContents.session === session.fromPartition('persist:shop'));
```

**Result**: It prints `true` twice.

## Differences from Electron

Same as Electron's `contents.session`. The corresponding native iOS member is `WKWebViewConfiguration.websiteDataStore`.

## See also

- [`session`](../session.md): cookies and clearing data
- [Storage partitions](../web-view.md#storage-partitions)
