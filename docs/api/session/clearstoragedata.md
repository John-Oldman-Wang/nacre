---
type: reference
native: "-[WKWebsiteDataStore removeDataOfTypes:modifiedSince:completionHandler:]"
---

# `Session`：`clearStorageData()` 方法

**`clearStorageData()`** 方法清掉这个分区里的数据。不带参数时清掉全部：cookie、`localStorage`、`sessionStorage`、IndexedDB、缓存。别的分区不受影响。

## 语法

```
clearStorageData([options])
```

### 参数

**`options`** <small>可选</small>

对象。不给，或者给 `null` / `undefined`，清掉整个分区的全部数据。

**`options.storages`** <small>可选</small>

字符串数组，只清这几类。不给就是全部，连缓存一起。能写的名字：

| 名字 | 清什么 |
| --- | --- |
| `'cookies'` | cookie |
| `'localstorage'` | `localStorage` 和 `sessionStorage` |
| `'indexdb'` | IndexedDB |
| `'serviceworkers'` | Service Worker 的注册 |
| `'cachestorage'` | 网页用 Cache API 存的东西 |
| `'filesystem'` | 网页用文件系统接口存的文件 |
| `'shadercache'` | 什么都不清。iOS 上没有对应的东西，认这个名字是为了从 Electron 搬过来的代码不报错 |

验证过的只有 `'cookies'` 和 `'localstorage'`，其余几类**未在模拟器验证**。

**`options.origin`** <small>可选</small>

字符串，只清这个站点的，写成 `'https://shop.my.app'`。不给就是整个分区。

- 按域名算，不分协议和端口：`https://shop.my.app` 和 `http://shop.my.app:8080` 清的是同一批数据。
- 写在上一级域名上的 cookie（`domain` 是 `.my.app`）也一起清掉，因为 `shop.my.app` 的请求会带上它。

### 返回值

`Promise`，清完之后兑现，值是 `undefined`。要在清完之后再做的事，写在 `await` 后面。

### 异常

参数不对时返回的 Promise 被拒绝，不是当场抛。

**`TypeError`**

- `storages` 不是数组：`clearStorageData: storages must be an array, got "cookies"`。
- `storages` 里有不认识的名字：说明里列出全部可用的名字。
- `origin` 不是一个合法的地址：`clearStorageData: the origin is invalid`。

## 说明

已经打开的网页当场受影响：它再读 `localStorage` 是空的，再读 `document.cookie` 是空的，再发请求不带 cookie。但已经显示在屏幕上的内容不会自己消失，要重新加载或者销毁那张网页，见[退出登录](../../guides/web-login.md#退出登录)。

## 示例

### 清掉全部

```js
await session.defaultSession.clearStorageData();
```

**效果**：默认分区的 cookie、`localStorage`、缓存全部清掉。

### 只清 cookie

```js
await session.defaultSession.clearStorageData({ storages: ['cookies'] });
```

**效果**：cookie 全没了，`localStorage` 还在。

### 只清一个站点的

```js
await session.defaultSession.clearStorageData({ origin: 'https://shop.my.app' });
```

**效果**：`shop.my.app` 的数据清掉，别的站点的不动。

## 和 Electron 的差别

`origin` 只按域名算，不分协议和端口。`'shadercache'` 认但什么都不清。

对应的 iOS API：不给 `origin` 时是 `-[WKWebsiteDataStore removeDataOfTypes:modifiedSince:completionHandler:]`；给了是 `fetchDataRecordsOfTypes:` 找出这个站点的记录，再 `removeDataOfTypes:forDataRecords:completionHandler:`。

## 参见

- [管理网页的登录状态](../../guides/web-login.md)：退出登录时怎么清
- [`Cookies.remove()`](../cookies/remove.md)：只删一条 cookie
