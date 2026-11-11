---
type: reference
native: UIApplication
status: partial
---

# 全局对象 `application`

`application` 代表正在运行的这个 App。它是运行时放在全局的一个对象，类是 `Application`，整个 App 只有这一个实例。

它管三类东西：App 的信息（名字、版本）、App 的状态（在前台还是后台）、App 级的事件（启动后可以建界面了、内存不足、有没处理的异常）。

它的地位接近浏览器里的 `window` 全局对象加 `navigator`，有四点不同：

- **没有 `window`、`document`、`location`、`history`。** JS 打包在 App 里，从本地加载，没有网址。
- **界面不在 `application` 上。** 界面属于「场景」，见[场景](#场景)。`application` 只负责通知你场景已经可用。
- **事件名和 Web 相同的只有两个**：`error` 和 `unhandledrejection`。其余事件是 iOS 特有的。
- **`application` 不能自己构造。** `new Application()` 会抛错，和 `new Navigator()` 一样。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

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

- 控制台先输出三行。用本仓库的 App 运行时是：
  - `包名 com.orbitlabs.nacre.dev`
  - `版本 0.1.0 构建号 1`
  - `场景个数 0`
- 随后屏幕从黑色变成系统背景色：浅色模式下是白色，深色模式下是黑色。
- 控制台输出 `界面建好了，场景个数 1`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

三件事要记住：

- **界面代码必须写在 `sceneconnect` 的回调里。** 脚本开始执行时 `application.scenes` 是空数组，没有场景就建不了能显示的窗口。
- **监听器要在脚本顶层注册。** 运行时保证 `main.js` 执行完之后才派发 `sceneconnect`，所以在顶层注册一定来得及。
- 回调里那五行的含义见 [`UIWindow`](ui-window.md) 和 [`UIViewController`](ui-view-controller.md)。

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

`e.scene` 是系统刚接入的场景，类型是 [`UIWindowScene`](ui-window-scene.md)。在回调里它和 `application.scenes` 里的第一个元素是同一个对象。

### 读 App 的名字和版本

```js
console.log(application.bundleIdentifier);
console.log(application.version);
console.log(application.build);
console.log(application.info.CFBundleDisplayName);
```

**效果**：用本仓库的 App 运行时，控制台依次输出 `com.orbitlabs.nacre.dev`、`0.1.0`、`1`、`Nacre`。

- `bundleIdentifier` 是包名：App 在系统里的唯一标识，写法像倒过来的域名。
- `version` 是给用户看的版本号。`build` 是构建号，同一个版本可以有多个构建。
- App 的显示名称没有单独的属性，从 `info` 里读，见下一节。**`CFBundleDisplayName` 读到 `Nacre` 未在模拟器验证**，值来自工程配置。

### 读 Info.plist 里的任意字段

Info.plist 是每个 iOS App 自带的配置文件，记录包名、版本、支持的方向等。它的作用类似 Web 的 `manifest.json` 加 `package.json` 里的 `name` 和 `version`。`application.info` 是它的全部内容。

```js
console.log(Object.keys(application.info).length);
console.log(application.info.MinimumOSVersion);
console.log(Object.isFrozen(application.info));
```

**效果**

- 第一行输出键的个数。本仓库的 App 是 `26`。
- 第二行输出 App 要求的最低系统版本，是一个字符串。
- 第三行输出 `true`。`info` 和它里面的每一层对象都是冻结的，写入会抛 `TypeError`。

`info` 里每个值的类型声明是 `unknown`，因为运行时不知道你的 Info.plist 里有什么。读嵌套的字段要自己判断类型：

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

`inactive` 和 `foreground` 表示「即将」，所以这两个事件到达时 `state` 还是旧值。要在进后台之前保存数据，监听 `inactive`。

App 启动时也会依次派发 `foreground` 和 `active`。

### 收到内存警告时释放缓存

内存警告是 iOS 的机制：设备内存不足时，系统先通知各个 App 释放内存，仍然不够才结束 App。Web 里没有对应的事件。

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

事件名和 Web 的 `window.onerror` / `error` 事件相同。字段见 [`ErrorEvent`](#errorevent)。

> **注意**：脚本顶层抛出的异常会让 `main.js` 剩下的代码不再执行。`error` 事件只是通知你，不会恢复执行。

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

事件名和 Web 的 `unhandledrejection` 相同。字段见 [`PromiseRejectionEvent`](#promiserejectionevent)。

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

### 读设备的环境设置

```js
console.log(application.layoutDirection);
console.log(application.contentSizeCategory);
console.log(application.backgroundRefreshStatus);
console.log(application.protectedDataAvailable);
```

**效果**：控制台输出四行，每行是当前设备上的值。例如系统语言是从左往右书写、字体大小是默认档时，前两行是 `ltr` 和 `UICTContentSizeCategoryL`。**后两行的具体值未在模拟器验证**，取值范围见[环境与偏好](#环境与偏好)。

- `layoutDirection`：界面的书写方向。相当于 CSS 的 `direction`。
- `contentSizeCategory`：用户在系统设置里选的字体大小档位。
- `backgroundRefreshStatus`：用户是否允许 App 在后台刷新内容。
- `protectedDataAvailable`：加密保护的文件现在能不能读。设备锁屏期间是 `false`。

读不到的环境信息见[还不能做的](#还不能做的)，包括深色还是浅色、系统语言。

### 让屏幕保持常亮

iOS 在一段时间没有触摸后会自动锁屏。播放视频、显示二维码时可以关掉这个行为。

```js
application.idleTimerDisabled = true;
console.log(application.idleTimerDisabled);
```

**效果**：控制台输出 `true`。App 在前台期间设备不再自动锁屏。**「不再自动锁屏」未在模拟器验证。**

用完设回 `false`。相当于 Web 的 Screen Wake Lock，写法不同：这里是一个布尔属性。

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

`application` 上有三个存数据的入口，各有自己的文档：

| 属性 | 存什么 | 文档 |
| --- | --- | --- |
| `application.storage` | 设置、小状态。键值对，同步读写 | [本地存储](storage.md) |
| `application.fileSystem` | 文件。全部返回 Promise | [文件读写](filesystem.md) |
| `application.keychain` | 令牌和密码，加密保存。全部返回 Promise | [Keychain](keychain.md) |

```js
application.storage.set('theme', 'dark');
console.log(application.storage.get('theme'));
```

**效果**：控制台输出 `dark`。关掉 App 再打开，这个值还在。

### 派发自己的事件

`application` 可以当作 App 内的事件中心使用，和 Web 的 `EventTarget` 写法相同。

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

`EventTarget` 和 `Event` 不是 JS 语言自带的，由运行时提供，名字和基本用法与 Web 相同。有三点不同：

- 没有捕获和冒泡。事件只派发给注册了监听器的那个对象。
- `addEventListener()` 的选项只有 `once`，没有 `passive`、`capture`、`signal`。
- 监听器只能是函数，不能是带 `handleEvent` 方法的对象。

## 场景

场景（scene）是 iOS 里「App 的一个界面实例」，类是 [`UIWindowScene`](ui-window-scene.md)。窗口必须建在某个场景里才能显示。它大致相当于浏览器的一个标签页：同一个 App 可以有多个场景，各自有自己的窗口。iPhone 上通常只有一个。

场景由系统创建，JS 不能构造。拿到场景有两个途径：

| 途径 | 什么时候有值 |
| --- | --- |
| `sceneconnect` 事件的 `e.scene` | 事件派发时 |
| `application.scenes` | `sceneconnect` 派发之后。脚本刚开始执行时是空数组 |

所以界面代码的入口固定是 `sceneconnect`。

`application` 和场景的分工：

| | 管什么 |
| --- | --- |
| `application` | 整个 App：信息、所有场景合在一起的前后台状态、内存警告、错误 |
| 场景 | 一个界面实例：它的窗口、它自己的前后台状态 |

## 前台、后台和运行状态

iOS 的 App 不是一直在运行。用户回到主屏幕或切到别的 App 时，当前 App 进入后台，系统随后可能暂停它，也可能直接结束它。Web 里最接近的是 `document.visibilityState`，区别是 iOS 的后台 App 会被暂停执行。

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
| `bundleIdentifier` | 字符串 | 是 | 否 | `'com.orbitlabs.nacre.dev'` | 包名。等于 `info.CFBundleIdentifier` |
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
| `idleTimerDisabled` | 布尔 | 是 | 是 | `false` | `true`：设备不自动锁屏。`false`：按系统设置自动锁屏 | 没有。只有你的代码能改它 |

写入立刻生效，写完马上读得到新值。写入非布尔值时按 JS 的真假值规则转换。

### 存储

这三个属性每次读到的都是同一个对象。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `storage` | `NSUserDefaults` | 是 | 否 | 键值存储。见[本地存储](storage.md) |
| `fileSystem` | `FileSystem` | 是 | 否 | 文件读写。见[文件读写](filesystem.md) |
| `keychain` | `Keychain` | 是 | 否 | 令牌和密码的加密存储。见 [Keychain](keychain.md) |

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

- **参数** `type`：事件名，见[事件](#事件)。也可以是你自己定的名字。
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
- 一个监听器抛出异常，不影响后面的监听器，也不会从 `dispatchEvent()` 抛出来。运行时用 `console.error` 输出一条以 `Event listener threw:` 开头的日志。这种异常不会触发 `error` 事件。
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
| `sceneconnect` | 系统接入了一个场景。App 启动后会派发一次 | `scene`：接入的 [`UIWindowScene`](ui-window-scene.md) |
| `scenedisconnect` | 系统断开了一个场景 | `scene`：断开的 [`UIWindowScene`](ui-window-scene.md) |

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
| `willterminate` | 系统即将结束 App | — | **未在模拟器验证** |

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

`filename` 和 `lineno` 指向打包后的 `main.js`，不是你的源文件。

#### `PromiseRejectionEvent`

`unhandledrejection` 事件的事件对象。除 `Event` 的成员外还有：

| 字段 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `reason` | `unknown` | 是 | 否 | 拒绝的原因。通常是 `Error` 对象，但可以是任何值 |
| `promise` | `Promise` 或 `undefined` | 是 | 否 | 被拒绝的那个 Promise。运行时派发的事件里一定有值；自己构造事件而没传时是 `undefined` |

## 与 iOS 原生写法的对照

`application` 不是 `UIApplication` 的逐项映射。它把 iOS 里分散在几处的 App 级能力放在一个对象上。如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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
| `UIApplicationWillTerminateNotification` | `application.addEventListener('willterminate', …)` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 进后台后申请一段时间把工作做完 | `beginBackgroundTaskWithName:expirationHandler:` | 未实现 |
| 知道进后台后还能执行多久 | `backgroundTimeRemaining` | 未实现 |
| 打开 URL 时带选项，比如只允许通用链接 | `openURL:options:` 的 `options` | 未实现 |
| 打开之前先问系统能不能打开某个 URL | `canOpenURL:` | 不提供。直接调 `openURL()`，按兑现的值判断 |
| 接收别的 App 或网页传给本 App 的 URL（深链接） | `scene:openURLContexts:` | 未实现 |
| 读当前是深色还是浅色，并在切换时得到通知 | `UITraitCollection` | 未实现 |
| 读系统语言和地区 | `NSLocale` | 未实现 |
| 读屏幕的像素倍数 | `UIScreen.scale` | 未实现 |
| 把字体大小档位读成 `'large'` 这类统一的名字 | `UIContentSizeCategory` 的映射 | 未实现。现在是 iOS 的原始字符串 |
| 拒绝已经上报之后才补挂处理函数时得到更正通知 | Web 的 `rejectionhandled` | 未实现 |
| 锁定或读取屏幕方向 | `UIWindowScene.effectiveGeometry` | 未实现 |

## 参见

- [`UIWindowScene`](ui-window-scene.md)：`sceneconnect` 给出的场景对象，以及场景自己的前后台事件
- [`UIWindow`](ui-window.md)：完整例子里建的窗口
- [`UIViewController`](ui-view-controller.md)：完整例子里建的页面
- [本地存储](storage.md)：`application.storage`
- [文件读写](filesystem.md)：`application.fileSystem`
- [Keychain](keychain.md)：`application.keychain`
- [定时器](timers.md)：`unhandledrejection` 的上报时机和它有关
- [实现原理：运行时](../internals/runtime.md)：`application` 怎么实现、验证结果
- [实现原理：事件](../internals/events.md)：事件模型的取舍
