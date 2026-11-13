---
type: reference
native: WKWebsiteDataStore
status: partial
---

# 网页的数据和 cookie（`session`）

[`WebView`](web-view.md) 里的网页会留下数据：cookie、`localStorage`、缓存。这些数据按**存储分区**存，一个分区对应一个 `Session` 对象。用它做两件事：

- **读写 cookie**：打开网页之前把登录状态写进去，或者读出网页登录之后得到的 cookie。
- **清数据**：退出登录时把这个分区的数据清掉。

拿到 `Session` 有两个入口，得到的是同一种对象：

- 全局的 `session`：`session.defaultSession`、`session.fromPartition('persist:shop')`。不用先建网页。
- `webView.webContents.session`：这张网页用的那一份。

接口的形状照 [Electron 的 session](https://www.electronjs.org/docs/latest/api/session)，方法名和 cookie 的字段名相同。和 Electron 有四点不同：

- **`changed` 事件不带数据。** 只知道 cookie 有变化，不知道是哪一条。
- **按站点清数据时不分协议和端口。** `clearStorageData({ origin })` 清的是那个域名的。
- **`sameSite` 读出来没有 `'unspecified'`。** 没写 SameSite 的 cookie 读出来是 `'no_restriction'`。
- **只有 cookie 和清数据这两块。** 没有的列在[还不能做的](#还不能做的)里。

> **注意**：这里的 cookie 只属于网页。[`fetch`](fetch.md) 有它自己的一份 cookie，两边不通：在这里写的 cookie，`fetch` 发请求时不会带上。

## 完整例子

下面的代码从空白 App 开始：先写一条 cookie，再打开网页，网页的请求就带着它。

```js
application.addEventListener('sceneconnect', async (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 打开网页之前，先把登录状态写成一条 cookie
  const cookies = session.defaultSession.cookies;
  await cookies.set({
    url: 'https://httpbin.org/',
    name: 'token',
    value: 'abc123',
    httpOnly: true,
    expirationDate: Date.now() / 1000 + 7 * 24 * 3600,
  });

  // 2. 再打开网页。它的第一个请求就带着这条 cookie
  const web = new WebView();
  web.frame = page.view.bounds;
  page.view.addSubview(web);
  await web.webContents.loadURL('https://httpbin.org/cookies');

  // 3. 读这个站点现在有哪些 cookie
  const list = await cookies.get({ url: 'https://httpbin.org/' });
  console.log(list.map((c) => c.name + '=' + c.value).join('; '));
});
```

**效果**

- 屏幕上的网页显示 `{ "cookies": { "token": "abc123" } }`。这个地址会把请求里带的 cookie 原样显示出来，说明网页的请求带上了它。
- 控制台输出 `token=abc123`。
- 这条 cookie 设了 `httpOnly`，所以网页里的脚本读 `document.cookie` 得到空串，读不到它。
- 设了过期时间（7 天后），App 重启之后它还在。

## 常见用法

下面的例子沿用完整例子里的 `web`。

### 读网页登录之后得到的 cookie

网页自己登录之后，服务器写的 cookie App 这边读得到，包括 `httpOnly` 的。

```js
const found = await session.defaultSession.cookies.get({
  url: 'https://my.app/',
  name: 'sid',
});
if (found.length > 0) console.log('网页已经登录', found[0].value);
```

**效果**

- 网页登录过的话，控制台输出那条 cookie 的值。
- 没有这条 cookie 时 `found` 是空数组，不报错。

### 退出登录时清掉

```js
await session.defaultSession.clearStorageData();
```

**效果**

- 这个分区的 cookie、`localStorage`、缓存全部清掉。
- 已经打开的网页当场受影响：它再读 `localStorage` 就是空的，再发请求就不带 cookie 了。

只清 cookie，留着别的：

```js
await session.defaultSession.clearStorageData({ storages: ['cookies'] });
```

**效果**

- cookie 全没了，`localStorage` 还在。

### 只清某一个站点的

```js
await session.defaultSession.clearStorageData({ origin: 'https://shop.my.app' });
```

**效果**

- `shop.my.app` 的数据清掉，别的站点的不动。
- 写在上一级域名上的 cookie（`domain` 是 `.my.app`）也一起清掉，因为 `shop.my.app` 的请求会带上它。
- 协议和端口不起作用：`http://shop.my.app:8080` 清的是同一批数据。

### 删掉一条 cookie

```js
await session.defaultSession.cookies.remove('https://my.app/', 'token');
```

**效果**

- 这个地址下名字是 `token` 的 cookie 没了。别的域名下同名的不受影响。
- 本来就没有这条时什么都不发生，不报错。

### cookie 变了的时候得到通知

```js
const cookies = session.defaultSession.cookies;
cookies.addEventListener('changed', async () => {
  const sid = await cookies.get({ url: 'https://my.app/', name: 'sid' });
  console.log(sid.length > 0 ? '已登录' : '未登录');
});
```

**效果**

- App 写的、网页的脚本写的、服务器写的、清数据清掉的，都会派发 `changed`。
- 事件上没有「是哪一条变了」，所以在回调里自己重新读。
- 一次改动可能派发不止一次。

### 给不同的账号用不同的分区

分区的写法和 [`WebView` 的 `partition`](web-view.md#存储分区) 相同，两边指的是同一份数据。

```js
const work = session.fromPartition('persist:work');
await work.cookies.set({ url: 'https://my.app/', name: 'token', value: 'work-token' });

const web = new WebView({ webPreferences: { partition: 'persist:work' } });
console.log(web.webContents.session === work);
```

**效果**

- 控制台输出 `true`：同一个分区永远是同一个 `Session` 对象。
- 这张网页的请求带着 `work-token`。默认分区和别的分区里的网页看不到这条 cookie。

## 概念

### 分区和 `Session`

| 写法 | 是哪一份 | App 重启之后 |
| --- | --- | --- |
| `session.defaultSession` | 默认的那一份。没写 `partition` 的网页都用它 | 数据还在 |
| `session.fromPartition('persist:名字')` | 名字对应的那一份 | 数据还在 |
| `session.fromPartition('名字')`（不带 `persist:`） | 名字对应的那一份，只在内存里 | 数据没了 |

不同分区之间互相看不到数据。`session.fromPartition('')` 就是 `session.defaultSession`。

App 启动后第一次读写某个分区要等 0.6 到 1 秒，之后每次不到 1 毫秒。

### 一条 cookie 属于谁

`set` 时用 `url` 和 `domain` 决定这条 cookie 会被哪些请求带上：

| 怎么写 | 读回来的 `domain` | `hostOnly` | 哪些请求会带上 |
| --- | --- | --- | --- |
| 只给 `url: 'https://a.my.app/'` | `'a.my.app'` | `true` | 只有 `a.my.app` 的 |
| 再给 `domain: 'my.app'` | `'.my.app'` | `false` | `my.app` 和它所有的子域名 |

名字、域名、路径三样都相同的才是同一条 cookie。再 `set` 一次会盖掉原来的值，不会多出一条。

### 会话 cookie 和有过期时间的

| | `session` | `expirationDate` | App 重启之后 |
| --- | --- | --- | --- |
| `set` 时没给 `expirationDate` | `true` | 没有这个字段 | 没了 |
| `set` 时给了 | `false` | 那个时间，整数秒 | 还在，到时间自动失效 |

## 成员说明

### `session`

全局对象，不用建。

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `session.defaultSession` | `Session` | 默认分区。只读。每次读是同一个对象 |
| `session.fromPartition(partition)` | 返回 `Session` | 某个分区。同一个分区名永远返回同一个对象 |

### `Session`

不能自己建：`new Session()` 抛 `TypeError: Illegal constructor: Session is created by the runtime, not by new`。

| 成员 | 类型 | 含义 |
| --- | --- | --- |
| `cookies` | `Cookies` | 这个分区的 cookie。只读。每次读是同一个对象 |
| `isPersistent()` | 返回 `boolean` | 这个分区落不落盘。只在内存里的分区返回 `false` |
| `clearStorageData(options)` | 返回 `Promise<void>` | 清数据。见下 |

#### `clearStorageData(options)`

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `options.storages` | 字符串数组 | 只清这几类。不给就是全部，连缓存一起 |
| `options.origin` | `string` | 只清这个站点的，写成 `'https://shop.my.app'`。不给就是整个分区 |

`storages` 里能写的名字：

| 名字 | 清什么 |
| --- | --- |
| `'cookies'` | cookie |
| `'localstorage'` | `localStorage` 和 `sessionStorage` |
| `'indexdb'` | IndexedDB |
| `'serviceworkers'` | Service Worker 的注册 |
| `'cachestorage'` | 网页用 Cache API 存的东西 |
| `'filesystem'` | 网页用文件系统接口存的文件 |
| `'shadercache'` | 什么都不清。iOS 上没有对应的东西，认这个名字是为了从 Electron 搬过来的代码不报错 |

后四类没有单独验证过，验过的是 `'cookies'` 和 `'localstorage'`。

返回的 Promise 在清完之后兑现。参数不对时被拒绝：

| 情况 | 错误 |
| --- | --- |
| `storages` 不是数组 | `TypeError: clearStorageData: storages must be an array, got "cookies"` |
| `storages` 里有不认识的名字 | `TypeError`，说明里列出全部可用的名字 |
| `origin` 不是一个合法的地址 | `TypeError: clearStorageData: the origin is invalid` |

### `Cookies`

从 `session.cookies` 得到。三个方法都返回 Promise，参数不对时是 Promise 被拒绝，不是当场抛。

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `get(filter)` | `Promise<Cookie[]>` | 读。`filter` 可以不给，那就是这个分区的全部 |
| `set(details)` | `Promise<void>` | 写一条 |
| `remove(url, name)` | `Promise<void>` | 删掉这个地址下叫这个名字的 |

事件只有一个：

| 事件 | 什么时候派发 | 事件对象上的字段 |
| --- | --- | --- |
| `changed` | 这个分区的 cookie 有变化 | 无 |

监听别的事件名会抛 `TypeError: addEventListener has no value "change"; expected one of: changed`。

#### `get(filter)` 的筛选条件

条件之间是「并且」的关系。

| 条件 | 类型 | 留下哪些 |
| --- | --- | --- |
| `url` | `string` | 这个地址的请求会带上的：域名对得上、路径对得上；地址是 `http` 的话不含 `secure` 的 |
| `name` | `string` | 名字一样的 |
| `domain` | `string` | 这个域名的，和它的子域名的 |
| `path` | `string` | 路径一模一样的 |
| `secure` | `boolean` | `secure` 等于这个值的 |
| `session` | `boolean` | `true` 留下会话 cookie，`false` 留下有过期时间的 |
| `httpOnly` | `boolean` | `httpOnly` 等于这个值的 |

`url` 不是合法的 `http` / `https` 地址时被拒绝：`TypeError: cookies.get: the url is invalid`。

#### `set(details)` 的参数

| 参数 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `url` | `string` | 必填 | 这条 cookie 属于哪个地址。必须是 `http` 或 `https` 的 |
| `name` | `string` | `''` | 名字 |
| `value` | `string` | `''` | 值 |
| `domain` | `string` | 无 | 给了就对这个域名和它的子域名都有效，见[一条 cookie 属于谁](#一条-cookie-属于谁) |
| `path` | `string` | `'/'` | 只有这个路径和它下面的请求才带 |
| `secure` | `boolean` | `false` | `true`：只在 `https` 的请求里带 |
| `httpOnly` | `boolean` | `false` | `true`：网页的脚本读不到 |
| `expirationDate` | `number` | 无 | 过期时间，从 1970 年起的秒数。不给就是会话 cookie |
| `sameSite` | `string` | 无 | `'lax'`、`'strict'`、`'no_restriction'` 或 `'unspecified'` |

被拒绝的情况：

| 情况 | 错误 |
| --- | --- |
| 没给 `url`，或者它不合法 | `TypeError: cookies.set: the url is invalid` |
| `url` 不是 `http` / `https` | `TypeError: cookies.set: the url must be http or https` |
| `sameSite` 写错 | `TypeError: sameSite has no value "none"; expected one of: unspecified / no_restriction / lax / strict` |
| `expirationDate` 不是数 | `TypeError: expirationDate must be a finite number, got "abc"` |

### `Cookie`

`get` 返回的每一项。全部只读。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `name` | `string` | 名字 |
| `value` | `string` | 值 |
| `domain` | `string` | 属于哪个域名。以点开头的对子域名也有效 |
| `hostOnly` | `boolean` | `true`：只发给 `domain` 这一个主机。`false`：子域名也发 |
| `path` | `string` | 路径 |
| `secure` | `boolean` | `true`：只在 `https` 的请求里带 |
| `httpOnly` | `boolean` | `true`：网页的脚本读不到 |
| `session` | `boolean` | `true`：没有过期时间，App 重启就没了 |
| `expirationDate` | `number` | 过期时间，从 1970 年起的秒数，整数。`session` 为 `true` 时没有这个字段 |
| `sameSite` | `string` | `'no_restriction'`、`'lax'` 或 `'strict'` |

## 与 Electron 的对照

| Electron | 这里 | 差别 |
| --- | --- | --- |
| `require('electron').session` | 全局的 `session` | 不用引入 |
| `session.defaultSession`、`session.fromPartition(partition)` | 相同 | |
| `contents.session` | 相同 | |
| `ses.cookies.get(filter)`、`set(details)`、`remove(url, name)` | 相同 | |
| `ses.cookies.on('changed', (event, cookie, cause, removed) => …)` | `ses.cookies.addEventListener('changed', () => …)` | 没有 `cookie`、`cause`、`removed` |
| `ses.cookies.flushStore()` | 没有 | 系统不提供 |
| `ses.clearStorageData({ origin, storages })` | 相同 | `origin` 只按域名算，不分协议和端口 |
| `ses.isPersistent()` | 相同 | |
| Cookie 的 `sameSite: 'unspecified'` | 读不出来 | 写的时候可以用 |

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `WKWebsiteDataStore.defaultDataStore` | `session.defaultSession` |
| `[WKWebsiteDataStore dataStoreForIdentifier:]`、`nonPersistentDataStore` | `session.fromPartition(partition)` |
| `webView.configuration.websiteDataStore` | `webView.webContents.session` |
| `dataStore.isPersistent` | `ses.isPersistent()` |
| `[dataStore.httpCookieStore getAllCookies:]` | `ses.cookies.get(filter)` |
| `[dataStore.httpCookieStore setCookie:completionHandler:]` | `ses.cookies.set(details)` |
| `[dataStore.httpCookieStore deleteCookie:completionHandler:]` | `ses.cookies.remove(url, name)` |
| `WKHTTPCookieStoreObserver` 的 `cookiesDidChangeInCookieStore:` | `ses.cookies` 的 `changed` 事件 |
| `[dataStore removeDataOfTypes:modifiedSince:completionHandler:]` | `ses.clearStorageData({ storages })` |
| `[dataStore fetchDataRecordsOfTypes:…]` 加 `removeDataOfTypes:forDataRecords:…` | `ses.clearStorageData({ origin })` |

## 还不能做的

| 想做的事 | 对应的能力 |
| --- | --- |
| 知道是哪一条 cookie 变了、是加了还是删了 | Electron 的 `changed` 事件的参数。系统的通知不带这些 |
| 只清 HTTP 缓存 | Electron 的 `ses.clearCache()`；`WKWebsiteDataTypeDiskCache` |
| 让网页的 cookie 和 `fetch` 的 cookie 互通 | `NSHTTPCookieStorage` |
| 改这个分区里所有网页的 User-Agent | Electron 的 `ses.setUserAgent()` |
| 拦截或改写网页发出的请求 | Electron 的 `ses.webRequest` |
| 处理网页发起的下载 | Electron 的 `will-download`；`WKDownload` |
| 看一个分区里存了哪些站点的数据 | `fetchDataRecordsOfTypes:` |

## 参见

- [`WebView`](web-view.md)：建网页时用 `partition` 指定分区，`webContents.session` 拿到对应的 `Session`。
- [`fetch`](fetch.md)：它的 cookie 是另一份，和这里的不通。
- [实现原理](../internals/web-view.md#sessioncookie-和清数据)：筛选为什么在 JS 里做、按站点清是怎么实现的、几条实测。
