# 处理打开 App 的链接

这一篇讲用户在别的 App 或网页里点了一条指向本 App 的链接时，怎么接到这条链接并跳到对应的页面。用到 [`application`](../api/application.md) 上的 [`openurl`](../api/application/openurl-event.md) 事件，事件对象是 [`OpenURLEvent`](../api/open-url-event.md)。

能打开 App 的链接有两种：自定义协议（`myapp://orders/42`）和通用链接（`https://` 开头、域名经过系统核对的地址）。两种各自怎么配，见[配置 App](project-config.md#声明自定义协议)。到了 JS 这边两种都是 `openurl`，按 `url` 的开头区分。

这一篇的行为**未在模拟器验证**；监听器的注册、事件对象的字段和构造在验收用例里有断言。

## 推荐的做法

- **在 `sceneconnect` 的回调里同步把界面建好，在 `openurl` 的回调里只做跳转。** `openurl` 一定排在同一个场景的 `sceneconnect` 之后，它的回调执行时界面已经在了，于是「App 是被链接启动的」和「App 开着时被链接打开」用的是同一段代码。界面如果要等一个异步的结果才建得出来（比如先读本地存储），`openurl` 的回调执行时界面可能还没好；这时先把 `e.url` 记在变量里，界面建好之后再处理。
- **监听器在 `main.js` 的顶层注册。** App 没在运行时被链接打开，事件在那个场景的 `sceneconnect` 之后派发；事件不会补发，也没有别的方法可以查「App 是被哪条链接启动的」。
- **地址是外部输入，不能直接相信。** 任何 App、任何网页都可以拼出一条 `myapp://` 开头的地址来打开本 App。运行时不检查地址的内容，原样交给 JS。按地址跳到某一页没有问题；转账、改设置、登录这类操作不能只凭地址里的参数就执行，要让用户在界面上确认。自定义协议还有一个问题：别的 App 可以声明同一个协议名，这时系统把链接交给谁没有保证。通用链接没有这个问题，域名是系统核对过的；但链接里的路径和参数同样可以是任何人拼的。

## 第一个链接

先在 `nacre.config.json` 里声明协议：

```json
{ "ios": { "urlSchemes": ["myapp"] } }
```

然后在 `main.js` 的顶层监听 `openurl`。`e.url` 是一个字符串，用 [`URL`](../api/url.md) 拆开：

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log('被打开', url.protocol, url.hostname, url.pathname, url.searchParams.get('ref'));
});
```

**效果**（**未在模拟器验证**）：别的 App 或网页打开 `myapp://orders/42?ref=mail` 时，App 切到前台，控制台输出 `被打开 myapp: orders /42 mail`。App 当时没在运行的话，系统先启动它，这一行在 `sceneconnect` 的回调执行完之后输出。

在模拟器上不需要另一个 App 就能试，在终端里执行：

```bash
xcrun simctl openurl booted 'myapp://orders/42?ref=mail'
```

## 按链接跳到某一页

在回调里用 `e.scene` 找到界面。下面的例子把每个场景的导航控制器记在一个 `Map` 里：

```js
/** @type {Map<UIWindowScene, UINavigationController>} */
const navigators = new Map();

application.addEventListener('sceneconnect', (e) => {
  const home = new UIViewController();
  home.title = '首页';
  home.view.backgroundColor = 'systemBackground';
  const nav = new UINavigationController(home);
  const win = new UIWindow(e.scene);
  win.rootViewController = nav;
  win.makeKeyAndVisible();
  navigators.set(e.scene, nav);
});

application.addEventListener('scenedisconnect', (e) => {
  navigators.delete(e.scene);
});

application.addEventListener('openurl', (e) => {
  const nav = navigators.get(e.scene);
  if (nav === undefined) return;
  const url = new URL(e.url);
  if (url.hostname !== 'orders') return;   // 不认识的地址不处理
  const page = new UIViewController();
  page.title = '订单 ' + url.pathname.slice(1);
  page.view.backgroundColor = 'systemBackground';
  nav.pushViewController(page, { animated: true });
});
```

**效果**（**未在模拟器验证**）：打开 `myapp://orders/42` 时，导航栈推入一页，标题是「订单 42」。App 是被这条链接启动的时候，先出现首页，随即推入订单页。打开 `myapp://settings` 时什么都不发生。

通用链接的 `url` 以 `https://` 开头，回调里用同样的办法拆。

## 在测试里模拟一次打开

```js
application.addEventListener('sceneconnect', (e) => {
  application.dispatchEvent(new OpenURLEvent('openurl', {
    url: 'myapp://orders/42',
    scene: e.scene,
  }));
});
```

**效果**：`openurl` 的监听器被调用一次，`e.url` 是 `'myapp://orders/42'`，`e.sourceApplication` 是 `null`。系统那边什么都不发生。见 [`OpenURLEvent()`](../api/open-url-event/constructor.md)。

## 参见

- [`openurl`](../api/application/openurl-event.md)、[`OpenURLEvent`](../api/open-url-event.md)
- [配置 App](project-config.md#声明自定义协议)：声明自定义协议和通用链接的域名
- [`URL`](../api/url.md)：拆开地址
- [在页面之间跳转](navigation.md)
