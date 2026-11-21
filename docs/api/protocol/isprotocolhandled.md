---
type: reference
native: WKWebViewConfiguration
---

# `Protocol`：`isProtocolHandled()` 方法

**`isProtocolHandled()`** 方法返回这个分区现在有没有登记一个自定义协议。

## 语法

```
isProtocolHandled(scheme)
```

### 参数

**`scheme`**

协议名，字符串，不带 `://`。不是字符串时先转成字符串。

### 返回值

布尔。

- `true`：这个分区用 [`serveDirectory()`](servedirectory.md) 登记了这个协议，还没有 [`unhandle()`](unhandle.md)。之后新建的、用这个分区的网页认它。
- `false`：没有登记，或者已经去掉了。`https`、`file` 这类 WebKit 自己处理的协议也是 `false`。

只看这个分区。别的分区登记了同名的协议，这里还是 `false`。

返回值说的是之后新建的网页。已经建好的网页认不认这个协议，按它建的那一刻的登记算。

### 异常

无。

## 示例

```js
const protocol = session.defaultSession.protocol;
console.log(protocol.isProtocolHandled('app'));
protocol.serveDirectory('app', 'JS/assets/web');
console.log(protocol.isProtocolHandled('app'));
console.log(session.fromPartition('guest').protocol.isProtocolHandled('app'));
protocol.unhandle('app');
console.log(protocol.isProtocolHandled('app'));
```

**结果**：App 里之前没有登记过 `app` 时，依次输出 `false`、`true`、`false`、`false`。

## 和 Electron 的差别

相同。这里只看一个分区。

## 对应的 iOS API

没有单独的方法。对应的是 `-[WKWebViewConfiguration urlSchemeHandlerForURLScheme:]`，但它读的是一张已经建好的网页的配置，这里读的是之后新建的网页会用的登记。

## 参见

- [`serveDirectory()`](servedirectory.md)
- [`unhandle()`](unhandle.md)
