---
type: reference
native: "fetchCompletionHandler"
---

# `PushEvent`：`waitUntil()` 方法

**`waitUntil()`** 方法让系统等一个 Promise 落定，再根据它的结果回答系统这条静默推送处理得怎样。

## 语法

```
waitUntil(promise)
```

### 参数

**`promise`**

要等的 Promise，通常是一个 `async` 函数调用的返回值。给的不是 Promise 时，当成一个已经兑现的 Promise（实测）。

### 返回值

无（`undefined`）。

### 异常

**`InvalidStateError`**

一个 `Error`，`name` 是 `'InvalidStateError'`。在派发结束之后调用时抛出：

```
waitUntil must be called while the push event is being dispatched
```

## 说明

**只能在监听器里同步调。** `push` 的监听器全部执行完，派发就结束了。监听器写成 `async` 函数、在 `await` 之后才调 `waitUntil()`，那时派发已经结束，调用抛 `InvalidStateError`（实测），系统得到「没有新数据」。要等的事写成一个 `async` 函数，在监听器里马上调它，把它返回的 Promise 交给 `waitUntil()`。

**可以调好几次。** 一个监听器里调几次、几个监听器各调一次都可以。系统等它们全部落定：全部兑现得到「有新数据」，有一个被拒绝得到「失败了」（实测）。一次都没调得到「没有新数据」。

**系统等的时间有限。** Apple 的文档说大约 30 秒。Promise 要在那之前落定，网络请求设一个更短的超时。**未在真机验证。**

## 示例

```js
const push = application.remoteNotifications;

async function sync() {
  const response = await fetch('https://api.example.com/inbox', {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  application.storage.set('inbox', await response.text());
}

push.addEventListener('push', (event) => {
  event.waitUntil(sync());
});
```

**效果**（**未在真机验证**）：一条静默推送到了时拉一次收件箱。请求成功并存好，系统得到「有新数据」；请求失败、服务器返回错误或者超过 20 秒，系统得到「失败了」。

下面是不对的写法：

```js
const push = application.remoteNotifications;
push.addEventListener('push', async (event) => {
  const response = await fetch('https://api.example.com/inbox');
  event.waitUntil(response.text());
});
```

**效果**：`waitUntil()` 在 `await` 之后才调，抛 `InvalidStateError`。系统没有等这次请求，在派发结束时就得到了「没有新数据」。

## 对应的 iOS API

`application:didReceiveRemoteNotification:fetchCompletionHandler:` 的 `completionHandler`。ObjC 里 App 自己在做完时调它，传 `UIBackgroundFetchResultNewData`、`UIBackgroundFetchResultFailed` 或 `UIBackgroundFetchResultNoData`；这里由 `waitUntil()` 收下的 Promise 决定传哪一个。

## 参见

- [`PushEvent`](../push-event.md#系统得到的结果)：结果怎么算
- [`push`](../remote-notifications/push-event.md)
