---
type: reference
native: "-[UIApplicationDelegate application:didReceiveRemoteNotification:fetchCompletionHandler:]"
---

# `RemoteNotifications`：`push` 事件

**`push`** 事件在一条静默推送到了时派发。静默推送是内容里带 `"content-available": 1` 的远程推送：系统不展示任何东西，唤醒 App，让它在后台做一件事，比如拉一次新数据。

## 语法

```
application.remoteNotifications.addEventListener('push', (event) => { })
```

## 事件对象

[`PushEvent`](../push-event.md)，一个 `Event`，多一个字段和一个方法：

**`data`**

推送的内容：服务器发来的整个 JSON 对象，包括 `aps`。见 [`data`](../push-event/data.md)。

**`waitUntil(promise)`**

让系统等这件事做完，做完的结果告诉系统。见 [`waitUntil()`](../push-event/waituntil.md)。

不可取消。

## 什么时候派发

- 一条带 `"content-available": 1` 的推送到了时派发。App 要在 `nacre.config.json` 的 `ios.infoPlist` 里写 `"UIBackgroundModes": ["remote-notification"]`，见[静默推送](../../guides/push-notifications.md#静默推送)。
- App 在后台时，系统唤醒它，再派发这个事件。App 没在运行时，系统在后台启动它，入口文件执行完之后派发。**未在真机验证。**
- **监听器要在入口文件的顶层同步加上。** App 被一条静默推送启动时，监听器加晚了（写在 `sceneconnect` 里、写在某个 `await` 之后），这一条推送按「没有新数据」处理，之后加的监听器也收不到它。**未在真机验证。**
- 没有监听器时不派发，系统得到「没有新数据」（实测）。
- 用户在多任务界面里把 App 划掉之后，静默推送不再唤醒它，直到用户再打开 App。这一条来自 Apple 的文档，**未在真机验证**。
- 系统会限制静默推送的次数，不保证每一条都送到。Apple 的文档建议一小时不超过两三条。**未在真机验证。**

监听器里调 `waitUntil()` 的结果怎么变成系统得到的结果，见 [`PushEvent`](../push-event.md#系统得到的结果)。

## 示例

```js
const push = application.remoteNotifications;

async function refreshOrders() {
  const response = await fetch('https://api.example.com/orders', {
    signal: AbortSignal.timeout(20000),
  });
  application.storage.set('orders', await response.text());
}

push.addEventListener('push', (event) => {
  console.log('静默推送', JSON.stringify(event.data));
  event.waitUntil(refreshOrders());
});
```

**效果**（**未在真机验证**）：服务器发来 `{"aps":{"content-available":1}}` 时，App 在后台被唤醒，输出 `静默推送 {"aps":{"content-available":1}}`，然后拉一次订单存起来。请求成功，系统得到「有新数据」；请求失败或者超过 20 秒，系统得到「失败了」。

事件对象的形状和三种结果在验收用例里验证过，用例里推送到达的那一步是模拟的。

## 对应的 iOS API

App 委托的 `application:didReceiveRemoteNotification:fetchCompletionHandler:`。参数 `userInfo` 是 `event.data`；`completionHandler` 不由 JS 调，由 `waitUntil()` 收下的 Promise 决定传什么。

## 参见

- [`PushEvent`](../push-event.md)
- [远程推送](../../guides/push-notifications.md#静默推送)：静默推送要写的配置、服务器怎么发
- 这个类属于 `@nacrejs/push` 包，装法见[要先安装](../remote-notifications.md#要先安装)
