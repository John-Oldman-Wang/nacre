# 处理 App 的生命周期

这一篇讲 App 从启动到进后台、回前台、内存不足这一路上，代码写在哪里：建界面、保存数据、释放缓存、让屏幕常亮、在 App 的各部分之间传消息。用到的都在全局对象 [`application`](../api/application.md) 上。建窗口的细节见[建窗口和处理场景](scenes-and-windows.md)。

## 推荐的做法

- **建界面的代码写在 [`sceneconnect`](../api/application/sceneconnect-event.md) 的回调里，监听器在 `main.js` 顶层注册。** 运行时先把整个 `main.js` 执行完，系统随后才创建场景。事件不会补发：等某个 Promise 兑现之后才注册，可能已经错过了。
- **需要保留的数据在 [`background`](../api/application/background-event.md) 里保存完。** 写进 [`application.storage`](../api/storage.md)，它的写入是同步的。不要等 [`beforeterminate`](../api/application/beforeterminate-event.md)：App 在后台被结束时它不一定派发。
- **收到 [`memorywarning`](../api/application/memorywarning-event.md) 时丢掉能重新得到的数据。** 运行时不替 App 决定扔掉什么；监听器执行完之后，运行时会让 JS 引擎回收一次，监听器里放掉的对象这时就被回收。
- **App 范围内共享的数据放在模块自己的变量里，不挂在 `application` 上。** `application` 是一个普通的 JS 对象，可以往上面加属性，但类型定义里没有这些属性，每次读写都要转型；`application` 在 App 运行期间一直存在，挂在上面的东西永远不会被回收。场景、窗口、页面尤其不要挂上去。

## 第一个 App

从空白 App 开始：打印 App 的信息，等系统准备好之后建窗口和页面。

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

回调可能执行不止一次：系统销毁场景后又重建时，`sceneconnect` 再派发一次。回调里每次都用 `e.scene` 从头建一遍界面，见[建窗口和处理场景](scenes-and-windows.md#推荐的做法)。

## 读 App 的名字和版本

```js
console.log(application.bundleIdentifier);
console.log(application.version);
console.log(application.build);
console.log(application.info.CFBundleDisplayName);
```

**效果**：控制台依次输出包名、版本号、构建号、App 的名字，比如 `com.example.shop`、`0.1.0`、`1`、`Shop`。这四个值来自项目的 [`nacre.config.json`](project-config.md)。App 的名字读到什么**未在模拟器验证**。

App 的显示名称没有单独的属性，从 [`info`](../api/application/info.md) 里读。

## 知道 App 进后台和回前台

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

`inactive` 和 `foreground` 表示「即将」，所以这两个事件到达时 `state` 还是旧值。`inactive` 不只在进后台之前派发：来电、下拉通知中心时也会派发，随后 App 可能直接回到活动状态。App 启动时也会依次派发 `foreground` 和 `active`。

## 进入后台时保存数据

```js
application.addEventListener('background', () => {
  application.storage.set('draft', '写到一半的内容');
});
```

**效果**：每次进入后台时把草稿存进本地存储。App 之后被系统结束，下次打开时能读到它。

进入后台后，系统会在一小段时间之后暂停 App：JS 不再执行，定时器不再触发。用户回到 App 时从暂停的地方继续，JS 里的变量都还在。系统也可能在后台直接结束 App，这时不会有任何通知，下次打开时 `main.js` 从头执行。**这几条来自 iOS 的定义，未在模拟器验证。** 所以要保留的东西在 `background` 里写进存储。进入后台后申请更多执行时间的能力还没有。

## 收到内存警告时释放缓存

```js
/** @type {Map<string, string>} */
const cache = new Map();

application.addEventListener('memorywarning', () => {
  cache.clear();
  console.log('缓存已清空');
});
```

**效果**：系统发出内存警告时，控制台输出 `缓存已清空`。

在模拟器里触发：设备菜单里选 Simulate Memory Warning。该丢的是可以重新得到的数据：缓存的图片、已经解析好但还能再解析的数据、不在屏幕上的页面。

## 让屏幕保持常亮

iOS 在一段时间没有触摸后会自动锁屏。播放视频、显示二维码时可以关掉这个行为。

```js
application.idleTimerDisabled = true;
```

**效果**：App 在前台期间设备不再自动锁屏。**未在模拟器验证。**

这个设置对整个 App 生效，不会自动恢复。离开需要常亮的页面时设回 `false`，否则设备在 App 位于前台期间一直不锁屏，耗电增加。

## 读设备的环境设置

```js
console.log(application.layoutDirection);
console.log(application.contentSizeCategory);
console.log(application.backgroundRefreshStatus);
console.log(application.protectedDataAvailable);
```

**效果**：控制台输出四行，每行是当前设备上的值。例如系统语言是从左往右书写、字体大小是默认档时，前两行是 `ltr` 和 `UICTContentSizeCategoryL`。**后两行的具体值未在模拟器验证。**

深色还是浅色、屏幕是几倍的，不在 `application` 上，从场景或视图的 `traitCollection` 读，见[外观特征](../api/ui-trait-collection.md)。设备型号和系统版本见 [`UIDevice`](../api/ui-device.md)。系统语言还读不到。

## 保存数据

`application` 上有两个存数据的入口，装了 `@nacrejs/keychain` 之后有第三个：

| 属性 | 存什么 | 文档 |
| --- | --- | --- |
| [`application.storage`](../api/application/storage.md) | 设置、小状态。键值对，同步读写 | [本地存储](../api/storage.md) |
| [`application.fileSystem`](../api/application/filesystem.md) | 文件。全部返回 Promise | [文件读写](../api/filesystem.md) |
| [`application.keychain`](../api/application/keychain.md) | 令牌和密码，加密保存。全部返回 Promise。**要先装 `@nacrejs/keychain`**，没装时这个属性不存在 | [Keychain](../api/keychain.md) |

```js
application.storage.set('theme', 'dark');
console.log(application.storage.get('theme'));
```

**效果**：控制台输出 `dark`。关掉 App 再打开，这个值还在。

## 在 App 的各部分之间传消息

`application` 可以监听和派发自己定义的事件。事件名可以是任意字符串，只要不和[已有的事件名](../api/application.md#事件)相同。App 里互不引用的两部分代码可以用它互相通知。

```js
application.addEventListener('login', (e) => {
  console.log('收到', e.type);
});

application.dispatchEvent(new Event('login'));
```

**效果**：`dispatchEvent()` 返回之前，控制台输出 `收到 login`。

自己派发的事件是同步的。要让监听器能取消它，构造时传 `{ cancelable: true }`，见 [`dispatchEvent()`](../api/event-target/dispatchevent.md)。不想经过 `application` 时，也可以 `new EventTarget()` 建一个自己的。

## 参见

- [`Application`](../api/application.md)：`application` 的全部成员
- [建窗口和处理场景](scenes-and-windows.md)
- [统一处理错误](handle-errors.md)
- [处理打开 App 的链接](open-links.md)
