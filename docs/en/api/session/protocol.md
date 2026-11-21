---
type: reference
native: WKURLSchemeHandler
---

# `Session`: `protocol` property

The **`protocol`** property is this partition's custom protocols, a [`Protocol`](../protocol.md) object. Use it to register a directory as a protocol such as `app://`; pages in this partition created afterward load web pages from that directory.

## Value

A [`Protocol`](../protocol.md).

- Read-only. Assigning to it throws `TypeError`.
- Every read returns the same object.
- Different partitions have different objects, and their registrations don't affect each other.

## Examples

```js
const protocol = session.defaultSession.protocol;
console.log(protocol === session.defaultSession.protocol);
console.log(protocol === session.fromPartition('persist:shop').protocol);

const web = new WebView();
console.log(web.webContents.session.protocol === protocol);
```

**Result**: It prints `true`, `false`, `true` in order.

## Differences from Electron

Electron's `protocol` is one for the whole app, and a partition's can also be obtained from `ses.protocol`. Here there is only `ses.protocol`, one per partition.

## Corresponding iOS API

There is no corresponding property. A registered protocol is attached to the page's configuration at `new WebView()` with `-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]`.

## See also

- [`Protocol`](../protocol.md)
- [Loading local web pages through a custom protocol](../../guides/web-pages.md#loading-local-web-pages-through-a-custom-protocol)
