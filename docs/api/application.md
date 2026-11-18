---
type: reference
native: UIApplication
status: partial
---

# 全局对象 `application`

**`application`** 表示正在运行的这个 App。它是运行时提供的全局对象，类是 `Application`。运行时在 App 启动时创建它，整个 App 只有这一个，一直存在到 App 结束。脚本的任何位置都可以直接使用，不需要创建，也不能再创建一个。

`application` 管整个 App 范围内的事：

- **App 的信息**：包名、版本、配置文件的内容。
- **App 的状态**：在前台还是后台，当前有哪些场景。
- **App 级的事件**：可以建界面了、进入后台、内存不足、被一条链接打开、有没处理的异常。
- **App 级的能力**：本地存储和文件的入口，以及让系统打开一个 URL（往外打开；别的 App 打开本 App 是上一条里的事件）。装了 `@nacrejs/keychain` 之后，Keychain 的入口也在这里。装了 `@nacrejs/keychain` 之后，Keychain 的入口也在这里。
- **原生模块的入口**：App 自己的原生代码和第三方原生 SDK 提供的方法，从 `application.nativeModules` 调。

界面不在 `application` 上。界面属于场景（[`UIWindowScene`](ui-window-scene.md)）：场景表示 App 界面的一个实例，由系统创建，窗口要建在场景上才能显示。`application` 负责在场景可用时发出通知，并记录当前有哪些场景。

## 界面代码写在 `sceneconnect` 里

App 启动后，运行时先把整个 `main.js` 执行完，系统随后才创建场景。场景创建好之后，`application` 派发 `sceneconnect` 事件，事件对象的 `scene` 就是这个场景。

所以在 `main.js` 顶层执行的那段时间里没有场景：`application.scenes` 是空数组，`application.scenes[0]` 是 `undefined`，建不出能显示的窗口。建界面的代码要写在 `sceneconnect` 的回调里。

监听器要在 `main.js` 的顶层注册。运行时保证 `sceneconnect` 在 `main.js` 执行完之后才派发，顶层注册的监听器一定能收到。事件不会补发：如果等到某个 `Promise` 兑现之后才注册，这时事件可能已经派发过，监听器就收不到了。

`sceneconnect` 可能派发不止一次。App 启动时派发一次；之后系统如果销毁了场景，用户回到 App 时系统创建一个新的场景，`sceneconnect` 再派发一次。所以回调要写成可以重复执行的：每次都用 `e.scene` 从头建一遍界面，不依赖上一次建出来的窗口和页面。启动代码怎么组织、数据放在哪里，见 [`UIWindowScene`](ui-window-scene.md) 的「推荐的做法」一节。

系统在弹出键盘时也会创建自己内部用的场景。这类场景不会引起 `sceneconnect`，也不在 `application.scenes` 里。

## App 进入后台之后

用户回到主屏幕或切到别的 App 时，App 进入后台。`application` 依次派发 `inactive` 和 `background`，这两个事件的回调会执行。

进入后台后，系统会在一小段时间之后暂停 App：JS 不再执行，定时器不再触发。用户回到 App 时从暂停的地方继续，JS 里的变量都还在。系统也可能在后台直接结束 App，这时不会有任何通知，下次打开时 `main.js` 从头执行。**「后台会被暂停、定时器停止、恢复后继续」来自 iOS 的定义，未在模拟器验证。** 进入后台时还没完成的网络请求会怎样，**未在模拟器验证**。

推荐的做法是：**需要保留的数据在 `background` 事件里保存完**，写进 [`application.storage`](storage.md)。它的写入是同步的，`set()` 返回时新值已经生效，由系统负责写入磁盘。不要等 `beforeterminate`：App 在后台被结束时这个事件不一定派发（**未在模拟器验证**）。

进入后台后申请更多执行时间的能力还没有，见[还不能做的](#还不能做的)。

## 没处理的异常不会让 App 退出

JS 里抛出的异常没有被 `try` / `catch` 接住时，App 不会退出。抛出异常的那一段代码停止执行，其余部分照常运行：监听器还在，定时器照常触发，界面可以继续操作。

运行时按异常出现的位置分两种方式处理：

| 异常出现在 | 运行时怎么处理 | 能在哪里统一接到 |
| --- | --- | --- |
| `main.js` 顶层、定时器的回调、事件监听器的回调（包括 `sceneconnect` 的回调、按钮的点击回调） | 在 `application` 上派发 `error`。没有监听器取消时，向控制台输出以 `Uncaught` 开头的错误日志 | `error` 事件 |
| `Promise` 被拒绝，并且没有挂处理函数。`async` 函数里抛出的异常属于这一种 | 在 `application` 上派发 `unhandledrejection`。没有监听器取消时，输出以 `Uncaught (in promise)` 开头的错误日志 | `unhandledrejection` 事件 |

`main.js` 顶层抛出异常时，这一行之后的顶层代码不再执行。在它之前注册的监听器仍然有效。

事件监听器抛出异常时，同一个事件的其余监听器照常执行，`error` 在下一个监听器执行之前就派发了。

在这两个事件的监听器里调 `preventDefault()`，取消的只是运行时输出的那条默认日志。异常已经发生，被中断的代码不会恢复执行。不调 `preventDefault()` 时，监听器和默认日志都会执行。

推荐的做法见[统一处理错误](#统一处理错误)。

## 被别的 App 或一条链接打开时

用户在别的 App 或网页里点了一条指向本 App 的链接，系统把 App 切到前台，`application` 派发 `openurl`。事件对象的 `url` 是那条链接的完整地址，`scene` 是系统把它交给了哪个场景。

能打开 App 的链接有两种：

- **自定义协议**：`myapp://orders/42` 这样的地址。协议名（`myapp`）在 `nacre.config.json` 的 `ios.urlSchemes` 里声明，声明之后系统才把这种地址交给本 App。
- **通用链接**：普通的 `https://` 地址。要在项目里声明关联的域名，并在那个域名的网站上放一份文件；系统核对通过后，才把这个域名下的链接交给本 App，而不是交给浏览器。

两种各自怎么配，见[配置 App](../guides/project-config.md#声明自定义协议)。到了 JS 这边两种都是 `openurl`，按 `url` 的开头区分。

这一节和下面所有关于 `openurl` 的行为**未在模拟器验证**；监听器的注册、事件对象的字段和构造在验收用例里有断言。

**App 没在运行时也收得到。** 用户点链接时 App 还没启动，系统先启动 App；运行时在那个场景的 `sceneconnect` 之后派发 `openurl`。所以监听器和 `sceneconnect` 的一样，要在 `main.js` 的顶层注册。事件不会补发，也没有别的方法可以查「App 是被哪条链接启动的」。App 已经在运行时（在前台，或者在后台还没被系统结束），只派发 `openurl`，不派发 `sceneconnect`。

推荐的写法是：在 `sceneconnect` 的回调里同步把界面建好，在 `openurl` 的回调里只做跳转。`openurl` 一定排在同一个场景的 `sceneconnect` 之后，它的回调执行时界面已经在了，于是「App 是被链接启动的」和「App 开着时被链接打开」用的是同一段代码。界面如果要等一个异步的结果才建得出来（比如先读本地存储），`openurl` 的回调执行时界面可能还没好；这时先把 `e.url` 记在变量里，界面建好之后再处理。

**地址是外部输入，不能直接相信。** 任何 App、任何网页都可以拼出一条 `myapp://` 开头的地址来打开本 App。运行时不检查地址的内容，原样交给 JS。按地址跳到某一页没有问题；转账、改设置、登录这类操作不能只凭地址里的参数就执行，要让用户在界面上确认。自定义协议还有一个问题：别的 App 可以声明同一个协议名，这时系统把链接交给谁没有保证。通用链接没有这个问题，域名是系统核对过的，别的 App 声明不了；但链接里的路径和参数同样可以是任何人拼的。

## 收到内存警告时

设备内存不足时，系统先通知各个 App 释放内存，`application` 派发 `memorywarning`。App 在这时应当丢掉可以重新得到的数据：缓存的图片、已经解析好但还能再解析的数据、不在屏幕上的页面。

运行时自己不会因为内存警告丢掉 JS 里的任何数据，释放什么由 App 的代码决定。不处理这个事件不会报错。内存仍然不足时系统会结束 App，结束时没有通知。**「不释放就会被结束」来自 iOS 的定义，未在模拟器验证。**

## 在 `application` 上放自己的数据和事件

`application` 可以监听和派发自己定义的事件，事件名可以是任意字符串，写法见[派发自己的事件](#派发自己的事件)。App 的各个部分可以用它互相通知。

`application` 是一个普通的 JS 对象，可以往上面加自己的属性。**不推荐这样做**：类型定义里没有这些属性，每次读写都要转型；`application` 在 App 运行期间一直存在，挂在上面的东西永远不会被回收。App 范围内共享的数据放在模块自己的变量里。场景、窗口、页面尤其不要挂上去，原因见 [`UIWindowScene`](ui-window-scene.md)。

## 完整例子

下面的代码是每个 App 的起点：打印 App 的信息，等系统准备好之后建窗口和页面。

```js
// 1. 读 App 的信息。这几项在脚本一开始就能读
console.log('包名', application.bundleIdentifier);
console.log('版本', application.version, '构建号', application.build);

// 2. 这时还没有场景，所以还不能建界面
console.log('场景个数', application.scenes.length);

// 3. 系统把场景准备好之后派发 sceneconnect。界面代码写在这里
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  console.log('界面建好了，场景个数', application.scenes.length);
});
```

**效果**

- 控制台先输出三行。包名是 `com.example.shop` 的 App 运行时是：
  - `包名 com.example.shop`
  - `版本 0.1.0 构建号 1`
  - `场景个数 0`
- 随后屏幕从黑色变成系统背景色：浅色模式下是白色，深色模式下是黑色。
- 控制台输出 `界面建好了，场景个数 1`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

回调里那五行的含义见 [`UIWindow`](ui-window.md) 和 [`UIViewController`](ui-view-controller.md)。回调里的 `win` 和 `page` 不需要保存到回调外面：窗口建在场景上、页面交给窗口之后，运行时会保管它们。

## 常见用法

以下例子都可以直接写在 `main.js` 的顶层。用到界面的例子会自己监听 `sceneconnect`。

### 启动后建界面

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**效果**：App 启动后屏幕显示一个空白页面，底色是系统背景色。

`e.scene` 是系统刚创建的场景，类型是 [`UIWindowScene`](ui-window-scene.md)。在回调里它和 `application.scenes` 里的第一个元素是同一个对象。

这段回调在场景被销毁又重建时会再执行一次，所以它只依赖 `e.scene` 和回调外面的数据。完整的组织方式见 [`UIWindowScene`](ui-window-scene.md) 的「推荐的做法」一节。

### 读 App 的名字和版本

```js
console.log(application.bundleIdentifier);
console.log(application.version);
console.log(application.build);
console.log(application.info.CFBundleDisplayName);
```

**效果**：控制台依次输出包名、版本号、构建号、App 的名字，比如 `com.example.shop`、`0.1.0`、`1`、`Shop`。这四个值来自项目的 [`nacre.config.json`](../guides/project-config.md)。

- `bundleIdentifier` 是包名：App 在系统里的唯一标识，写法像倒过来的域名。
- `version` 是给用户看的版本号。`build` 是构建号，同一个版本可以有多个构建。
- App 的显示名称没有单独的属性，从 `info` 里读，见下一节。**`CFBundleDisplayName` 读到 `Nacre` 未在模拟器验证**，值来自工程配置。

### 读 Info.plist 里的任意字段

Info.plist 是每个 iOS App 自带的配置文件，记录包名、版本、支持的方向等。它在构建 App 时生成，App 运行期间不变。`application.info` 是它的全部内容，在脚本一开始就能读。

```js
console.log(Object.keys(application.info).length);
console.log(application.info.MinimumOSVersion);
console.log(Object.isFrozen(application.info));
```

**效果**

- 第一行输出键的个数。本仓库的 App 是 `26`。
- 第二行输出 App 要求的最低系统版本，是一个字符串。
- 第三行输出 `true`。`info` 和它里面的每一层对象都是冻结的，写入会抛 `TypeError`。

读一个 Info.plist 里没有的键得到 `undefined`，不报错。`info` 里每个值的类型声明是 `unknown`，因为每个 App 的 Info.plist 内容不同。读嵌套的字段要先判断类型：

```js
const manifest = application.info.UIApplicationSceneManifest;
if (typeof manifest === 'object' && manifest !== null) {
  console.log('有场景配置');
}
```

**效果**：控制台输出 `有场景配置`。

### 读当前运行状态

```js
console.log(application.state);
```

**效果**：在 `main.js` 顶层执行时输出 `background`。界面显示出来、App 可以操作之后再读，得到 `active`。

启动时读到 `background` 是 iOS 的事实：脚本开始执行时场景还没有接入，系统认为 App 还不在前台。三种取值的含义见[前台、后台和运行状态](#前台后台和运行状态)。

### 知道 App 进后台和回前台

```js
for (const type of ['inactive', 'background', 'foreground', 'active']) {
  application.addEventListener(type, (e) => {
    console.log(e.type, '此刻 state =', application.state);
  });
}
```

**效果**：用户回到主屏幕，再点图标回到 App，控制台依次输出：

- `inactive 此刻 state = active`
- `background 此刻 state = background`
- `foreground 此刻 state = background`
- `active 此刻 state = active`

`inactive` 和 `foreground` 表示「即将」，所以这两个事件到达时 `state` 还是旧值。

`inactive` 不只在进后台之前派发：来电、下拉通知中心时也会派发，随后 App 可能直接回到活动状态。保存数据用 `background`，它只在 App 确实进了后台时派发，见 [App 进入后台之后](#app-进入后台之后)。

App 启动时也会依次派发 `foreground` 和 `active`。

### 收到内存警告时释放缓存

设备内存不足时，系统先通知各个 App 释放内存。收到通知后丢掉可以重新得到的数据，见[收到内存警告时](#收到内存警告时)。

```js
/** @type {Map<string, string>} */
const cache = new Map();

application.addEventListener('memorywarning', () => {
  cache.clear();
  console.log('缓存已清空');
});
```

**效果**：系统发出内存警告时，控制台输出 `缓存已清空`。

在模拟器里触发：设备菜单里选 Simulate Memory Warning。

### 统一处理错误

推荐把两个错误事件的监听器写在 `main.js` 的最前面，交给同一个函数处理。写在最前面，是因为排在它前面的顶层代码抛出的异常它收不到。

事件监听器里抛出的异常也派发 `error`，所以 `sceneconnect` 的回调、点击的回调里出的错，同样进这个函数，不用把回调包起来。

```js
/** @param {unknown} reason */
function report(reason) {
  console.error('出错了', String(reason));
}

application.addEventListener('error', (e) => {
  report(e.error);
  e.preventDefault();
});
application.addEventListener('unhandledrejection', (e) => {
  report(e.reason);
  e.preventDefault();
});

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
  throw new Error('建界面时出错');
});
```

**效果**

- 屏幕显示空白页面。`throw` 之前的代码已经执行完，窗口照常显示。
- 控制台输出 `出错了 Error: 建界面时出错`。调了 `preventDefault()`，所以没有以 `Uncaught` 开头的那条默认日志。
- App 继续运行。

验收用例验证过：监听器抛出异常后 `error` 事件收到一次，`e.error` 就是抛出的那个对象，同一个事件的其余监听器照常执行。这段代码没有作为一个整体在模拟器运行过。

> **注意**：`error` 的监听器自己抛出异常时，运行时不会为它再派发一次 `error`，只向控制台输出默认日志。

### 捕获没处理的异常

```js
application.addEventListener('error', (e) => {
  console.log('出错位置', e.filename, e.lineno);
  console.log('是 Error 对象吗', e.error instanceof Error);
  e.preventDefault();
});

throw new Error('没人接的异常');
```

**效果**

- 控制台输出 `出错位置 main.js` 加上 `throw` 那一行的行号。
- 控制台输出 `是 Error 对象吗 true`。
- 因为调了 `preventDefault()`，运行时不再输出默认的错误日志。不调时，运行时用 `console.error` 的级别输出一条以 `Uncaught` 开头的日志。

事件对象的字段见 [`ErrorEvent`](#errorevent)。

> **注意**：脚本顶层抛出的异常会让 `main.js` 剩下的顶层代码不再执行。`error` 事件只是通知，不会恢复执行。App 不会退出，已经注册的监听器仍然有效。

### 捕获没处理的 Promise 拒绝

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('没处理的拒绝', String(e.reason));
  e.preventDefault();
});

Promise.reject(new Error('没人接的拒绝'));
```

**效果**

- 控制台输出 `没处理的拒绝 Error: 没人接的拒绝`。
- 因为调了 `preventDefault()`，运行时不再输出默认日志。不调时，运行时输出一条错误级别的日志，开头是 `Uncaught (in promise)`，后面是拒绝的原因。

事件对象的字段见 [`PromiseRejectionEvent`](#promiserejectionevent)。

拒绝之后很快补挂了处理函数的 `Promise` 不会被上报，见[错误类事件](#错误类事件)。

### 打开一个 URL

把一个 URL 交给系统打开：网址由浏览器打开，`tel:` 由电话打开，其他 App 注册过的 scheme 由那个 App 打开。

```js
application.openURL('https://example.com').then((ok) => {
  console.log('打开成功了吗', ok);
});
```

**效果**：系统切到浏览器并打开这个网址，控制台输出 `打开成功了吗 true`。**切到浏览器这一步未在模拟器验证**；合法 URL 兑现为 `true` 验证过。

失败时 Promise 不会被拒绝，而是兑现为 `false`：

```js
application.openURL('nacre-nonexistent-scheme://test').then((ok) => {
  console.log(ok);
});
application.openURL('这不是一个合法 URL::::').then((ok) => {
  console.log(ok);
});
```

**效果**：两次都输出 `false`。第一个是没有 App 能处理这个 scheme，第二个是 URL 本身不合法。App 不会被切走。

### 处理打开 App 的链接

先在 `nacre.config.json` 里声明协议（见[配置 App](../guides/project-config.md#声明自定义协议)）：

```json
{ "ios": { "urlSchemes": ["myapp"] } }
```

然后在 `main.js` 的顶层监听 `openurl`。`e.url` 是一个字符串，用 [`URL`](url.md) 拆开：

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log('被打开', url.protocol, url.hostname, url.pathname, url.searchParams.get('ref'));
});
```

**效果**（未在模拟器验证）：别的 App 或网页打开 `myapp://orders/42?ref=mail` 时，App 切到前台，控制台输出 `被打开 myapp: orders /42 mail`。App 当时没在运行的话，系统先启动它，这一行在 `sceneconnect` 的回调执行完之后输出。

在模拟器上不需要另一个 App 就能试，在终端里执行：

```bash
xcrun simctl openurl booted 'myapp://orders/42?ref=mail'
```

要按链接跳到某一页，在回调里用 `e.scene` 找到界面。下面的例子把每个场景的导航控制器记在一个 `Map` 里：

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

**效果**（未在模拟器验证）：打开 `myapp://orders/42` 时，导航栈推入一页，标题是「订单 42」。App 是被这条链接启动的时候，先出现首页，随即推入订单页。打开 `myapp://settings` 时什么都不发生。

通用链接的 `url` 以 `https://` 开头，回调里用同样的办法拆。事件对象的字段见 [`OpenURLEvent`](#openurlevent)。

### 读设备的环境设置

```js
console.log(application.layoutDirection);
console.log(application.contentSizeCategory);
console.log(application.backgroundRefreshStatus);
console.log(application.protectedDataAvailable);
```

**效果**：控制台输出四行，每行是当前设备上的值。例如系统语言是从左往右书写、字体大小是默认档时，前两行是 `ltr` 和 `UICTContentSizeCategoryL`。**后两行的具体值未在模拟器验证**，取值范围见[环境与偏好](#环境与偏好)。

- `layoutDirection`：界面的书写方向，由系统语言决定。
- `contentSizeCategory`：用户在系统设置里选的字体大小档位。
- `backgroundRefreshStatus`：用户是否允许 App 在后台刷新内容。
- `protectedDataAvailable`：加密保护的文件现在能不能读。设备锁屏期间是 `false`。

深色还是浅色、屏幕是几倍的，不在 `application` 上，从场景或视图的 `traitCollection` 读，见[外观特征](ui-trait-collection.md)。设备型号和系统版本见 [`UIDevice`](ui-device.md)。系统语言还读不到，见[还不能做的](#还不能做的)。

### 让屏幕保持常亮

iOS 在一段时间没有触摸后会自动锁屏。播放视频、显示二维码时可以关掉这个行为。

```js
application.idleTimerDisabled = true;
console.log(application.idleTimerDisabled);
```

**效果**：控制台输出 `true`。App 在前台期间设备不再自动锁屏。**「不再自动锁屏」未在模拟器验证。**

这个设置对整个 App 生效，不会自动恢复。离开需要常亮的页面时设回 `false`，否则设备在 App 位于前台期间一直不锁屏，耗电增加。

### 判断能不能开多个窗口

```js
if (application.supportsMultipleScenes) {
  console.log('可以开多个窗口');
} else {
  console.log('只有一个窗口');
}
```

**效果**：本仓库的 App 输出 `只有一个窗口`。

这个值是「Info.plist 里声明了支持」并且「当前设备允许」的结果。只想读声明值，从 `application.info.UIApplicationSceneManifest` 里取 `UIApplicationSupportsMultipleScenes`。

### 保存数据

`application` 上有两个存数据的入口，装了 `@nacrejs/keychain` 之后有第三个。各有自己的文档：

| 属性 | 存什么 | 文档 |
| --- | --- | --- |
| `application.storage` | 设置、小状态。键值对，同步读写 | [本地存储](storage.md) |
| `application.fileSystem` | 文件。全部返回 Promise | [文件读写](filesystem.md) |
| `application.keychain` | 令牌和密码，加密保存。全部返回 Promise。**要先装 `@nacrejs/keychain`**，没装时这个属性不存在 | [Keychain](keychain.md) |

```js
application.storage.set('theme', 'dark');
console.log(application.storage.get('theme'));
```

**效果**：控制台输出 `dark`。关掉 App 再打开，这个值还在。

### 调原生模块的方法

原生模块是用 ObjC 或 Swift 写的一段代码，按名字登记进 App，提供一组方法和事件。它们跟着 npm 包进来。`application.nativeModules` 按名字给出模块，各有自己的文档：[原生模块](native-modules.md)。

下面用示例模块 `@nacrejs/example-module`（登记的名字是 `example`），先在项目里装上它。

```js
const modules = application.nativeModules;
if (modules.has('example')) {
  const example = modules.get('example');
  console.log(example.call('add', 1, 2));
} else {
  console.log('没有装示例模块');
}
```

**效果**（未在模拟器验证）：装了 `@nacrejs/example-module` 的项目输出 `3`，没装的输出 `没有装示例模块`。

### 派发自己的事件

`application` 可以监听和派发自己定义的事件。事件名可以是任意字符串，只要不和[已有的事件名](#事件)相同。App 里互不引用的两部分代码可以用它互相通知。

```js
application.addEventListener('login', (e) => {
  console.log('收到', e.type);
});

application.dispatchEvent(new Event('login'));
```

**效果**：`dispatchEvent()` 返回之前，控制台输出 `收到 login`。

自己派发的事件是同步的。要让监听器能取消它，构造时传 `{ cancelable: true }`，见 [`dispatchEvent()`](#dispatchevent)。

## 继承关系

```
EventTarget
  └─ Application
       └─ application（唯一实例）
```

`addEventListener()`、`removeEventListener()`、`dispatchEvent()` 来自 `EventTarget`。

`EventTarget` 是所有能发事件的对象的基类，`Event` 是事件对象的基类。它们由运行时提供，是全局的类，可以直接 `new`。它们的行为有三条：

- 事件只派发给注册了监听器的那个对象，没有捕获和冒泡。
- `addEventListener()` 的选项只有 `once`。
- 监听器只能是函数。

## 场景

场景（scene）表示 App 界面的一个实例，类是 [`UIWindowScene`](ui-window-scene.md)。窗口必须建在某个场景里才能显示。iPhone 上一个 App 通常只有一个场景。

场景由系统创建，也由系统销毁，JS 不能构造。拿到场景有两个途径：

| 途径 | 什么时候有值 |
| --- | --- |
| `sceneconnect` 事件的 `e.scene` | 事件派发时 |
| `application.scenes` | `sceneconnect` 派发之后。脚本刚开始执行时是空数组 |

所以界面代码的入口固定是 `sceneconnect`。场景被销毁时派发 `scenedisconnect`，这个场景同时从 `application.scenes` 里移除。

`application` 和场景的分工：

| | 管什么 |
| --- | --- |
| `application` | 整个 App：信息、所有场景合在一起的前后台状态、内存警告、错误 |
| 场景 | 一个界面实例：它的窗口、它自己的前后台状态 |

## 前台、后台和运行状态

iOS 的 App 不是一直在运行。用户回到主屏幕或切到别的 App 时，当前 App 进入后台，系统随后可能暂停它，也可能直接结束它，见 [App 进入后台之后](#app-进入后台之后)。

`application.state` 有三种正常取值：

| 取值 | 含义 |
| --- | --- |
| `'active'` | 在前台，并且在接收用户的操作 |
| `'inactive'` | 在前台，但暂时不接收操作。例如正在切换 App、来电、下拉了通知中心 |
| `'background'` | 不在屏幕上。脚本刚开始执行时也是这个值 |

状态变化时派发四个事件。其中两个在状态改变之前派发：

| 事件 | 含义 | 事件到达时 `state` 的值 |
| --- | --- | --- |
| `inactive` | 即将离开活动状态 | `'active'`，还是旧值 |
| `background` | 已经进入后台 | `'background'` |
| `foreground` | 即将回到前台 | `'background'`，还是旧值 |
| `active` | 已经进入活动状态 | `'active'` |

场景也有同名的四个事件。`application` 上的是所有场景合在一起的状态，场景上的是那一个场景的状态。两者读到的值在同一时刻可能不同，见 [`UIWindowScene`](ui-window-scene.md#场景的状态和-app-的状态)。

## 系统事件不能取消

`application` 上的事件分两类，区别在于能不能 `preventDefault()`。

| 类别 | 包括 | `cancelable` | `preventDefault()` |
| --- | --- | --- | --- |
| 系统通知 | `sceneconnect`、前后台事件、`memorywarning` 等，除下面两个以外的全部 | `false` | 没有效果，也不报错 |
| 错误类事件 | `error`、`unhandledrejection` | `true` | 阻止运行时输出默认的错误日志 |

系统通知不能取消，是因为监听器不是在系统发出通知的那一刻执行的。运行时稍后才派发，那时系统的处理已经结束。见[运行时怎么工作](how-it-works.md#事件)。

错误类事件的 `preventDefault()` 取消的只是那条默认日志。异常已经发生，被中断的代码不会恢复执行。

## 成员说明

### 构造

`application` 由运行时创建。不能再构造一个：

```js
try {
  new Application();
} catch (err) {
  console.log(String(err));
}
```

**效果**：控制台输出 `TypeError: Illegal constructor`。

### 应用信息

这四个属性在 App 运行期间不变，所以没有变化事件。

| 属性 | 类型 | 可读 | 可写 | 示例值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `info` | 对象，值的类型是 `unknown` | 是 | 否 | 26 个键的对象 | Info.plist 的全部内容。整个对象逐层冻结 |
| `bundleIdentifier` | 字符串 | 是 | 否 | 项目配置里的 `bundleId`，比如 `'com.example.shop'` | 包名。等于 `info.CFBundleIdentifier` |
| `version` | 字符串 | 是 | 否 | `'0.1.0'` | 给用户看的版本号。等于 `info.CFBundleShortVersionString` |
| `build` | 字符串 | 是 | 否 | `'1'` | 构建号。等于 `info.CFBundleVersion` |

`info` 是运行时读到的那一份 Info.plist，不是工程里的源文件：

- 源文件里的变量已经替换成实际的值。
- 构建工具添加的键也在里面，比如 `MinimumOSVersion`。
- 系统还会算出一个 `CFBundleNumericVersion`。

Info.plist 里不能用 JSON 表示的值（日期、二进制数据）会转成字符串。

### 运行状态

| 属性 | 类型 | 可读 | 可写 | 示例值 | 含义 | 变化时派发 |
| --- | --- | --- | --- | --- | --- | --- |
| `state` | `'active'` \| `'inactive'` \| `'background'` \| `'unknown'` | 是 | 否 | 启动时 `'background'` | 前后台状态。取值见[前台、后台和运行状态](#前台后台和运行状态) | `active`、`inactive`、`background`、`foreground` |
| `protectedDataAvailable` | 布尔 | 是 | 否 | — | `true`：加密保护的文件可以读。`false`：设备已锁屏，这些文件读不了 | `protecteddataavailable`、`protecteddataunavailable` |
| `scenes` | [`UIWindowScene`](ui-window-scene.md) 的只读数组 | 是 | 否 | 启动时 `[]` | 当前已接入的场景。系统内部的窗口不在里面 | `sceneconnect`、`scenedisconnect` |

`state` 的 `'unknown'` 只在系统返回了运行时不认识的状态值时出现，正常情况下读不到。

同一个场景每次从 `scenes` 里读到的都是同一个 JS 对象，可以用 `===` 比较。

### 环境与偏好

| 属性 | 类型 | 可读 | 可写 | 示例值 | 含义 | 变化时派发 |
| --- | --- | --- | --- | --- | --- | --- |
| `supportsMultipleScenes` | 布尔 | 是 | 否 | `false` | `true`：可以同时有多个场景。`false`：只有一个 | 没有。iOS 不提供对应的通知 |
| `layoutDirection` | `'ltr'` \| `'rtl'` | 是 | 否 | `'ltr'` | 界面的书写方向。`'ltr'` 从左往右，`'rtl'` 从右往左（阿拉伯语、希伯来语） | 没有。iOS 不提供对应的通知 |
| `contentSizeCategory` | 字符串 | 是 | 否 | `'UICTContentSizeCategoryL'` | 用户选的字体大小档位。值是 iOS 的原始字符串，`L` 是默认档 | `contentsizecategorychange` |
| `backgroundRefreshStatus` | `'available'` \| `'denied'` \| `'restricted'` \| `'unknown'` | 是 | 否 | — | App 能不能在后台刷新内容。取值见下表 | `backgroundrefreshstatuschange` |
| `prefersReducedResourceUsage` | 布尔 | 是 | 否 | — | `true`：系统建议 App 减少资源消耗。`false`：没有这个建议。iOS 27 以下的系统上总是 `false` | `reducedresourceusagechange` |

`backgroundRefreshStatus` 的取值：

| 取值 | 含义 |
| --- | --- |
| `'available'` | 用户允许后台刷新 |
| `'denied'` | 用户在系统设置里关掉了这个 App 的后台刷新 |
| `'restricted'` | 被设备的限制策略禁止，比如家长控制。用户自己改不了 |
| `'unknown'` | 系统返回了运行时不认识的值。正常情况下读不到 |

### 可写属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 | 变化时派发 |
| --- | --- | --- | --- | --- | --- | --- |
| `idleTimerDisabled` | 布尔 | 是 | 是 | `false` | `true`：设备不自动锁屏。`false`：按系统设置自动锁屏 | 没有。只有 App 自己的代码能改它 |

写入立刻生效，写完马上读得到新值。写入非布尔值时按 JS 的真假值规则转换。

### 存储

这几个属性每次读到的都是同一个对象。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `storage` | `NSUserDefaults` | 是 | 否 | 键值存储。见[本地存储](storage.md) |
| `fileSystem` | `FileSystem` | 是 | 否 | 文件读写。见[文件读写](filesystem.md) |
| `keychain` | `Keychain` | 是 | 否 | 令牌和密码的加密存储。**只在装了 `@nacrejs/keychain` 的项目里有**，没装时 `'keychain' in application` 是 `false`。见 [Keychain](keychain.md) |

### 原生模块

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `nativeModules` | `NativeModules` | 是 | 否 | 登记进这个 App 的原生模块。每次读到的是同一个对象，每个项目都有；一个模块都没有时它的 `names` 是空数组。见[原生模块](native-modules.md) |

### 方法

#### `openURL()`

把一个 URL 交给系统打开。

```js
application.openURL('https://example.com').then((ok) => {
  console.log(ok);
});
```

**效果**：系统处理完之后，控制台输出 `true` 或 `false`。

- **参数** `url`：字符串。不是字符串的值会先转成字符串。
- **返回**：`Promise<boolean>`。`true` 表示系统打开了它。`false` 表示 URL 不合法，或者没有 App 能处理它。
- **出错**：不抛错，Promise 也不会被拒绝。失败只通过 `false` 表示。

场景上有同名的方法，见 [`UIWindowScene`](ui-window-scene.md)。

#### `addEventListener()`

注册监听器。

```js
application.addEventListener('memorywarning', () => {
  console.log('内存不足');
}, { once: true });
```

**效果**：第一次收到内存警告时输出 `内存不足`，之后不再输出。

- **参数** `type`：事件名，见[事件](#事件)。也可以是自己定的名字。
- **参数** `callback`：函数，收到事件对象。传 `null` 时什么都不做。
- **参数** `options`：可选。`{ once: true }` 表示触发一次后自动移除。
- **返回**：无。
- 同一个事件名下，同一个函数重复注册只算一次。
- **出错**：
  - 少传参数：`TypeError: Failed to execute 'addEventListener': 2 arguments required.`
  - `callback` 不是函数：`TypeError: Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

#### `removeEventListener()`

移除监听器。

```js
const onWarning = () => {
  console.log('内存不足');
};
application.addEventListener('memorywarning', onWarning);
application.removeEventListener('memorywarning', onWarning);
```

**效果**：之后收到内存警告时不输出。

- **参数**：`type` 和 `callback`，要和注册时是同一个事件名、同一个函数。
- **返回**：无。
- 没注册过的函数不报错，什么都不做。

#### `dispatchEvent()`

同步派发一个事件：依次调用这个事件名下的所有监听器，全部执行完才返回。

```js
application.addEventListener('beforelogout', (e) => {
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
const ok = application.dispatchEvent(event);
console.log(ok);
```

**效果**：控制台输出 `false`，表示有监听器调了 `preventDefault()`。

- **参数** `event`：`Event` 或它的子类的实例。
- **返回**：布尔。有监听器调了 `preventDefault()` 并且事件的 `cancelable` 是 `true` 时返回 `false`，其余情况返回 `true`。
- 一个监听器抛出异常，不影响后面的监听器，也不会从 `dispatchEvent()` 抛出来。运行时为它在 `application` 上派发 `error`，见[没处理的异常不会让 App 退出](#没处理的异常不会让-app-退出)。
- 派发过程中被移除的监听器，如果还没轮到，这一次不再执行。派发过程中新加的监听器，这一次不执行，下一次派发才执行。这两条和浏览器一致。
- **出错**：参数不是 `Event`：`TypeError: Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.`

### 事件

事件名全部小写，没有分隔符。

除[错误类事件](#错误类事件)以外，下面的事件都由系统通知触发，有三点共同之处：

- 事件对象的 `cancelable` 是 `false`，`preventDefault()` 没有效果。
- `target` 是 `application`。
- 监听器不是在系统发出通知的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md#事件)。

#### 场景事件

| 事件 | 什么时候派发 | 事件对象上多出的字段 |
| --- | --- | --- |
| `sceneconnect` | 系统创建好了一个场景。App 启动后派发一次；场景被销毁后又重建时再派发 | `scene`：新的 [`UIWindowScene`](ui-window-scene.md) |
| `scenedisconnect` | 系统销毁了一个场景。**未在模拟器验证** | `scene`：被销毁的 [`UIWindowScene`](ui-window-scene.md) |

#### 链接事件

| 事件 | 事件对象 | 什么时候派发 |
| --- | --- | --- |
| `openurl` | [`OpenURLEvent`](#openurlevent) | 别的 App 或一条链接打开了本 App。App 没在运行时，在那个场景的 `sceneconnect` 之后派发。系统一次交来几个地址时，每个地址派发一次 |

- **未在模拟器验证。**
- 地址的协议要先声明，见[配置 App](../guides/project-config.md#声明自定义协议)。没声明的协议系统不会交给本 App，也就没有事件。
- 本 App 自己调 [`openURL()`](#openurl) 往外打开别的 App，不派发这个事件。

#### 前后台事件

| 事件 | 什么时候派发 | 事件到达时 `state` 的值 |
| --- | --- | --- |
| `inactive` | App 即将离开活动状态 | `'active'` |
| `background` | App 已经进入后台 | `'background'` |
| `foreground` | App 即将回到前台 | `'background'` |
| `active` | App 已经进入活动状态 | `'active'` |

事件对象只有 `Event` 的基本字段。

#### 系统通知

事件对象只有 `Event` 的基本字段。要知道新的值，在回调里读对应的属性。

| 事件 | 什么时候派发 | 对应的属性 | 是否在模拟器验证 |
| --- | --- | --- | --- |
| `memorywarning` | 系统内存不足，App 应该释放缓存 | — | 是 |
| `screenshot` | 用户截了屏 | — | **未在模拟器验证** |
| `significanttimechange` | 时间发生大的变化：过了午夜、时区变了、夏令时切换 | — | **未在模拟器验证** |
| `contentsizecategorychange` | 用户改了系统字体大小 | `contentSizeCategory` | **未在模拟器验证** |
| `protecteddataavailable` | 设备解锁，加密保护的文件可以读了 | `protectedDataAvailable` | **未在模拟器验证** |
| `protecteddataunavailable` | 设备即将锁屏，加密保护的文件将读不了 | `protectedDataAvailable` | **未在模拟器验证** |
| `backgroundrefreshstatuschange` | 用户改了后台刷新的设置 | `backgroundRefreshStatus` | **未在模拟器验证** |
| `reducedresourceusagechange` | 系统对资源消耗的建议变了。只在 iOS 27 及以上派发 | `prefersReducedResourceUsage` | **未在模拟器验证** |
| `beforeterminate` | 系统即将结束 App | — | **未在模拟器验证** |

#### 错误类事件

这两个事件由运行时自己派发，`cancelable` 是 `true`。调 `preventDefault()` 的效果是运行时不再输出默认的错误日志。

| 事件 | 事件对象 | 什么时候派发 | 默认日志 |
| --- | --- | --- | --- |
| `error` | [`ErrorEvent`](#errorevent) | 脚本顶层或定时器回调里抛出了没被捕获的异常 | 以 `Uncaught` 开头，错误级别 |
| `unhandledrejection` | [`PromiseRejectionEvent`](#promiserejectionevent) | 一个 Promise 被拒绝，并且到上报时仍然没有挂处理函数 | 以 `Uncaught (in promise)` 开头，错误级别 |

- 定时器回调里的异常触发 `error` **未在模拟器验证**。脚本顶层的验证过。
- 事件监听器里抛出的异常不触发 `error`，见 [`dispatchEvent()`](#dispatchevent)。
- `error` 的监听器执行期间又抛出的异常不会再次触发 `error`。
- `unhandledrejection` 不是在拒绝发生的那一刻派发的。运行时把上报排到任务队列的末尾，所以拒绝之后用 `setTimeout(fn, 0)` 补挂处理函数来得及，不会被上报。见[定时器](timers.md)。

### 事件对象

#### `Event`

所有事件对象的基类。可以用 `new Event(type, { cancelable })` 自己构造。

| 成员 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `type` | 字符串 | 是 | 否 | 事件名 |
| `cancelable` | 布尔 | 是 | 否 | `true`：`preventDefault()` 有效。`false`：`preventDefault()` 没有效果。构造时不传就是 `false` |
| `target` | `EventTarget` 或 `null` | 是 | 否 | 事件派发到的对象。还没派发过是 `null` |
| `currentTarget` | `EventTarget` 或 `null` | 是 | 否 | 和 `target` 相同，因为没有冒泡 |
| `defaultPrevented` | 布尔 | 是 | 否 | `true`：有监听器调过 `preventDefault()` 并且生效了 |

| 方法 | 效果 |
| --- | --- |
| `preventDefault()` | `cancelable` 是 `true` 时把 `defaultPrevented` 设为 `true`。`cancelable` 是 `false` 时什么都不做，不报错 |
| `stopImmediatePropagation()` | 同一个对象上排在后面的监听器不再执行 |
| `stopPropagation()` | 什么都不做。因为没有冒泡 |

- **出错**：构造时没传事件名：`TypeError: Failed to construct 'Event': 1 argument required, but only 0 present.`

#### `ErrorEvent`

`error` 事件的事件对象。除 `Event` 的成员外还有：

| 字段 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `message` | 字符串 | 是 | 否 | 错误的摘要文字，由引擎生成 |
| `error` | `unknown` | 是 | 否 | 抛出来的那个值。通常是 `Error` 对象，但 JS 允许抛出任何值，所以用之前要判断 |
| `filename` | 字符串 | 是 | 否 | 出错的脚本名，例如 `'main.js'` |
| `lineno` | 数字 | 是 | 否 | 出错的行号 |

`filename` 和 `lineno` 指向打包后的 `main.js`，不是打包前的源文件。要找到出错的代码，打开打包产物看这一行。

#### `PromiseRejectionEvent`

`unhandledrejection` 事件的事件对象。除 `Event` 的成员外还有：

| 字段 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `reason` | `unknown` | 是 | 否 | 拒绝的原因。通常是 `Error` 对象，但可以是任何值 |
| `promise` | `Promise` 或 `undefined` | 是 | 否 | 被拒绝的那个 Promise。运行时派发的事件里一定有值；自己构造事件而没传时是 `undefined` |

#### `OpenURLEvent`

`openurl` 事件的事件对象。除 `Event` 的成员外还有：

| 字段 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `url` | 字符串 | 是 | 否 | 系统给的完整地址，原样，例如 `'myapp://orders/42?ref=mail'`。运行时不解析它，要拆开用 [`new URL(e.url)`](url.md) |
| `scene` | [`UIWindowScene`](ui-window-scene.md) | 是 | 否 | 系统把这个地址交给了哪个场景。和 `sceneconnect` 给的是同一个对象，可以用 `===` 比 |
| `sourceApplication` | 字符串或 `null` | 是 | 否 | 来源 App 的包名。系统不提供时是 `null`：通用链接一律是 `null`；自定义协议只有来源 App 和本 App 属于同一个开发者团队时才有值（这一条来自 Apple 的文档，**未验证**） |

运行时派发的 `openurl`，`cancelable` 是 `false`。

可以用 `new OpenURLEvent(type, { url, scene, sourceApplication })` 自己构造，用来在测试里模拟一次打开。`url` 和 `scene` 必填，`sourceApplication` 不传是 `null`。

```js
application.addEventListener('sceneconnect', (e) => {
  application.dispatchEvent(new OpenURLEvent('openurl', {
    url: 'myapp://orders/42',
    scene: e.scene,
  }));
});
```

**效果**：`openurl` 的监听器被调用一次，`e.url` 是 `'myapp://orders/42'`，`e.sourceApplication` 是 `null`。系统那边什么都不发生。

- **出错**：没传 `url`：`TypeError: Failed to construct 'OpenURLEvent': url is required`
- **出错**：`scene` 没传或者不是场景：`TypeError: Failed to construct 'OpenURLEvent': scene must be a UIWindowScene`

## 与 iOS 原生写法的对照

`application` 不是 `UIApplication` 的逐项映射。它把 iOS 里分散在几处的 App 级能力放在一个对象上。这张表供对照 Apple 的文档或 iOS 的示例代码时查 JS 的写法。

| ObjC | JS |
| --- | --- |
| `NSBundle.mainBundle.infoDictionary` | `application.info` |
| `NSBundle.mainBundle.bundleIdentifier` | `application.bundleIdentifier` |
| `UIApplication.sharedApplication.applicationState` | `application.state` |
| `UIApplication.sharedApplication.connectedScenes` | `application.scenes` |
| `UIApplication.sharedApplication.supportsMultipleScenes` | `application.supportsMultipleScenes` |
| `UIApplication.sharedApplication.userInterfaceLayoutDirection` | `application.layoutDirection` |
| `UIApplication.sharedApplication.preferredContentSizeCategory` | `application.contentSizeCategory` |
| `UIApplication.sharedApplication.backgroundRefreshStatus` | `application.backgroundRefreshStatus` |
| `UIApplication.sharedApplication.protectedDataAvailable` | `application.protectedDataAvailable` |
| `UIApplication.sharedApplication.idleTimerDisabled = YES` | `application.idleTimerDisabled = true` |
| `[UIApplication.sharedApplication openURL:url options:@{} completionHandler:…]` | `application.openURL(url)` |
| `NSUserDefaults.standardUserDefaults` | `application.storage` |
| `UISceneWillConnectNotification` | `application.addEventListener('sceneconnect', …)` |
| `UISceneDidDisconnectNotification` | `application.addEventListener('scenedisconnect', …)` |
| `scene:openURLContexts:` | `application.addEventListener('openurl', …)` |
| `scene:continueUserActivity:`，活动类型是 `NSUserActivityTypeBrowsingWeb` | `application.addEventListener('openurl', …)` |
| `scene:willConnectToSession:options:` 里 `connectionOptions` 的 `URLContexts` 和 `userActivities` | 同一个 `openurl`，在 `sceneconnect` 之后派发 |
| `UIOpenURLContext.URL`、`NSUserActivity.webpageURL` | `e.url` |
| `UIOpenURLContext.options.sourceApplication` | `e.sourceApplication` |
| Info.plist 的 `CFBundleURLTypes` | `nacre.config.json` 的 `ios.urlSchemes` |
| `UIApplicationDidBecomeActiveNotification` | `application.addEventListener('active', …)` |
| `UIApplicationWillResignActiveNotification` | `application.addEventListener('inactive', …)` |
| `UIApplicationDidEnterBackgroundNotification` | `application.addEventListener('background', …)` |
| `UIApplicationWillEnterForegroundNotification` | `application.addEventListener('foreground', …)` |
| `UIApplicationDidReceiveMemoryWarningNotification` | `application.addEventListener('memorywarning', …)` |
| `UIApplicationUserDidTakeScreenshotNotification` | `application.addEventListener('screenshot', …)` |
| `UIApplicationSignificantTimeChangeNotification` | `application.addEventListener('significanttimechange', …)` |
| `UIContentSizeCategoryDidChangeNotification` | `application.addEventListener('contentsizecategorychange', …)` |
| `UIApplicationProtectedDataDidBecomeAvailable` | `application.addEventListener('protecteddataavailable', …)` |
| `UIApplicationProtectedDataWillBecomeUnavailable` | `application.addEventListener('protecteddataunavailable', …)` |
| `UIApplicationBackgroundRefreshStatusDidChangeNotification` | `application.addEventListener('backgroundrefreshstatuschange', …)` |
| `UIApplicationWillTerminateNotification` | `application.addEventListener('beforeterminate', …)` |

## 与浏览器的对照

这张表供熟悉浏览器 API 的人查对应关系。

| 浏览器 | Nacre |
| --- | --- |
| `window.addEventListener('error', …)` | `application.addEventListener('error', …)` |
| `window.addEventListener('unhandledrejection', …)` | `application.addEventListener('unhandledrejection', …)` |
| `document.visibilityState` 和 `visibilitychange` | `application.state` 和四个前后台事件 |
| `navigator.wakeLock.request('screen')` | `application.idleTimerDisabled = true` |
| `addEventListener()` 的 `capture`、`passive`、`signal` 选项 | 没有。只有 `once` |
| 监听器可以是带 `handleEvent()` 的对象 | 不可以。只能是函数 |
| `rejectionhandled` 事件 | 没有 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 进后台后申请一段时间把工作做完 | `beginBackgroundTaskWithName:expirationHandler:` | 未实现 |
| 知道进后台后还能执行多久 | `backgroundTimeRemaining` | 未实现 |
| 打开 URL 时带选项，比如只允许通用链接 | `openURL:options:` 的 `options` | 未实现 |
| 打开之前先问系统能不能打开某个 URL | `canOpenURL:` | 不提供。直接调 `openURL()`，按兑现的值判断 |
| 知道用户点了哪一条推送通知 | `UNUserNotificationCenterDelegate` | 未实现 |
| 接着别的设备上做到一半的事继续做（接力），或者从系统搜索的结果打开 | `scene:continueUserActivity:` 里通用链接以外的活动类型 | 未实现。这些活动现在不派发任何事件 |
| 读链接附带的其他信息 | `UISceneOpenURLOptions` 的 `annotation`、`openInPlace` | 未实现 |
| 读系统语言和地区 | `NSLocale` | 未实现 |
| 把字体大小档位读成 `'large'` 这类统一的名字 | `UIContentSizeCategory` 的映射 | 未实现。现在是 iOS 的原始字符串 |
| 拒绝已经上报之后才补挂处理函数时得到更正通知 | Web 的 `rejectionhandled` | 未实现 |
| 锁定或读取屏幕方向 | `UIWindowScene.effectiveGeometry` | 未实现 |
| 收到内存警告时让运行时自己也释放内存 | — | 未实现。现在只派发 `memorywarning` 事件 |

## 参见

- [运行时怎么工作](how-it-works.md)：代码怎么执行、事件什么时候派发
- [`UIWindowScene`](ui-window-scene.md)：`sceneconnect` 给出的场景对象、启动代码的推荐组织方式、场景自己的前后台事件
- [外观特征](ui-trait-collection.md)：深色还是浅色、屏幕几倍
- [`UIDevice`](ui-device.md)：设备型号和系统版本
- [`UIWindow`](ui-window.md)：完整例子里建的窗口
- [`UIViewController`](ui-view-controller.md)：完整例子里建的页面
- [配置 App](../guides/project-config.md#声明自定义协议)：声明自定义协议和通用链接的域名，`openurl` 才收得到
- [`URL`](url.md)：拆开 `openurl` 给的地址
- [本地存储](storage.md)：`application.storage`
- [文件读写](filesystem.md)：`application.fileSystem`
- [Keychain](keychain.md)：`application.keychain`，要先装 `@nacrejs/keychain`
- [原生模块](native-modules.md)：`application.nativeModules`，调 App 自己的和第三方的原生代码
- [定时器](timers.md)：`unhandledrejection` 的上报时机和它有关
- [实现原理：运行时](../internals/runtime.md)：`application` 怎么实现、验证结果
- [实现原理：事件](../internals/events.md)：事件模型的取舍
- [实现原理：被链接打开](../internals/open-url.md)：`openurl` 怎么接的、依赖哪些系统行为
