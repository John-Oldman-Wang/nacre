---
type: reference
native: WKURLSchemeHandler
---

# `Session`：`protocol` 属性

**`protocol`** 属性是这个分区的自定义协议，一个 [`Protocol`](../protocol.md) 对象。用它把一个目录登记成 `app://` 这样的协议，之后新建的、用这个分区的网页从这个目录加载网页。

## 值

[`Protocol`](../protocol.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象。
- 不同分区的是不同的对象，各自的登记互不影响。

## 示例

```js
const protocol = session.defaultSession.protocol;
console.log(protocol === session.defaultSession.protocol);
console.log(protocol === session.fromPartition('persist:shop').protocol);

const web = new WebView();
console.log(web.webContents.session.protocol === protocol);
```

**结果**：依次输出 `true`、`false`、`true`。

## 和 Electron 的差别

Electron 的 `protocol` 是整个 App 一个，也可以从 `ses.protocol` 拿到某个分区的。这里只有 `ses.protocol`，一个分区一个。

## 对应的 iOS API

没有对应的属性。登记的协议在 `new WebView()` 时用 `-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]` 挂到网页的配置上。

## 参见

- [`Protocol`](../protocol.md)
- [用自定义协议加载本地网页](../../guides/web-pages.md#用自定义协议加载本地网页)
