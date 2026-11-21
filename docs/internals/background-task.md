# 后台任务

`application.runBackgroundTask(work, { name })` 和 `application.backgroundTimeRemaining`。2026-11-21 做的。这是上层 API（我们定义的），形状和用户讨论过。

文件：`ios/Runtime/Bridge/NacreBackgroundTask.mm`、`ios/Runtime/Builtin/parts/55-background-task.js`、`packages/types/ios/background-task.d.ts`、`acceptance/src/steps/background-task.js`。

## 形状：传一个函数，而不是拿一个对象

UIKit 是一对调用：`beginBackgroundTaskWithName:expirationHandler:` 拿一个号，做完 `endBackgroundTask:` 交回去；系统快到时间时调过期的 block，那时必须交回去，不交 App 会被杀。

两种 JS 写法比过：

| | 传一个函数 | 照 UIKit 拿一个对象 |
| --- | --- | --- |
| 写法 | `await application.runBackgroundTask(async (signal) => {…}, { name })` | `const task = application.beginBackgroundTask({ name })`，做完 `task.end()`，过期时 `task` 上来 `expire` 事件 |
| 忘了结束 | 不会：work 的 Promise 落定就结束 | 会：忘了 `end()`，任务一直占着到系统来收 |
| 过期 | `signal` 中止，`fetch` 这类收 `signal` 的接口直接停 | 要自己在 `expire` 里停 |

定的是前者（2026-11-21 用户选的）。形状和 Web 的 `navigator.locks.request(name, fn)` 一样：调用方的函数决定占多久。

## 过期时当场进 JS

过期的 block 是系统在调用里执行、执行完就要把号交回去的，所以用 `NacreCallBlock` 当场调回 JS：JS 在里面中止 `signal`（`abort` 事件的监听器跟着同步跑），回到原生之后马上 `endBackgroundTask:`，不等 work 的 Promise。这和[事件能不能取消](events.md)里「系统这一刻正在做一件 JS 要跟着做的事，当场派发」是同一类。

`signal.reason` 是名字为 `TimeoutError` 的 `Error`。Web 上是 `DOMException`，我们没有那个类，和 `AbortSignal.timeout()` 的做法一致。

## 原生只做三件事，走类方法的通道

`application` 是上层对象，原生那一侧没有对应的实例。三个操作挂在类方法的通道上（`classCall`，类名用 `UIApplication`）：开始、结束、读剩余时间。这样不用碰核心里 `application` 那套 `native.*` 的函数，一个域的文件就装得下。

还没交回去的号记在一个集合里：work 先做完、交过号之后，过期的 block 再来也不会调回 JS；结束同一个号两次是空操作。

`backgroundTimeRemaining` 在前台系统给的是 `DBL_MAX`。JSON 里写不了 `Infinity`（[动画那边踩过](ca-animation.md)），原生给 `null`，JS 换成 `Infinity`。

## 参数错是拒绝，不是同步抛

返回 Promise 的方法，参数类型不对时照 Web IDL 的约定变成拒绝的 Promise：work 不是函数、options 不是对象，都是以 `TypeError` 拒绝。work 同步抛也一样变成拒绝。

## 没验证的

自动跑的验收一直在前台。切到后台之后 work 继续跑、快到时间时 `signal` 中止、系统一开始就不给时间（`signal` 一开始就是中止的）、`backgroundTimeRemaining` 在后台的读数，都要把 App 切到后台等半分钟，没验。记在 `project.md` 第 7 节「欠的验证」。
