# 管理网页的登录状态

这一篇讲 App 怎么管 [`WebView`](../api/web-view.md) 里网页的登录状态：在打开网页之前写好登录 cookie、读网页自己登录之后得到的 cookie、退出登录时清数据、多个账号分开存。用到的是 [`Session`](../api/session.md)、[`Cookies`](../api/cookies.md) 和 [`Cookie`](../api/cookie.md)。

## 推荐的做法

- **登录状态在打开网页之前写进去。** App 自己完成登录后，先用 [`cookies.set()`](../api/cookies/set.md) 把令牌写成一条 cookie，再建 `WebView` 加载网页。网页的第一个请求就带着它，不会先显示一次未登录的页面。写的时候加上 `httpOnly: true`，网页里的脚本就读不到这个令牌。给 `expirationDate`，App 重启后 cookie 还在；不给的话重启后要重新写。
- **退出登录时把整个分区清掉，再重新加载还开着的网页。** 只删登录用的那一条 cookie 不够：网页可能在 `localStorage` 里存了用户的数据。
- **同时登录多个账号时，每个账号用一个 `persist:` 分区。** 分区名里带上账号的标识，比如 `'persist:user-42'`。各账号的 cookie 互不相干，退出其中一个账号只清它自己的分区。
- **第一次读写放在不影响界面的时候。** App 启动后第一次读写某个分区要等 0.6 到 1 秒，之后每次不到 1 毫秒（实测）。这是异步的等待，期间界面照常响应，但等它完成之后才打开网页的话，用户会多等这一段时间。

## 第一个例子

从空白 App 开始：先写一条 cookie，再打开网页，网页的请求就带着它。

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

下面的例子各自独立，不沿用这里的变量。

## 读网页登录之后得到的 cookie

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
- 读到的值来自网页和服务器，当作不可信的输入处理。

## 退出登录

清掉网页所在的整个分区，再重新加载它。清完之后，已经显示在屏幕上的内容不会自己消失，所以要重新加载或者销毁那张网页。

```js
/** @param {WebContents} contents */
async function logout(contents) {
  await contents.session.clearStorageData();
  contents.reload();
}
```

**效果**

- 这张网页所在分区的数据全部清掉：cookie、`localStorage`、IndexedDB、缓存。
- 网页重新加载，这一次的请求不带 cookie。重新加载之后显示什么取决于网站，**未在模拟器验证**。

只清 cookie、留着别的：

```js
await session.defaultSession.clearStorageData({ storages: ['cookies'] });
```

**效果**：cookie 全没了，`localStorage` 还在。

只清某一个站点的：

```js
await session.defaultSession.clearStorageData({ origin: 'https://shop.my.app' });
```

**效果**

- `shop.my.app` 的数据清掉，别的站点的不动。
- 写在上一级域名上的 cookie（`domain` 是 `.my.app`）也一起清掉，因为 `shop.my.app` 的请求会带上它。
- 协议和端口不起作用：`http://shop.my.app:8080` 清的是同一批数据。

只删一条 cookie：

```js
await session.defaultSession.cookies.remove('https://my.app/', 'token');
```

**效果**：这个地址下名字是 `token` 的 cookie 没了。本来就没有这条时什么都不发生，不报错。

## 网页登录或退出时得到通知

```js
const jar = session.defaultSession.cookies;
jar.addEventListener('changed', async () => {
  const sid = await jar.get({ url: 'https://my.app/', name: 'sid' });
  console.log(sid.length > 0 ? '已登录' : '未登录');
});
```

**效果**

- App 写的、网页的脚本写的、服务器写的、清数据清掉的，都会派发 [`changed`](../api/cookies/changed-event.md)。
- 事件上没有「是哪一条变了」，所以在回调里自己重新读。
- 一次改动可能派发不止一次，回调里的代码要能承受重复执行。

## 给不同的账号用不同的分区

[`session.fromPartition()`](../api/session/frompartition.md) 的参数和 `WebView` 的 `webPreferences.partition` 是同一种写法，名字相同就是同一份数据。

```js
const work = session.fromPartition('persist:work');
await work.cookies.set({ url: 'https://my.app/', name: 'token', value: 'work-token' });

const workWeb = new WebView({ webPreferences: { partition: 'persist:work' } });
console.log(workWeb.webContents.session === work);
```

**效果**

- 控制台输出 `true`：同一个分区永远是同一个 `Session` 对象。
- 这张网页的请求带着 `work-token`。默认分区和别的分区里的网页看不到这条 cookie。
- 退出这个账号时只清 `work` 这个分区，别的账号不受影响。

## 网页的 cookie 和 `fetch` 的不通

分区里的 cookie 只属于网页。[`fetch`](../api/fetch.md) 有它自己的一份 cookie：在这里写的 cookie，`fetch` 发请求时不会带上；在这里清数据，也清不到 `fetch` 的 cookie。App 自己用 `fetch` 调接口时，令牌要自己放进请求头。

## 参见

- [`Session`](../api/session.md)：分区、清数据
- [`Cookies`](../api/cookies.md)：读、写、删 cookie
- [`Cookie`](../api/cookie.md)：一条 cookie 属于谁、会话 cookie
- [`WebView`](../api/web-view.md)：建网页时用 `partition` 指定分区
