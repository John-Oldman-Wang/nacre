---
type: reference
native: "-[UIApplication beginBackgroundTaskWithName:expirationHandler:]"
---

# `Application`：`runBackgroundTask()` 方法

**`runBackgroundTask()`** 方法运行一个函数，并在它运行期间向系统多要一段时间：App 这时切到后台，系统不会马上暂停它，而是等这个函数做完，或者给的时间用完。

App 进入后台后，系统会在一小段时间之后暂停它：JS 不再执行，定时器不再触发，见 [`background`](background-event.md) 事件。上传一个文件、把数据写完这类已经开始、需要几秒钟才能做完的事，用这个方法包起来，切到后台也能做完。

## 语法

```
runBackgroundTask(work)
runBackgroundTask(work, { name })
```

### 参数

**`work`**

函数。运行时立刻调用它一次，传给它一个 [`AbortSignal`](../abort-signal.md)。它可以直接返回一个值，也可以返回一个 Promise（比如是 `async` 函数）。它返回的 Promise 落定的时候，这个任务就结束。

**`options.name`**

可选。任务的名字，调试时在系统的日志里能看到。不是字符串的值按 `String()` 转。不带时任务没有名字。

`options` 整个是 `null` 或 `undefined` 时，等于不带。

### 返回值

`Promise`，兑现成 `work` 的返回值（`work` 返回 Promise 时，兑现成那个 Promise 兑现的值）。

- `work` 返回的 Promise 被拒绝，返回的 Promise 以同一个错误拒绝（实测）。
- `work` 同步抛出异常，方法本身不抛，返回的 Promise 以那个异常拒绝（实测）。
- 系统给的时间用完时，返回的 Promise 不会因此拒绝，仍然等 `work` 落定。

### 异常

不同步抛出。参数不对时，返回的 Promise 以 **`TypeError`** 拒绝（实测）：

`work` 不是函数，或者没有传：

```
TypeError: runBackgroundTask needs a function, got "upload"
```

`options` 不是对象，也不是 `null` 或 `undefined`：

```
TypeError: runBackgroundTask options must be an object, got 5
```

## 说明

- **多给的时间由系统决定**，一般在 30 秒左右，不保证。剩下多少秒从 [`backgroundTimeRemaining`](backgroundtimeremaining.md) 读。
- **时间快用完时，`work` 拿到的 `signal` 被中止**，`signal.reason` 是一个 [`DOMException`](../dom-exception.md)，`name` 是 `'TimeoutError'`，`code` 是 23。运行时随即结束这个任务，不再等 `work`。之后系统随时可能暂停 App，`work` 里还没执行的部分要等 App 回到前台才继续。`work` 要监听 `signal`，收到中止就停下手里的事，或者把 `signal` 直接交给 [`fetch()`](../fetch.md)，请求会被取消。**未在真机验证。**
- **系统一开始就不给时间时**（App 已经快被暂停了），`work` 照样运行，`signal` 一开始就是中止的，`reason` 同样是 `'TimeoutError'`。**未在真机验证。**
- 在前台做完时 `signal` 不会中止（实测）。App 一直在前台的话，任务随 `work` 做完而结束，不需要别的处理。
- 可以同时运行几个，各自独立结束（实测）。
- 切到后台之后 App 继续运行、做完后正常结束这一整段，**未在真机验证**。

## 示例

### 进入后台时把草稿传完

```js
/** @type {string} */
let draft = '';

application.addEventListener('background', () => {
  application.runBackgroundTask(async (signal) => {
    await fetch('https://example.com/api/drafts', {
      method: 'POST',
      body: draft,
      signal,
    });
  }, { name: 'upload-draft' }).catch((err) => {
    console.log('草稿没有传完：' + (err instanceof Error ? err.name : String(err)));
  });
});
```

**效果**：用户回到主屏幕后，App 继续运行到请求完成，再被系统暂停。时间用完还没传完时，请求被取消，控制台输出 `草稿没有传完：AbortError`：请求进行中被取消时，`fetch()` 抛出的是 `AbortError`，不是 `signal.reason`。**未在真机验证。**

### 拿到 `work` 的返回值

```js
application.runBackgroundTask(async (signal) => {
  console.log(signal.aborted);
  return 42;
}).then((value) => {
  console.log(value);
});
```

**结果**：在前台运行时，控制台先输出 `false`，再输出 `42`。

## 对应的 iOS API

`-[UIApplication beginBackgroundTaskWithName:expirationHandler:]` 和 `-[UIApplication endBackgroundTask:]`。两个调用合成了一个方法：开始时运行时调前者，`work` 落定时调后者，不需要自己保存任务号、记着交回去。`expirationHandler` 换成了 `signal` 的中止。

## 参见

- [`backgroundTimeRemaining`](backgroundtimeremaining.md)：还剩多少秒
- [`background`](background-event.md)：App 进入后台
- [`AbortSignal`](../abort-signal.md)：`work` 拿到的 `signal`
- [处理 App 的生命周期](../../guides/app-lifecycle.md)
