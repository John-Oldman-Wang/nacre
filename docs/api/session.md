---
type: reference
native: WKWebsiteDataStore
status: partial
---

# `Session`

**`Session`** 表示一个存储分区：[`WebView`](web-view.md) 里的网页留下的 cookie、`localStorage`、IndexedDB、缓存等数据都存在某一个分区里。通过 `Session`，App 可以读写这个分区的 cookie，也可以把分区里的数据清掉。

每个分区是独立的一份数据。同一个分区里的网页共享数据：在一张网页里登录，同分区的另一张网页也是登录状态。不同分区之间互相看不到数据。网页用哪个分区，在建 `WebView` 时用 `webPreferences.partition` 指定，之后不能改。分区的写法见[分区](#分区)。

这一组还有两样东西：

- [`Cookies`](cookies.md)：一个分区的 cookie，从 [`cookies`](session/cookies.md) 属性拿到。
- [`Cookie`](cookie.md)：读 cookie 时得到的每一条记录。

**继承关系**：`Session` 不继承任何类。

怎么在打开网页之前写好登录状态、退出登录时清数据、多个账号分开存，见指南[管理网页的登录状态](../guides/web-login.md)。

## 构造函数

不能用 `new` 创建：`new Session()` 抛 `TypeError: Illegal constructor: Session is created by the runtime, not by new`。

`Session` 有两个入口，同一个分区从哪个入口拿到的都是同一个对象：

- 全局对象 `session` 上的 [`session.defaultSession`](session/defaultsession.md) 和 [`session.fromPartition()`](session/frompartition.md)。不需要先建网页就可以用。
- 网页的 `webView.webContents.session`：这张网页使用的那个分区，见 [`WebView`](web-view.md)。

`Session` 对象从第一次用到起一直存在到 App 退出，可以保存在任何地方，也可以每次用的时候重新取。

## 静态属性

全局对象 `session` 不用建，任何时候都能用。

[`session.defaultSession`](session/defaultsession.md) <small>只读</small>

默认分区。所有没写 `partition` 的网页共用它。

## 静态方法

[`session.fromPartition()`](session/frompartition.md)

按分区名拿到一个分区。分区名和 `webPreferences.partition` 是同一种写法。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`cookies`](session/cookies.md) <small>只读</small> | 这个分区的 cookie |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`isPersistent()`](session/ispersistent.md) | 这个分区的数据在 App 重启之后还在不在 |
| [`clearStorageData()`](session/clearstoragedata.md) | 清掉这个分区里的数据，可以只清某几类、某一个站点的 |

## 分区

| 写法 | 是哪一份 | 谁在用 | App 重启之后 |
| --- | --- | --- | --- |
| `session.defaultSession` | 默认的那一份 | 所有没写 `partition` 的网页 | 数据还在 |
| `session.fromPartition('persist:名字')` | 名字对应的那一份 | `partition` 写了同一个名字的网页 | 数据还在 |
| `session.fromPartition('名字')`（不带 `persist:`） | 名字对应的那一份，只在内存里 | `partition` 写了同一个名字的网页 | 数据没了 |

- `session.fromPartition('')` 和 `session.fromPartition('persist:')` 都是 `session.defaultSession`。
- 「数据还在」的分区里，没有过期时间的 cookie 例外：它在 App 重启之后就没了，见[会话 cookie](cookie.md#会话-cookie-和有过期时间的)。
- 分区的数据只属于这个 App。别的 App 和 Safari 读不到（来自 iOS 的定义，**未在模拟器验证**）。
- App 启动后第一次读写某个分区要等 0.6 到 1 秒，之后每次不到 1 毫秒（实测）。这是异步的等待，期间界面照常响应。

> **注意**：分区里的 cookie 只属于网页。[`fetch`](fetch.md) 有它自己的一份 cookie，两边不通：在这里写的 cookie，`fetch` 发请求时不会带上；在这里清数据，也清不到 `fetch` 的 cookie。

## 示例

### 打开网页之前写好登录状态

从空白 App 开始：先写一条 cookie，再打开网页，网页的请求就带着它。

```js
application.addEventListener('sceneconnect', async (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const cookies = session.defaultSession.cookies;
  await cookies.set({
    url: 'https://httpbin.org/',
    name: 'token',
    value: 'abc123',
    httpOnly: true,
    expirationDate: Date.now() / 1000 + 7 * 24 * 3600,
  });

  const web = new WebView();
  web.frame = page.view.bounds;
  page.view.addSubview(web);
  await web.webContents.loadURL('https://httpbin.org/cookies');

  const list = await cookies.get({ url: 'https://httpbin.org/' });
  console.log(list.map((c) => c.name + '=' + c.value).join('; '));
});
```

**效果**

- 屏幕上的网页显示 `{ "cookies": { "token": "abc123" } }`。这个地址把请求里带的 cookie 原样显示出来，说明网页的请求带上了它。
- 控制台输出 `token=abc123`。
- 这条 cookie 设了 `httpOnly`，网页里的脚本读 `document.cookie` 得到空串。
- 设了过期时间（7 天后），App 重启之后它还在。

### 退出登录

```js
await session.defaultSession.clearStorageData();
```

**效果**：默认分区的 cookie、`localStorage`、缓存全部清掉。已经打开的网页再发请求就不带 cookie 了。

## 和 Electron 的差别

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `require('electron').session` | 全局的 `session` | 不用引入 |
| `session.defaultSession`、`session.fromPartition(partition)` | 相同 | |
| `contents.session` | 相同 | |
| `ses.cookies` | 相同 | 见 [`Cookies`](cookies.md#和-electron-的差别) |
| `ses.clearStorageData({ origin, storages })` | 相同 | `origin` 只按域名算，不分协议和端口 |
| `ses.isPersistent()` | 相同 | |

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `WKWebsiteDataStore.defaultDataStore` | `session.defaultSession` |
| `[WKWebsiteDataStore dataStoreForIdentifier:]`、`nonPersistentDataStore` | `session.fromPartition(partition)` |
| `webView.configuration.websiteDataStore` | `webView.webContents.session` |
| `dataStore.httpCookieStore` | `ses.cookies` |
| `dataStore.isPersistent` | `ses.isPersistent()` |
| `[dataStore removeDataOfTypes:modifiedSince:completionHandler:]` | `ses.clearStorageData({ storages })` |
| `[dataStore fetchDataRecordsOfTypes:…]` 加 `removeDataOfTypes:forDataRecords:…` | `ses.clearStorageData({ origin })` |

## 参见

- [管理网页的登录状态](../guides/web-login.md)：写登录 cookie、退出登录、多账号、读网页登录后的 cookie
- [`Cookies`](cookies.md)：读、写、删 cookie，cookie 变化的通知
- [`Cookie`](cookie.md)：读到的每一条 cookie 带哪些字段
- [`WebView`](web-view.md)：建网页时用 `partition` 指定分区，`webContents.session` 拿到对应的 `Session`
- [`fetch`](fetch.md)：它的 cookie 是另一份，和这里的不通
