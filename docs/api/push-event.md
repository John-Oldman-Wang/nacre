---
type: reference
native: "-[UIApplicationDelegate application:didReceiveRemoteNotification:fetchCompletionHandler:]"
status: partial
---

# `PushEvent`

**`PushEvent`** 表示一条到达的静默推送。它是 [`application.remoteNotifications`](remote-notifications.md) 上 [`push`](remote-notifications/push-event.md) 事件的事件对象，带着推送的内容，并让 App 告诉系统：处理这条推送的事什么时候做完、结果怎样。

系统唤醒 App 处理静默推送时，给的时间有限。App 用 [`waitUntil()`](push-event/waituntil.md) 把要做的事交给它，系统就等这件事做完，再根据结果安排 App 回到暂停状态。

它属于 `@nacrejs/push` 这个包，装法见 [`RemoteNotifications`](remote-notifications.md#要先安装)。

**继承关系**：[`Event`](event.md) → `PushEvent`

## 构造函数

[`PushEvent()`](push-event/constructor.md)

静默推送到了时，运行时创建它，派发给 `push` 的监听器。App 的代码也可以自己建一个，派发出去试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性。`data` 是只读的，给它赋值抛 `TypeError`。它在原型上，不在事件对象自己身上，`Object.keys(event)` 拿不到它，见[带字段的事件](event.md#带字段的事件)。

| 属性 | 说明 |
| --- | --- |
| [`data`](push-event/data.md) <small>只读</small> | 推送的内容：服务器发来的整个 JSON 对象，包括 `aps` |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`waitUntil()`](push-event/waituntil.md) | 让系统等一个 Promise 落定，用它的结果回答系统 |

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`RemoteNotifications`](remote-notifications.md) | [`push`](remote-notifications/push-event.md) |

不能取消：`cancelable` 是 `false`（实测）。

## 系统得到的结果

派发完之后，运行时等这次派发里 `waitUntil()` 收下的全部 Promise 落定，再把结果告诉系统：

| 监听器做了什么 | 系统得到的结果 |
| --- | --- |
| 调了 `waitUntil()`，给的 Promise 全部兑现 | 有新数据 |
| 调了 `waitUntil()`，给的 Promise 有一个被拒绝 | 失败了 |
| 没有调 `waitUntil()` | 没有新数据 |
| 没有 `push` 监听器 | 没有新数据 |

表里四种情况都在验收用例里验证过，用例里推送到达的那一步是模拟的。

- 给 `waitUntil()` 的不是 Promise 时，当成一个已经兑现的 Promise（实测）。
- **系统等的时间有限。** Apple 的文档说大约 30 秒。给网络请求设一个更短的超时，保证 Promise 在那之前落定。**未在真机验证。**

## 示例

```js
const push = application.remoteNotifications;
push.addEventListener('push', (event) => {
  console.log(event instanceof PushEvent, event.cancelable);
  event.waitUntil(new Promise((resolve) => setTimeout(resolve, 1000)));
});
```

**效果**：一条静默推送到了时，输出 `true false`。一秒后系统得到「有新数据」。推送到达和后台唤醒**未在真机验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `application:didReceiveRemoteNotification:fetchCompletionHandler:` 的参数 `userInfo` | `event.data` |
| `completionHandler(UIBackgroundFetchResultNewData)` | `waitUntil()` 收下的 Promise 全部兑现 |
| `completionHandler(UIBackgroundFetchResultFailed)` | 其中有一个被拒绝 |
| `completionHandler(UIBackgroundFetchResultNoData)` | 没有调 `waitUntil()` |

## 参见

- [`push`](remote-notifications/push-event.md)：什么时候派发
- [远程推送](../guides/push-notifications.md#静默推送)：静默推送要写的配置、监听器写在哪里
