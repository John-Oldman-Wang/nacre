---
type: reference
native: WKWebViewConfiguration
---

# `Protocol`：`unhandle()` 方法

**`unhandle()`** 方法去掉这个分区登记的一个自定义协议：之后新建的网页不再认它。

## 语法

```
unhandle(scheme)
```

### 参数

**`scheme`**

协议名，字符串，不带 `://`。不是字符串时先转成字符串。这个分区没有登记过它时，什么都不做。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 已经建好的网页不受影响：它们照旧从原来的目录取文件。
- 之后新建的、用这个分区的网页加载这个协议的地址，[`loadURL()`](../web-contents/loadurl.md) 拒绝。
- 只去掉这个分区的登记。别的分区登记的同名协议照旧。
- 调用之后 [`isProtocolHandled()`](isprotocolhandled.md) 返回 `false`。

## 示例

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
  console.log('after 加载不了');
}
```

**效果**

- 控制台先输出 `false`，再输出 `after 加载不了`。
- `before` 是 `unhandle()` 之前建的，照常显示 `assets/web/index.html`。

## 和 Electron 的差别

Electron 的 `protocol.unhandle(scheme)` 是整个 App 的，立刻生效。这里只管一个分区，只对之后新建的网页生效。

## 对应的 iOS API

没有单独的方法。之后新建的网页的配置上不再调 `-[WKWebViewConfiguration setURLSchemeHandler:forURLScheme:]`。

## 参见

- [`serveDirectory()`](servedirectory.md)
- [`isProtocolHandled()`](isprotocolhandled.md)
