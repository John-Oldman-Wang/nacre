# 全局对象 `application`

`application` 是 Nacre 注入全局的 **App 实例**，代表当前运行的这个 App 本身。浏览器里没有对应物——页面不是 App——所以这是我们自己定义的概念。

它管 **App 级**的状态、事件和能力；**窗口和界面不在这里，属于 scene**。这个分工是刻意对照浏览器 `document` / `location` / `navigator` 的职责分离做的。

> 本章是**上层 API**，由 Nacre 定义，面向 JS 开发者。底层的 `UIApplication` 仍可通过裸暴露直接拿到，两者并存，不是替代关系。

## 继承关系

```
EventTarget
  └─ Application
       └─ application（唯一实例）
```

`EventTarget` 和 `Event` 不是 ECMAScript 的一部分，V8 不提供，由 Nacre 实现并注入全局。

## 构造

`application` 由运行时在 Context 建好时创建并注入，**JS 侧不能再构造**：

```js
new Application()   // TypeError: Illegal constructor
```

抛 `TypeError` 而不是返回同一实例，和 Web 平台对不可构造接口的处理一致（`new Navigator()` 同样抛 `Illegal constructor`），避免「以为拿到了新对象」的误解。

## 实例属性

未注明的均为**只读**。「状态」一列同时表达设计和实现两个维度：

- **已实现**——设计已确认，代码已跑通并验证
- **已实现·未验证**——代码已接线，但还没单独跑过用例
- **已定·未实现**——设计已确认，还没写
- **建议**——推荐方案，未确认
- **待定**——方案还没选定

## 应用信息

| 属性 | 类型 | 说明 | 状态 |
| --- | --- | --- | --- |
| `info` | object | `NSBundle.mainBundle.infoDictionary` 的只读深冻结快照。**三者互不相同**：`App/Info.plist` 源文件 13 个键（含 `$(PRODUCT_BUNDLE_IDENTIFIER)` 这类未展开变量）→ 产物 Info.plist 25 个键（变量已解析，Xcode 注入了 `MinimumOSVersion`、`DTPlatformVersion` 等）→ 运行时 `infoDictionary` **26 个键**，Foundation 额外算出一个 `CFBundleNumericVersion`。暴露的是最后这份 | 已实现 |
| `bundleIdentifier` | string | 等价于 `info.CFBundleIdentifier`，常用所以给快捷方式 | 已实现 |
| `version` | string | 等价于 `info.CFBundleShortVersionString` | 已实现 |
| `build` | string | 等价于 `info.CFBundleVersion` | 已实现 |

## 运行状态

| 属性 | 类型 | 说明 | 对应 iOS | 状态 |
| --- | --- | --- | --- | --- |
| `state` | `'active'` \| `'inactive'` \| `'background'` | 当前前后台状态，用字符串而非数字枚举 | `applicationState` | 已实现 |

> `backgroundTimeRemaining` 是**连续变化**的值，快照没有意义。早先 JS 在独立线程时这是个死结（实时读必须在主线程同步取）；**JS 迁到主线程后这个障碍消失了**，可以在 getter 里直接读。只是还没做。
| `backgroundTimeRemaining` | number | 进入后台后还可执行的秒数 | 同名 | 可实现，待做 |
| `protectedDataAvailable` | boolean | 锁屏期间文件不可读，此时为 `false` | 同名 | 已实现 |

## 环境与偏好

| 属性 | 类型 | 说明 | 对应 iOS | 状态 |
| --- | --- | --- | --- | --- |
| `supportsMultipleScenes` | boolean | **实际能力**＝声明 AND 环境允许。要读**声明值**用 `info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes`——两者含义不同，运行时都提供，不替 JS 合并 | 同名 | 已实现 |
| `scenes` | array | 当前已连接的场景，单场景时长度为 1 | `connectedScenes` | 已定·未实现 |
| `layoutDirection` | `'ltr'` \| `'rtl'` | 界面方向 | `userInterfaceLayoutDirection` | 已实现 |
| `contentSizeCategory` | string | 用户设置的字体大小（动态字体）。**目前原样透出系统值**，形如 `UICTContentSizeCategoryL` | `preferredContentSizeCategory` | 已实现 |
| `prefersReducedResourceUsage` | boolean | 系统建议降低资源消耗。iOS 27 才有，更低版本读到 `false` | `systemPrefersReducedResourceUsage` | 已实现 |
| `backgroundRefreshStatus` | `'available'` \| `'denied'` \| `'restricted'` | 用户是否允许后台刷新 | 同名 | 已实现 |

## 可写

| 属性 | 类型 | 说明 | 状态 |
| --- | --- | --- | --- |
| `idleTimerDisabled` | boolean | 设为 `true` 阻止设备自动锁屏。**写入是异步的**（要切主线程），刚写完立刻读可能还是旧值；读到的始终是原生的真实值 | 已实现 |

> 这个名字是双重否定，不好用。能力导向的替代是 Web 的 Screen Wake Lock 模式：`const lock = await application.requestWakeLock()` / `lock.release()`，还能配合 `using` 自动释放（`DisposableStack` 在我们的内置里）。两种方案待定。

## 实例方法

| 方法 | 返回 | 说明 | 状态 |
| --- | --- | --- | --- |
| `openURL(url, options?)` | `Promise<boolean>` | 打开 URL：跳 Safari、拨号、跳别的 App。URL 非法或系统拒绝时兑现为 `false`，不 reject。`options` 目前没有可透传的键，先占位 | 已实现 |
| `runInBackground(name, fn)` | `Promise` | 申请后台执行时间来跑 `fn`，结束后自动归还 | 建议 |

> `runInBackground` 是「能力导向而非实现导向」的例子。iOS 的原形 `beginBackgroundTaskWithName:expirationHandler:` 返回一个 identifier，必须手动配对调用 `endBackgroundTask:`，忘了调会被系统杀进程。包成接收函数的形式后，配对由运行时保证。
>
> **不提供 `canOpenURL`**：iOS 27 已废弃，官方建议直接尝试打开并处理失败。

## 事件

事件名**全小写无分隔**，与 Web 惯例一致。

**所有原生派发的事件 `cancelable` 均为 `false`**。JS 虽然和 UIKit 同在主线程，但原生通知到达时运行时会把派发**延后一轮**执行，避免在 UIKit 操作中途重入 JS——所以派发方（通知中心）早已返回，拿不到 `preventDefault()` 的结果。而且这些通知本来就没有可取消的默认行为。JS 自己 `dispatchEvent` 的事件不受此限。

| 事件 | 触发时机 | 对应 iOS | 状态 |
| --- | --- | --- | --- |
| `memorywarning` | 内存吃紧，应主动释放缓存 | `DidReceiveMemoryWarning` 通知 | 已实现 |
| `screenshot` | 用户截屏 | `UserDidTakeScreenshot` 通知 | 已实现·未验证 |
| `significanttimechange` | 跨午夜、时区变更、夏令时切换 | 同名通知 | 已实现·未验证 |
| `contentsizecategorychange` | 用户改了系统字体大小 | 同名通知 | 已实现·未验证 |
| `protecteddataavailable` / `protecteddataunavailable` | 设备解锁 / 锁屏 | 同名通知 | 已实现·未验证 |
| `backgroundrefreshstatuschange` | 用户改了后台刷新权限 | 同名通知 | 已实现·未验证 |
| `reducedresourceusagechange` | 系统的资源消耗建议变了（iOS 27+） | `SystemPrefersReducedResourceUsageDidChange` | 已实现·未验证 |
| `willterminate` | App 即将被系统终止 | `UIApplicationWillTerminateNotification` | 已实现·未验证 |

### 错误类事件

这两个事件由运行时**在 JS 的执行栈里同步派发**（异常和未处理拒绝都是运行时自己检测到的），派发方拿得到返回值，所以**可以取消**——调 `preventDefault()` 就不会再打运行时的默认日志。

| 事件 | 事件对象 | 触发时机 | 状态 |
| --- | --- | --- | --- |
| `error` | `ErrorEvent` | 脚本里有未捕获的异常 | 已实现 |
| `unhandledrejection` | `PromiseRejectionEvent` | 微任务排空后仍然没有 handler 的 Promise 拒绝 | 已实现 |

`ErrorEvent` 的字段：`message`、`error`（抛出的值本身）、`filename`、`lineno`。
`PromiseRejectionEvent` 的字段：`reason`、`promise`。

```js
application.addEventListener('error', (e) => {
  上报崩溃(e.message, e.filename, e.lineno, e.error);
  e.preventDefault();          // 不再打运行时的默认日志
});

application.addEventListener('unhandledrejection', (e) => {
  上报崩溃(e.reason);
  e.preventDefault();
});
```

没有监听器、或者监听器没调 `preventDefault()` 时，运行时照常把错误打到 `console.error`。

### 前后台事件

| 事件 | 对应 iOS 通知 | 触发时 `state` 的值 | 状态 |
| --- | --- | --- | --- |
| `inactive` | `WillResignActive` | 仍是 `'active'` | 已实现 |
| `background` | `DidEnterBackground` | 已是 `'background'` | 已实现 |
| `foreground` | `WillEnterForeground` | 仍是 `'background'` | 已实现 |
| `active` | `DidBecomeActive` | 已是 `'active'` | 已实现 |

**注意时序**：`inactive` 和 `foreground` 对应 iOS 的 `Will*` 通知，意思是「**即将**」，此时 `state` 读到的还是**旧值**；`background` 和 `active` 对应 `Did*`，状态已经变了。事件名取了最短的形式，时序差别以本表为准。

`Will*` 的时机恰恰最有用——进后台**之前**存状态、停工作，比进去之后再做更可靠。

App 启动时也会走一遍 `foreground` → `active`。

> Apple 废弃的是 `UIApplicationDelegate` 的前后台**方法**，`UIApplication` 的**通知**没有废弃，所以 App 级走通知是正道。等 scene 对象做好之后，scene 级事件管「这个窗口」，这里管「所有场景的聚合状态」，两者并存。

## 示例

> 下面用到的 `openURL` 和 `runInBackground` 还没实现，是设计示意。其余都是当前可用的。

```js
// 读取应用信息
console.log(application.bundleIdentifier, application.version);

// 按运行环境决定 UI，而不是按设备型号猜
if (application.supportsMultipleScenes) {
  // 做多窗口布局
}

// 监听内存警告
application.addEventListener('memorywarning', () => {
  缓存.clear();
});

// 一次性监听
application.addEventListener('screenshot', onShot, { once: true });

// 异步能力统一返回 Promise
const ok = await application.openURL('https://example.com');

// 后台任务，生命周期自动配对
await application.runInBackground('上传日志', async () => {
  await 上传();
});
```

## 设计说明

- **为什么不叫 `window`**：`UIWindow` 在 iOS 里是真实存在的另一个东西（scene 里的窗口容器），会撞名。浏览器的 `window` 同时是全局对象和窗口对象，是历史债，不值得模仿
- **为什么不叫 `app`**：`app` 是 JS 里最常见的局部变量名之一，被遮蔽的概率高
- **命名不照搬 ObjC**：上层面向 JS 开发者，用 `state` 而不是 `applicationState`，用 `layoutDirection` 而不是 `userInterfaceLayoutDirection`。要 ObjC 原名的话，底层裸暴露里有
- **异步一律 Promise**：不提供 completion handler 形态的重载

## 实现说明

- **JS 跑在主线程**，和 UIKit 同线程。理由和代价见[项目说明第 3 节](../project.md)。
- **上层 API 在内置 JS 里定义**。`EventTarget`、`Event`、`Application` 都写在 `ios/Runtime/Builtin/nacre.js`，由 iOS 层在 `main.js` **之前**执行。不用 C++ 的 `FunctionTemplate`，因为那样每个实例要在 internal field 上挂 C++ 监听器表，里面的 `v8::Global<Function>` 是强引用，必须用 weak callback 在对象被 GC 时手动释放——漏了就是回调永不释放。JS 实现交给 GC 全自动。Node 的 `EventTarget` 同样是 JS 实现的（`node:internal/event_target`）。
- **脚本名用 `nacre:internal/nacre.js`**，不是文件路径。这样调用栈里一眼能看出哪些帧是运行时内部，和 Node 的 `node:internal/…` 一个做法。实测效果：

  ```
  at Application.<anonymous> (main.js:97:51)                     ← 用户代码
  at Application.dispatchEvent (nacre:internal/nacre.js:95:28)   ← 运行时内部
  at main.js:99:13                                               ← 用户代码
  ```

- **C++ 只提供一个极小的数据桥**。`Engine` 在 Context 上装 `globalThis.__nacre_native`，只有 4 个取值函数（`infoJSON`、`state`、`supportsMultipleScenes`、`setEventSink`）。内置脚本用完**立即 `delete`**，用户代码完全拿不到——实测 `typeof __nacre_native` 为 `undefined`、不在 `globalThis` 上、`getOwnPropertyNames` 也找不到。
- **环境值走快照**。`info` 启动时抓一次；其余实时值在相关通知到达时重建成一份 JSON，JS 读取时解析。JS 现在和 UIKit 同线程，本可以直接读，保留快照是为了一次拿齐、少几次 UIKit 往返。
- **`state` 启动时读到的是 `background`**，不是 `inactive`——scene 生命周期下，`didFinishLaunchingWithOptions:` 执行时场景还没连接。场景激活后才变成 `active`。
- **原生事件的投递**：`NSNotificationCenter` 观察者 → `dispatch_async` 到主队列延后一轮 → `Engine::EmitAppEvent` → 内置脚本注册的入口 → `application.dispatchEvent`。延后一轮是为了不在 UIKit 操作中途重入 JS。单向，不等结果。

## 验证结果

2026-11-07 在 iPhone 18 Pro / iOS 27.2 模拟器上全部跑通：

- `application instanceof EventTarget` 为 `true`，`new Application()` 抛 `TypeError: Illegal constructor`
- `info` 读到 26 个键并深度冻结；`bundleIdentifier`、`version`、`build` 正确
- 多场景的**声明值**与**实际能力**都读到 `false`，两者分别取自 `info` 和 `UIApplication`
- `EventTarget`：重复注册只触发一次、移除后不再触发、`once` 只触发一次、监听器抛异常不影响后续监听器也不冒到派发方
- `preventDefault()`：JS 自己派发且 `cancelable: true` 时生效（`dispatchEvent` 返回 `false`）；`cancelable: false` 时静默失效（返回 `true`）
- **错误出口**：`error` 和 `unhandledrejection` 都能收到；`preventDefault()` 后运行时的默认日志确实消失，不调则照常输出。`ErrorEvent` 的 `message` / `filename` / `lineno` / `error` 和 `PromiseRejectionEvent` 的 `reason` / `promise` 都正确
- **JS 发起的异步调用**走 Promise：C++ 用 `v8::Promise::Resolver` 当场造一个 Promise 返回给 JS，同时把 resolver 按 id 存起来；iOS 层执行（像 `openURL` 那样本身就带 `completionHandler` 的，要等系统回调），完成后兑现。兑现时不在任何 JS 调用栈里，`kAuto` 不会自动排空微任务，所以要显式调一次 `PerformMicrotaskCheckpoint()`，否则 `await` 后面的代码会一直卡住。
- **实时环境值每次读取都重新向原生要一份 JSON 并解析**。这些值变化稀疏、读取不频繁，先用最简单的做法；连续读多个属性会重复解析，成为热点再优化。
- `openURL` 返回真正的 Promise：合法 URL 兑现 `true`，非法 URL 兑现 `false`；兑现发生在 `main.js` 执行结束**之后**，证明微任务检查点生效
- `idleTimerDisabled` 写入异步生效：刚写完读到旧值，稍后读到 `true`
- **前后台事件**：按 HOME 键再切回来，依次收到 `inactive` → `background` → `foreground` → `active`，且每个事件到达时 `state` 的值符合上表（`Will*` 类事件读到旧值）
- 新增的环境属性都读到了合理值（`protectedDataAvailable`、`layoutDirection`、`contentSizeCategory`、`backgroundRefreshStatus`、`prefersReducedResourceUsage`）
- 原生桥 `__nacre_native` 在内置脚本执行后彻底消失：`typeof` 为 `undefined`、不在 `globalThis` 上、`getOwnPropertyNames` 也找不到
- **原生事件链路**：在模拟器的设备菜单选 Simulate Memory Warning，JS 收到 `memorywarning`，`target === application`、`cancelable === false`（这条命令行触发不了——UIKit 的内存警告走 SimulatorKit 的 mach 消息，不是 Darwin 通知，试过的几个 `notifyutil` 名字都无效）
- **状态快照随通知更新**：启动时 `state` 为 `background`，场景激活后读到 `active`

## 待定

- `Application.prototype` 的最终能力范围（上表标「建议」的都未确认）
- `idleTimerDisabled` 用属性还是 WakeLock 模式
- `contentSizeCategory` 要不要归一化。现在原样透出 `UICTContentSizeCategoryL` 这种系统内部表示，按「能力导向」应该映射成 `small` / `large` / `accessibilityExtraLarge` 之类，但要维护一张对照表
- `backgroundTimeRemaining` 怎么给（见上）
- scene 对象的 API：属性、事件、以及和 `UIWindowScene` 的关系
- 事件对象用 `Event` 还是带 `detail` 的 `CustomEvent`
- 要不要暴露 `delegate` 这类底层逃生舱

---

← 返回 [API 总览](README.md) ・ [项目说明](../project.md)
